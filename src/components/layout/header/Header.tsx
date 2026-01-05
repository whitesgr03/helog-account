import styles from './Header.module.css';

export const Header = () => {
	return (
		<header className={styles.header}>
			<a className={styles.link} href={import.meta.env.VITE_HELOG_URL}>
				<h1 className={styles.logo}>HeLog</h1>
			</a>
		</header>
	);
};
