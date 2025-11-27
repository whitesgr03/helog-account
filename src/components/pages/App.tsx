import { Outlet, ScrollRestoration } from 'react-router';

import 'normalize.css';
import styles from './App.module.css';

import { Footer } from '../layout/footer/Footer';
import { Header } from '../layout/header/Header';

import { Loading } from '../utils/Loading';
import { ErrorComponent } from '../utils/Error/Error';

import { useFetchUser } from '../useFetchUser';

export const App = () => {
	const { user, error, isLoading } = useFetchUser();

	const isError =
		error &&
		(error.cause instanceof Error ||
			(error.cause instanceof Response && error.cause.status !== 401));

	return (
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
					</div>
					<div className={styles.container}>
						<Outlet />
						<Footer />
					</div>
				</>
			)}
		</div>
	);
};
