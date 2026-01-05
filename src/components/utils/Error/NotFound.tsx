import { Link } from 'react-router';

// Styles
import styles from './Error.module.css';
import imageStyles from '../../../styles/image.module.css';

export const NotFound = () => {
	return (
		<div className={styles.error}>
			<span className={`${imageStyles.icon} ${styles.alert}`} />
			<h2>Page Not Found</h2>
			<div className={styles.message}>
				<p>Our apologies, there has been an error.</p>
				<p>The page you are looking for could not be found.</p>
				<p>You may surf over to our other pages.</p>
			</div>

			<Link to="/sign-in" className={styles.link}>
				Back to Sign In Page
			</Link>
		</div>
	);
};
