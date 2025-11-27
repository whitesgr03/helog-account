import { Outlet, ScrollRestoration } from 'react-router';

import 'normalize.css';
import styles from './App.module.css';

import { Footer } from '../layout/footer/Footer';
import { Header } from '../layout/header/Header';

export const App = () => {
	return (
		<div className={styles.app}>
			<ScrollRestoration getKey={location => location.key} />
			<div className={styles['header-bar']}>
				<Header />
			</div>
			<div className={styles.container}>
				<Outlet />

				<Footer />
			</div>
		</div>
	);
};
