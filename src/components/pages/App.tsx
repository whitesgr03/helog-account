import { useState, useEffect } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';

import 'normalize.css';
import styles from './App.module.css';

import { Footer } from '../layout/footer/Footer';
import { Header } from '../layout/header/Header';

import { Offline } from '../utils/Error/Offline';
import { Loading } from '../utils/Loading';
import { ErrorComponent } from '../utils/Error/Error';
import { Modal } from './Modal';
import { Alert } from './Alert';
import { AppProvider } from './AppProvider';

import { useFetchUser } from '../useFetchUser';

export const App = () => {
	const [isOnline, setIsOnline] = useState(true);
	const { user, error, isLoading } = useFetchUser();

	const isError =
		error &&
		(error.cause instanceof Error ||
			(error.cause instanceof Response && error.cause.status !== 401));

	useEffect(() => {
		// Remove hash property (#_=_) from facebook login flow
		if (window.location.hash === '#_=_') {
			window.history.replaceState(null, '', window.location.pathname);
		}

		window.addEventListener('offline', () => {
			setIsOnline(false);
		});
		window.addEventListener('online', () => {
			setIsOnline(true);
		});
	}, []);

	useEffect(() => {
		if (user) {
			window.location.assign(`${import.meta.env.VITE_HELOG_URL}`);
		}
	}, [user]);
	return (
		<AppProvider>
			<div className={styles.app}>
				<ScrollRestoration getKey={location => location.key} />
				{isError ? (
					<ErrorComponent />
				) : user ? (
					<div className={styles.loading}>
						<Loading text="Redirecting to home page..." />
					</div>
				) : isLoading ? (
					<div className={styles.loading}>
						<Loading text="Loading..." />
					</div>
				) : (
					<>
						<div className={styles['header-bar']}>
							<Header />
							<Alert />
						</div>

						<div className={styles.container}>
							<main className={styles.main}>
								<Modal />
								{isOnline ? <Outlet /> : <Offline />}
							</main>
							<Footer />
						</div>
					</>
				)}
			</div>
		</AppProvider>
	);
};
