import { useState, useRef, useEffect } from 'react';
import { number } from 'yup';
import { verifyCode } from '../../../lib/handleAccount';
import { useNavigate } from 'react-router';
import { useAppDataAPI } from '../AppContext';

import { Loading } from '../../utils/Loading';
import { ResetPasswordModel } from './ResetPasswordModel';
import { ResendVerificationCodeButton } from './ResendVerificationCodeButton';

// Styles
import styles from './verificationCodeModel.module.css';
import formStyles from '../../../styles/form.module.css';
import modelStyles from '../../../styles/model.module.css';

interface PropTypes {
	email: string;
	codeExpireAfter: number;
}

export const VerificationCodeModel = ({
	email,
	codeExpireAfter,
}: PropTypes) => {
	const [code, setCode] = useState(['', '', '', '', '', '']);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [failCount, setFailCount] = useState(0);
	const { onModal } = useAppDataAPI();
	const timer = useRef<NodeJS.Timeout>(null);
	const navigate = useNavigate();

	const inputRefs = [
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
	];

	const handleVerifyCode = async (newCode: string[]) => {
		if (!isLoading) {
			if (failCount >= 3) {
				onModal({
					component: (
						<div className={styles.model}>
							<h3 className={styles.title}>Verify code failed</h3>
							<p className={styles.content}>
								You have entered an incorrect verification code too many times.
								Please try resetting password again using a new code.
							</p>
						</div>
					),
					clickToClose: true,
				});
			} else {
				setIsLoading(true);
				const controller = new AbortController();
				try {
					const response = await verifyCode(
						controller.signal,
						newCode.join(''),
						email,
					);

					if (response.data.success) {
						const sessionExpireAfter = Number(
							response.headers.get('Expire-After'),
						);

						onModal({
							component: (
								<ResetPasswordModel
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
			}
		}
	};

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.currentTarget;

		if (await number().integer().isValid(+value)) {
			if (value !== '' && +id !== code.length - 1) {
				const nextInputElement = inputRefs[+id + 1].current;
				nextInputElement?.focus();
			}
			const newCode = [...code];
			newCode[+id] = value;
			setCode(newCode);

			if (newCode.join('').length === 6) {
				await handleVerifyCode(newCode);
			}
		}
	};
	const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
		const pasteText = e.clipboardData.getData('text');

		if (await number().min(100000).max(999999).isValid(+pasteText)) {
			const newCode = pasteText.split('');
			setCode(newCode);

			const lastInputElement = inputRefs[inputRefs.length - 1].current;
			lastInputElement?.focus();

			await handleVerifyCode(newCode);
		}
	};
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const { key } = e;

		if (key === 'Backspace' || key === 'Delete') {
			const { id, value } = e.currentTarget;
			if (value === '' && +id - 1 >= 0) {
				const previousInputElement = inputRefs[+id - 1].current;
				previousInputElement?.focus();
			}
		}
	};

	useEffect(() => {
		timer.current = setTimeout(async () => {
			onModal({
				component: (
					<div className={modelStyles.model}>
						<h3 className={modelStyles.title}>Verification code expired</h3>
						<p className={modelStyles.content}>
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
			<div className={modelStyles.model}>
				<h3 className={modelStyles.title}>Enter your validation code</h3>
				<p className={modelStyles.content}>
					If your email address:<span className={styles.email}> {email} </span>
					is registered, we will send a validation code to that email address,
					please enter the 6-digit code to reset your password.
				</p>

				<div className={styles['code-wrap']}>
					{code.map((item, index) => (
						<input
							key={index}
							id={`${index}`}
							ref={inputRefs[index]}
							className={styles.input}
							type="text"
							autoFocus={index === 0}
							value={item}
							maxLength={1}
							disabled={isLoading}
							title="Enter the 6-digit verify code"
							onChange={handleChange}
							onPaste={handlePaste}
							onKeyDown={handleKeyDown}
							spellCheck="false"
							autoCapitalize="off"
							autoCorrect="off"
							autoComplete="off"
						/>
					))}
				</div>
				<div className={styles['model-bottom']}>
					<ResendVerificationCodeButton email={email} />
					<div
						className={`${styles.error} ${formStyles['error-message']} ${errorMessage ? formStyles['error-message-active'] : ''}`}
					>
						<span className={`${formStyles.icon} ${formStyles.alert}`} />
						<p className={formStyles.message}>{errorMessage}</p>
					</div>
				</div>
			</div>
		</>
	);
};
