// Packages
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { string, object, type InferType } from 'yup';
import isEmpty from 'lodash.isempty';
import { requestResetPassword } from '../../../lib/handleAccount';
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

import { VerificationCodeModel } from './VerificationCodeModel';

interface inputErrors {
	email?: string;
}

const schema = object({
	email: string()
		.trim()
		.required('Email address is required.')
		.email('The email address must be in the correct format.'),
});

export type RequestResetPasswordModelSchema = InferType<typeof schema>;

export const RequestResetPasswordModel = () => {
	const [inputErrors, setInputErrors] = useState<inputErrors>({});
	const [formFields, setFormFields] = useState({
		email: '',
	});
	const [debounce, setDebounce] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const timer = useRef<NodeJS.Timeout>(null);
	const { onModal, onAlert } = useAppDataAPI();
	const navigate = useNavigate();

	const handleRequestResetPassword = async () => {
		const controller = new AbortController();
		const { signal } = controller;
		setIsLoading(true);
		try {
			const response = await requestResetPassword(signal, formFields);
			if (response.data.success) {
				const codeExpireAfter = Number(response.headers.get('Expire-After'));
				setDebounce(false);
				onModal({
					component: (
						<VerificationCodeModel
							email={formFields.email}
							codeExpireAfter={codeExpireAfter}
						/>
					),
					clickToClose: true,
				});
			} else {
				setInputErrors(response.data.fields);
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

			await handleRequestResetPassword();
			return;
		}

		if (isEmpty(inputErrors)) {
			await handleRequestResetPassword();
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
		<>
			{isLoading && (
				<Loading text={'Committing ...'} shadow={true} blur={true} />
			)}
			<form className={formStyles.form} onSubmit={handleSubmit}>
				<h3 className={modelStyles.title}>
					Getting back into your Helog account
				</h3>
				<p className={modelStyles.content}>
					As a security precaution, resetting your password will automatically
					log you out of all other devices.
				</p>
				<div>
					<label className={formStyles.label} htmlFor="email">
						Enter your Email
						<input
							className={`${modelStyles.input} ${inputErrors?.email ? formStyles['input-error'] : ''}`}
							id="email"
							type="text"
							name="email"
							title="The email is required and must be standard format."
							value={formFields.email}
							onChange={handleChange}
							spellCheck="false"
							autoCapitalize="off"
							autoCorrect="off"
							autoComplete="off"
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
