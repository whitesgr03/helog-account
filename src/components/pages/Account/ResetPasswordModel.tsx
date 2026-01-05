// Packages
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { string, object, type InferType } from 'yup';
import isEmpty from 'lodash.isempty';
import { formatDistanceStrict } from 'date-fns';

// Styles
import formStyles from '../../../styles/form.module.css';
import modelStyles from '../../../styles/model.module.css';
import buttonStyles from '../../../styles/button.module.css';

// Components
import { Loading } from '../../utils/Loading';

// Context
import { useAppDataAPI } from '../AppContext';

import { verifySchema } from '../../../lib/verifySchema';
import { resetPassword } from '../../../lib/handleAccount';

interface inputErrors {
	password?: string;
}

const schema = object({
	password: string()
		.min(
			8,
			'The password length must be greater than 8 characters or you can use passphrases less than 64 characters.',
		)
		.max(
			64,
			'The password length must be greater than 8 characters or you can use passphrases less than 64 characters.',
		),
});

export type ResetPasswordModelSchema = InferType<typeof schema>;

interface PropTypes {
	email: string;
	sessionExpireAfter: number;
}

const idleAlertComponent = (
	<div className={modelStyles.model}>
		<h3 className={modelStyles.title}>Reset password idle timeout</h3>
		<p className={modelStyles.content}>
			You've idle on the reset password page for fifteen minutes. Please try
			resetting password again.
		</p>
	</div>
);

export const ResetPasswordModel = ({
	email,
	sessionExpireAfter,
}: PropTypes) => {
	const [inputErrors, setInputErrors] = useState<inputErrors>({});
	const [formFields, setFormFields] = useState({
		password: '',
		confirmPassword: '',
	});
	const [debounce, setDebounce] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isShowPassword, setIsShowPassword] = useState(false);
	const timer = useRef<NodeJS.Timeout>(null);
	const { onModal, onAlert } = useAppDataAPI();
	const navigate = useNavigate();

	const handleResetPassword = async () => {
		const controller = new AbortController();
		const { signal } = controller;

		try {
			const response = await resetPassword(signal, formFields.password, email);

			const data = await response.json();

			if (data.success) {
				onModal({
					component: (
						<div className={modelStyles.model}>
							<h3 className={modelStyles.title}>
								Reset password was successfully
							</h3>
							<p className={modelStyles.content}>
								We have signed you out of all other devices. You can now log
								back in with your new password.
							</p>
						</div>
					),
					clickToClose: true,
				});
			} else {
				if (response.status === '400') {
					setInputErrors(data.fields);
				} else if (response.status === '401') {
					onModal({
						component: idleAlertComponent,
						clickToClose: true,
					});
				} else {
					navigate('/error');
					onModal({
						component: null,
					});
				}
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
				onModal({
					component: null,
				});
				onAlert([
					{
						message: `You have tried to reset your password too many times. Please try again in ${retryAfter}.`,
						error: true,
						delay: 5000,
					},
				]);
			} else {
				navigate('/error');
				onModal({
					component: null,
				});
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!isLoading) {
			const errors = await verifySchema({ schema, formFields });

			if (errors) {
				setInputErrors(errors);
				setDebounce(false);
			} else {
				setInputErrors({});
				setIsLoading(true);
				await handleResetPassword();
				setIsLoading(false);
			}
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		const fields = {
			...formFields,
			[name]: value,
		};
		setFormFields(fields);

		if (!isEmpty(inputErrors)) setDebounce(true);
	};

	const handleShowPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
		setIsShowPassword(e.target.checked);
	};

	useEffect(() => {
		if (debounce) {
			timer.current = setTimeout(async () => {
				const errors = await verifySchema({ schema, formFields });

				if (errors) {
					setInputErrors(errors);
				} else {
					setInputErrors({});
				}
			}, 500);
		}
		return () => clearTimeout(timer.current as NodeJS.Timeout);
	}, [debounce, formFields]);

	useEffect(() => {
		timer.current = setTimeout(async () => {
			onModal({
				component: idleAlertComponent,
				clickToClose: true,
			});
		}, sessionExpireAfter);
		return () => clearTimeout(timer.current as NodeJS.Timeout);
	}, [onModal, sessionExpireAfter]);

	return (
		<>
			{isLoading && (
				<Loading text={'Committing ...'} shadow={true} blur={true} />
			)}
			<form className={formStyles.form} onSubmit={handleSubmit}>
				<div>
					<label className={formStyles.label} htmlFor="password">
						New Password
						<input
							className={`${modelStyles.input} ${inputErrors.password ? formStyles['input-error'] : ''}`}
							id="password"
							type={isShowPassword ? 'text' : 'password'}
							name="password"
							title="The password is required."
							value={formFields.password}
							onChange={handleChange}
						/>
					</label>
					<label className={formStyles['checkbox-label']}>
						<input
							className={formStyles.checkbox}
							type="checkbox"
							id="isShowPassword"
							name="isShowPassword"
							onChange={handleShowPassword}
							checked={isShowPassword}
						/>
						Show Password
					</label>
					<div
						className={`${formStyles['error-message']} ${inputErrors.password ? formStyles['error-message-active'] : ''}`}
					>
						<span className={`${formStyles.icon} ${formStyles.alert}`} />
						<p className={formStyles.message}>
							{inputErrors.password ?? 'Message Placeholder'}
						</p>
					</div>
				</div>

				<button
					className={`${buttonStyles.content} ${buttonStyles.success}`}
					type="submit"
				>
					Submit
				</button>
			</form>
		</>
	);
};
