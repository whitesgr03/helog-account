import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { string, object, type InferType } from 'yup';
import isEmpty from 'lodash.isempty';
import { formatDistanceStrict } from 'date-fns';

import styles from './SignIn.module.css';
import formStyles from '../../../styles/form.module.css';

import { Federation } from './Federation';
import { login } from '../../../lib/handleAccount';

import { verifySchema } from '../../../lib/verifySchema';
import { useAppDataAPI } from '../AppContext';
import { Loading } from '../../utils/Loading';

const schema = object({
	email: string()
		.trim()
		.required('Email address is required.')
		.email('The email address must be in the correct format.'),
	password: string().required('Password is required.'),
});

export type SignInSchema = InferType<typeof schema>;

interface inputErrors {
	email?: string;
	password?: string;
}

export const SignIn = () => {
	const [inputErrors, setInputErrors] = useState<inputErrors>({});
	const [formFields, setFormFields] = useState({
		email: '',
		password: '',
	});
	const [debounce, setDebounce] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isShowPassword, setIsShowPassword] = useState(false);
	const timer = useRef<NodeJS.Timeout>(null);
	const { onAlert } = useAppDataAPI();
	const navigate = useNavigate();

	const handleLogin = async () => {
		const controller = new AbortController();
		const { signal } = controller;
		setIsLoading(true);
		try {
			const result = await login(signal, formFields);

			if (result.success) {
				window.location.assign(`${import.meta.env.VITE_HELOG_URL}`);
			} else {
				setInputErrors(result.fields);
				setIsLoading(false);
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
						message: `You have failed to log in too many times. Please try again in ${retryAfter}.`,
						error: true,
						delay: 5000,
					},
				]);
			} else {
				navigate('/error');
			}
			setIsLoading(false);
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
				await handleLogin();
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

	return (
		<div className={styles.account}>
			{isLoading && <Loading text={'Logging ...'} blur={true} />}
			<div className={styles.container}>
				<h2 className={styles.title}>User Sign In</h2>
				<div className={formStyles.container}>
					<form className={formStyles.form} onSubmit={handleSubmit}>
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
									autoFocus={true}
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
							<div className={styles.wrap}>
								<label className={formStyles['checkbox-label']}>
									<input
										className={formStyles.checkbox}
										type="checkbox"
										id="isShowPassword"
										name="isShowPassword"
										onChange={handleShowPassword}
									/>
									Show Password
								</label>
							</div>
							<div
								className={`${formStyles['error-message']} ${inputErrors.password ? formStyles['error-message-active'] : ''}`}
							>
								<span className={`${formStyles.icon} ${formStyles.alert}`} />
								<p className={formStyles.message}>
									{inputErrors.password ?? 'Message Placeholder'}
								</p>
							</div>
						</div>
						<button className={formStyles.submit} type="submit">
							Login
						</button>
					</form>
					<Federation onLoading={() => setIsLoading(true)} />
					<div className={formStyles['link-wrap']}>
						<p>New to Helog?</p>
						<Link to="/sign-up" className={formStyles.link}>
							Create an account
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
