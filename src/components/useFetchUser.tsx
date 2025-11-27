import { useEffect, useState } from 'react';

import { getUserInfo } from '../lib/handleUser';

export const useFetchUser = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [user, setUser] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		const fetchUserInfo = async () => {
			try {
				const result = await getUserInfo(signal);
				if (!signal.aborted) {
					setUser(result);
				}
			} catch (err) {
				if (err instanceof Error && !signal.aborted) {
					setError(err);
					setIsLoading(false);
				}
			}
		};

		fetchUserInfo();

		return () => controller.abort();
	}, []);

	return { user, error, isLoading };
};
