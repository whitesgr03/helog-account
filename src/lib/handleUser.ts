import { handleFetch } from './handleFetch';
import Cookies from 'js-cookie';

const URL = `${import.meta.env.VITE_RESOURCE_URL}/user`;

export const getUserInfo = async (signal: AbortSignal) => {
	const options: RequestInit = {
		method: 'GET',
		signal,
		credentials: 'include',
		headers: {
			'X-CSRF-TOKEN':
				Cookies.get(import.meta.env.PROD ? '__Secure-token' : 'token') ?? '',
		},
	};

	return await handleFetch(URL, options, [401, 403]);
};
