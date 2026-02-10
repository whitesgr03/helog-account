import { useState, useEffect } from 'react';
import { formatDistanceStrict } from 'date-fns';
import { useNavigate } from 'react-router';

import { requestVerificationCode } from '../../../lib/handleAccount';

// Styles
import styles from './VerificationCodeModal.module.css';
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
	const { onModal, onAlert } = useAppDataAPI();
	const navigate = useNavigate();

	const handleRequestVerificationCode = async () => {
		if (timeRemaining <= 0) {
			const controller = new AbortController();
			setIsLoading(true);
			try {
				const result = await requestVerificationCode(controller.signal, email);
				setIsLoading(false);
				if (result.success) {
					const countdown = 30;
					const startTime = Date.now();

					setTimeRemaining(countdown);
					const timer = setInterval(() => {
						const currentTime = Date.now();
						const diff =
							countdown - Math.trunc((currentTime - startTime) / 1000);
						setTimeRemaining(diff);

						if (diff <= 0) {
							clearInterval(timer);
						}
					}, 1000);
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
		const countdown = 10;
		const startTime = Date.now();
		const timer = setInterval(() => {
			const currentTime = Date.now();
			const diff = countdown - Math.trunc((currentTime - startTime) / 1000);
			setTimeRemaining(diff);
			if (diff <= 0) clearInterval(timer);
		}, 1000);
		return () => clearInterval(timer as NodeJS.Timeout);
	}, []);

	return (
		<div className={styles.resend}>
			{isLoading ? (
				<p>
					Sending ...
					<span
						className={`${imageStyles.icon} ${imageStyles['desktop-size']} ${loadingStyles.load}`}
					/>
				</p>
			) : (
				<button
					className={formStyles.link}
					onClick={handleRequestVerificationCode}
				>
					Resend code{timeRemaining > 0 && ` (${timeRemaining}s)`}
				</button>
			)}
		</div>
	);
};
