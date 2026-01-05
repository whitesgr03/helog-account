import { useState, useEffect } from 'react';
import { formatDistanceStrict } from 'date-fns';
import { useNavigate } from 'react-router';

import { requestVerificationCode } from '../../../lib/handleAccount';

// Styles
import styles from './verificationCodeModel.module.css';
import formStyles from '../../../styles/form.module.css';
import loadingStyles from '../../utils/Loading.module.css';
import imageStyles from '../../../styles/image.module.css';

// Context
import { useAppDataAPI } from '../AppContext';

interface Props {
	email: string;
}

export const ResendVerificationCodeButton = ({ email }: Props) => {
	const [isLoading, setIsLoading] = useState(false);
	const [timeRemaining, setTimeRemaining] = useState(10);
	const [countdownStarted, setCountdownStarted] = useState(false);
	const [countdownTime, setCountdownTime] = useState(
		() => Date.now() + 10 * 1000,
	);
	const { onModal, onAlert } = useAppDataAPI();
	const navigate = useNavigate();

	const handleRequestVerificationCode = async () => {
		if (!countdownStarted) {
			const controller = new AbortController();
			try {
				setIsLoading(true);

				const result = await requestVerificationCode(controller.signal, email);

				setIsLoading(false);
				if (result.success) {
					setCountdownTime(Date.now() + 30 * 1000);
					setCountdownStarted(true);
					setTimeRemaining(30);

					onAlert([
						{
							message: `The new verification code is send to your email.`,
							error: false,
							delay: 4000,
						},
					]);
					return;
				} else {
					navigate('/error');
				}
			} catch (error) {
				if (
					error instanceof Error &&
					error.cause instanceof Response &&
					error.cause.status === 429
				) {
					const currentDate = new Date();
					const retryAfterDate = new Date(
						+currentDate + Number(error.cause.headers.get('Retry-After')),
					);
					const retryAfter = formatDistanceStrict(currentDate, retryAfterDate);

					onAlert([
						{
							message: `You have tried to get verification code too many times. Please try again in ${retryAfter}.`,
							error: true,
							delay: 5000,
						},
					]);
				} else {
					navigate('/error');
				}
			}
			onModal({
				component: null,
			});
		}
	};

	useEffect(() => {
		if (countdownStarted) {
			const countdownTimer = setInterval(() => {
				const currentTime = Date.now();

				const remainingTime = countdownTime - currentTime;
				setTimeRemaining(new Date(remainingTime).getSeconds() + 1);

				if (remainingTime <= 0) {
					clearInterval(countdownTimer as NodeJS.Timeout);
					setCountdownStarted(false);
				}
			}, 1000);
			return () => clearTimeout(countdownTimer as NodeJS.Timeout);
		}
	}, [countdownStarted, countdownTime]);

	return (
		<>
			{isLoading ? (
				<p>
					Sending ...
					<span
						className={`${imageStyles.icon} ${imageStyles['desktop-size']} ${loadingStyles.load}`}
					/>
				</p>
			) : (
				<button
					className={`${styles.resend} ${formStyles.link}`}
					onClick={handleRequestVerificationCode}
				>
					Resend code{countdownStarted ? ` (${timeRemaining}s)` : ''}
				</button>
			)}
		</>
	);
};
