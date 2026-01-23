import { useEffect } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router';
import { register } from '../../../lib/handleAccount';
import { formatDistanceStrict } from 'date-fns';

import signInStyles from './SignIn.module.css';
import modelStyles from '../../../styles/model.module.css';

import { useAppDataAPI } from '../AppContext';
import { Loading } from '../../utils/Loading';

export const AccountCreate = () => {
	const [searchParams] = useSearchParams();
	const { onModal, onAlert } = useAppDataAPI();
	const navigate = useNavigate();

	const token = searchParams.get('token');
	const tokenId = searchParams.get('identity');

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		const handleRegister = async () => {
			if (token && tokenId) {
				try {
					const result = await register(signal, tokenId, token);

					if (result.success) {
						onAlert([
							{
								message: `Registration is complete. You can now log in to your account.`,
								error: false,
								delay: 5000,
							},
						]);
						navigate('/sign-in');
					} else {
						onModal({
							component: (
								<div className={modelStyles.model}>
									<h3 className={modelStyles.title}>Registration failed</h3>
									<p className={modelStyles.content}>
										The registration link you used is invalid, expired, or
										already in use. Please try registering again using a new
										link.
									</p>
								</div>
							),
							clickToClose: true,
						});
						navigate('/sign-up');
					}
				} catch (error) {
					if (!signal.aborted)
						if (
							error instanceof Error &&
							error.cause instanceof Response &&
							error.cause.status === 429
						) {
							const currentDate = new Date();
							const retryAfterDate = new Date(
								+currentDate + Number(error.cause.headers.get('Retry-After')),
							);
							const retryAfter = formatDistanceStrict(
								currentDate,
								retryAfterDate,
								{
									unit: 'hour',
								},
							);
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
				}
			}
		};

		handleRegister();

		return () => controller.abort();
	}, [searchParams, navigate, onAlert, onModal, token, tokenId]);

	return (
		<div className={signInStyles.account}>
			{token && tokenId ? (
				<Loading text={'Verifying your token ...'} blur={true} />
			) : (
				<Navigate to="/sign-in" />
			)}
		</div>
	);
};
