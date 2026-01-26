import { useEffect, useState } from 'react';

import { getUserInfo } from '../lib/handleUser';

export const useFetchUser = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [isLogin, setIsLogin] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		const fetchUserInfo = async () => {
			try {
				const response = await getUserInfo(signal);
				if (response.success) setIsLogin(true);
			} catch {
				if (!signal.aborted) setIsError(true);
			} finally {
				if (!signal.aborted) setIsLoading(false);
			}
		};

		fetchUserInfo();

		return () => controller.abort();
	}, []);

	return { isLogin, isError, isLoading };
};
