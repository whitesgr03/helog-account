import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { string, object, ref, type InferType } from 'yup';
import isEmpty from 'lodash.isempty';
import { formatDistanceStrict } from 'date-fns';

import signInStyles from './SignIn.module.css';
import formStyles from '../../../styles/form.module.css';
import modelStyles from '../../../styles/model.module.css';

import { requestRegister } from '../../../lib/handleAccount';
import { verifySchema } from '../../../lib/verifySchema';

import { useAppDataAPI } from '../AppContext';
import { Loading } from '../../utils/Loading';

const schema = object({
	username: string()
		.trim()
		.required('The username is required.')
		.max(30, 'The username length must be less then 30.')
		.matches(
			/^[a-zA-Z]\w*$/,
			'The username must begin with alphabet and include alphanumeric or underscore.',
		),
	email: string()
		.required('The email is required.')
		.lowercase()
		.email('The email address must be in the correct format.'),
	password: string()
		.required('The password is required.')
		.min(
			8,
			'The password length must be greater than 8 characters or you can use passphrases less than 64 characters.',
		)
		.max(
			64,
			'The password length must be greater than 8 characters or you can use passphrases less than 64 characters.',
		),
	confirmPassword: string()
		.required('The confirmation password is required.')
		.oneOf(
			[ref('password')],
			'The confirmation password is not the same as the password.',
		),
});

const defaultFormFields = {
	username: '',
	email: '',
	password: '',
	confirmPassword: '',
};

export type SignUpSchema = InferType<typeof schema>;

interface inputErrors {
	username?: string;
	email?: string;
	password?: string;
	confirmPassword?: string;
}

export const SignUp = () => {
	const [inputErrors, setInputErrors] = useState<inputErrors>({});
	const [formFields, setFormFields] = useState(defaultFormFields);
	const [debounce, setDebounce] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isShowPassword, setIsShowPassword] = useState(false);
	const timer = useRef<NodeJS.Timeout>(null);
	const { onModal, onAlert } = useAppDataAPI();
	const navigate = useNavigate();

	const handleRequestRegister = async () => {
		setIsLoading(true);
		const controller = new AbortController();

		try {
			const result = await requestRegister(controller.signal, formFields);
			if (result.success) {
				setFormFields(defaultFormFields);
				setIsShowPassword(false);
				setDebounce(false);
				onModal({
					component: (
						<div className={modelStyles.model}>
							<h3 className={modelStyles.title}>Verify your email address</h3>
							<p className={modelStyles.content}>
								As an added security measure, we have send a verification link
								to your email address:
								<span className={signInStyles.email}> {formFields.email}</span>.
							</p>
						</div>
					),
					clickToClose: true,
				});
			} else {
				setInputErrors(result.fields);
				setDebounce(true);
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
				const retryAfter = formatDistanceStrict(currentDate, retryAfterDate, {
					unit: 'hour',
				});
				onAlert([
					{
						message: `You have registered too many times. Please try again in ${retryAfter}.`,
						error: true,
						delay: 5000,
					},
				]);
			} else {
				navigate('/error');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (isLoading) return;

		if (!debounce) {
			const errors = await verifySchema({ schema, formFields });

			if (errors) {
				setInputErrors(errors);
				setDebounce(true);
				return;
			}

			await handleRequestRegister();
			return;
		}

		if (isEmpty(inputErrors)) {
			await handleRequestRegister();
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		const fields = {
			...formFields,
			[name]: value,
		};
		setFormFields(fields);
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

	return (
		<div className={signInStyles.account}>
			{isLoading && <Loading text={'Committing ...'} blur={true} />}
			<div className={signInStyles.container}>
				<h2 className={signInStyles.title}>User Sign Up</h2>
				<div className={formStyles.container}>
					<form className={formStyles.form} onSubmit={handleSubmit}>
						<div>
							<label className={formStyles.label} htmlFor="username">
								Username
								<input
									className={`${formStyles.input} ${inputErrors?.username ? formStyles['input-error'] : ''}`}
									id="username"
									type="text"
									name="username"
									title="The username is required."
									value={formFields.username}
									onChange={handleChange}
									autoFocus={true}
								/>
							</label>
							<div
								className={`${formStyles['error-message']} ${inputErrors.username ? formStyles['error-message-active'] : ''}`}
							>
								<span className={`${formStyles.icon} ${formStyles.alert}`} />
								<p className={formStyles.message}>
									{inputErrors.username ?? 'Message Placeholder'}
								</p>
							</div>
						</div>
						<div>
							<label className={formStyles.label} htmlFor="email">
								Email
								<input
									className={`${formStyles.input} ${inputErrors?.email ? formStyles['input-error'] : ''}`}
									id="email"
									type="text"
									name="email"
									title="The email is required and must be standard format."
									value={formFields.email}
									onChange={handleChange}
								/>
							</label>
							<div
								className={`${formStyles['error-message']} ${inputErrors.email ? formStyles['error-message-active'] : ''}`}
							>
								<span className={`${formStyles.icon} ${formStyles.alert}`} />
								<p className={formStyles.message}>
									{inputErrors.email ?? 'Message Placeholder'}
								</p>
							</div>
						</div>
						<div>
							<label className={formStyles.label} htmlFor="password">
								Password
								<input
									className={`${formStyles.input} ${inputErrors.password ? formStyles['input-error'] : ''}`}
									id="password"
									type={isShowPassword ? 'text' : 'password'}
									name="password"
									title="The password is required."
									value={formFields.password}
									onChange={handleChange}
								/>
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
						<div>
							<label className={formStyles.label} htmlFor="confirmPassword">
								Confirm Password
								<input
									className={`${formStyles.input} ${inputErrors.confirmPassword ? formStyles['input-error'] : ''}`}
									id="confirmPassword"
									type={isShowPassword ? 'text' : 'password'}
									title="The confirm password must be the same as the password."
									name="confirmPassword"
									value={formFields.confirmPassword}
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
								className={`${formStyles['error-message']} ${inputErrors.confirmPassword ? formStyles['error-message-active'] : ''}`}
							>
								<span className={`${formStyles.icon} ${formStyles.alert}`} />
								<p className={formStyles.message}>
									{inputErrors.confirmPassword ?? 'Message Placeholder'}
								</p>
							</div>
						</div>

						<button className={formStyles.submit} type="submit">
							Submit
						</button>
					</form>
					<div className={formStyles['link-wrap']}>
						<p>Already have an account?</p>
						<Link to="/sign-in" className={formStyles.link}>
							Sign in account
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
