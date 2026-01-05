import { handleFetch } from './handleFetch';

const URL = `${import.meta.env.VITE_RESOURCE_URL}/user`;

export const getUserInfo = async (signal: AbortSignal) => {
	const options: RequestInit = {
		method: 'GET',
		signal,
		credentials: 'include',
	};

	return await handleFetch(URL, options);
};
