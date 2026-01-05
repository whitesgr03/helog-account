import { Link } from 'react-router';

// Styles
import styles from './Error.module.css';
import imageStyles from '../../../styles/image.module.css';

export const Offline = () => {
	return (
		<div className={styles.error}>
			<span className={`${imageStyles.icon} ${styles.alert}`} />
			<h2>No internet</h2>
			<div className={styles.message}>
				<p>Our apologies, There was a network error.</p>
				<p>You're offline.</p>
				<p>Please check your connection.</p>
			</div>

			<Link to="/sign-in" className={styles.link}>
				Back to Sign In Page
			</Link>
		</div>
	);
};
