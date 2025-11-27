// Styles
import styles from './Footer.module.css';
import imageStyles from '../../../styles/image.module.css';

export const Footer = () => {
	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<a href="https://github.com/whitesgr03/helog" className={styles.link}>
					<span className={`${imageStyles.icon} ${styles.github}`} />
				</a>
				<address>
					<a href="mailto:whitesgr03@gmail.com" className={styles.link}>
						<span className={`${imageStyles.icon} ${styles.email}`} />
						<em className={styles.emphasis}>whitesgr03@gmail.com</em>
					</a>
				</address>
			</div>
			<p>© 2025 Designed & coded by Weiss Bai</p>
		</footer>
	);
};
