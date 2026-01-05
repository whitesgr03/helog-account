import { handleFetch } from './handleFetch';
import { type SignUpSchema } from '../components/pages/Account/SignUp';
import { type SignInSchema } from '../components/pages/Account/SignIn';

const URL = `${import.meta.env.VITE_RESOURCE_URL}/account`;

export const login = async (signal: AbortSignal, formFields: SignInSchema) => {
	const options: RequestInit = {
		method: 'POST',
		signal,
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(formFields),
	};

	return await handleFetch(`${URL}/login`, options, [302, 401, 400]);
};

export const requestRegister = async (
	signal: AbortSignal,
	formFields: SignUpSchema,
) => {
	const options: RequestInit = {
		method: 'POST',
		signal,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formFields),
	};

	return await handleFetch(`${URL}/requestRegister`, options, [400]);
};
