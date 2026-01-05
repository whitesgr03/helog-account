import { handleFetch } from './handleFetch';
import Cookies from 'js-cookie';
import { type SignUpSchema } from '../components/pages/Account/SignUp';
import { type SignInSchema } from '../components/pages/Account/SignIn';
import { type RequestResetPasswordModelSchema } from './../components/pages/Account/RequestResetPasswordModel';

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

export const register = async (
	signal: AbortSignal,
	tokenId: string,
	token: string,
) => {
	const options: RequestInit = {
		method: 'POST',
		signal,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ tokenId, token }),
	};

	return await handleFetch(`${URL}/register`, options, [401]);
};

export const requestResetPassword = async (
	signal: AbortSignal,
	formFields: RequestResetPasswordModelSchema,
) => {
	const options: RequestInit = {
		method: 'POST',
		signal,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formFields),
	};
	const includeHeaders = true;

	return await handleFetch(
		`${URL}/requestResetPassword`,
		options,
		[400],
		includeHeaders,
	);
};

export const resetPassword = async (
	signal: AbortSignal,
	password: string,
	email: string,
) => {
	const options: RequestInit = {
		method: 'POST',
		signal,
		headers: {
			'Content-Type': 'application/json',
			'X-CSRF-TOKEN':
				Cookies.get(import.meta.env.PROD ? '__Secure-token' : 'token') ?? '',
		},
		credentials: 'include',
		body: JSON.stringify({ email, password }),
	};

	const getResponse = true;
	const includeHeaders = false;

	return await handleFetch(
		`${URL}/resetPassword`,
		options,
		[400, 401],
		includeHeaders,
		getResponse,
	);
};

export const requestVerificationCode = async (
	signal: AbortSignal,
	email: string,
) => {
	const options: RequestInit = {
		method: 'POST',
		signal,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email }),
	};

	return await handleFetch(`${URL}/requestVerificationCode`, options);
};

export const verifyCode = async (
	signal: AbortSignal,
	code: string,
	email: string,
) => {
	const options: RequestInit = {
		method: 'POST',
		signal,
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify({ code, email }),
	};

	const includeHeaders = true;
	return await handleFetch(`${URL}/verifyCode`, options, [401], includeHeaders);
};
