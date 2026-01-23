import { useState, useRef, useEffect } from 'react';
import { number } from 'yup';
import { verifyCode } from '../../../lib/handleAccount';
import { useNavigate } from 'react-router';
import { useAppDataAPI } from '../AppContext';

import { Loading } from '../../utils/Loading';
import { ResetPasswordModal } from './ResetPasswordModal';
import { ResendVerificationCodeButton } from './ResendVerificationCodeButton';

// Styles
import styles from './verificationCodeModal.module.css';
import formStyles from '../../../styles/form.module.css';
import modalStyles from '../../../styles/modal.module.css';

interface PropTypes {
	email: string;
	codeExpireAfter: number;
}

export const VerificationCodeModal = ({
	email,
	codeExpireAfter,
}: PropTypes) => {
	const [code, setCode] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [failCount, setFailCount] = useState(0);
	const { onModal } = useAppDataAPI();
	const timer = useRef<NodeJS.Timeout>(null);
	const navigate = useNavigate();

	const handleVerifyCode = async () => {
		if (failCount >= 3) {
			onModal({
				component: (
					<div className={styles.modal}>
						<h3 className={styles.title}>Verify code failed</h3>
						<p className={styles.content}>
							You have entered an incorrect verification code too many times.
							Please try resetting password again using a new code.
						</p>
					</div>
				),
				clickToClose: true,
			});
			return;
		}

		setIsLoading(true);
		const controller = new AbortController();
		try {
			const response = await verifyCode(controller.signal, code, email);

			if (response.data.success) {
				const sessionExpireAfter = Number(response.headers.get('Expire-After'));

				onModal({
					component: (
						<ResetPasswordModal
							email={email}
							sessionExpireAfter={sessionExpireAfter}
						/>
					),
					clickToClose: false,
				});
			} else {
				setErrorMessage('Code is invalid.');
				setFailCount(failCount + 1);
			}
		} catch {
			navigate('/error');
			onModal({
				component: null,
			});
		}
		setIsLoading(false);
	};

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (isLoading) return;

		const { value } = e.currentTarget;

		if (!(await number().integer().min(0).max(999999).isValid(+value.trim()))) {
			setErrorMessage('Code must be 6-digit numbers.');
			return;
		}

		setCode(value);
		setErrorMessage('');

		if (value.length === 6) {
			e.target.blur();
			await handleVerifyCode();
		}
	};

	useEffect(() => {
		timer.current = setTimeout(() => {
			onModal({
				component: (
					<div className={modalStyles.modal}>
						<h3 className={modalStyles.title}>Verification code expired</h3>
						<p className={modalStyles.content}>
							The verification code is expired. Please try resetting password
							again using a new code.
						</p>
					</div>
				),
				clickToClose: true,
			});
		}, codeExpireAfter);

		return () => clearTimeout(timer.current as NodeJS.Timeout);
	}, [onModal, codeExpireAfter]);

	return (
		<>
			{isLoading && <Loading text={'Verifying...'} shadow={true} blur={true} />}
			<div className={modalStyles.modal}>
				<h3 className={modalStyles.title}>Enter your validation code</h3>
				<p className={modalStyles.content}>
					If your email address:
					<span className={styles.email}> {email} </span>
					is registered, we will send a validation code to that email address,
					please enter the 6-digit code to reset your password.
				</p>
				<div>
					<label className={formStyles.label} htmlFor="code">
						Code
						<input
							className={`${modalStyles.input} ${errorMessage !== '' ? formStyles['input-error'] : ''}`}
							id="code"
							type="text"
							name="code"
							title="Enter the 6-digit verify code."
							value={code}
							onChange={handleChange}
							spellCheck="false"
							autoCapitalize="off"
							autoCorrect="off"
							autoComplete="off"
							autoFocus={true}
						/>
					</label>
				</div>
				<div className={styles['modal-bottom']}>
					<ResendVerificationCodeButton email={email} />
					<div
						className={`${styles.error} ${formStyles['error-message']} ${errorMessage ? formStyles['error-message-active'] : ''}`}
					>
						<span className={`${formStyles.icon} ${formStyles.alert}`} />
						<p className={formStyles.message} data-testid="errorMessage">
							{errorMessage}
						</p>
					</div>
				</div>
			</div>
		</>
	);
};
