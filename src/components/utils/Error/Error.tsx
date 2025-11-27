// Packages
import { Link, useLocation } from 'react-router';

// Styles
import styles from './Error.module.css';
import imageStyles from '../../../styles/image.module.css';

export const ErrorComponent = ({
	onReGetUser,
}: {
	onReGetUser?: () => void;
}) => {
	const { state } = useLocation();

	return (
		<div className={styles.error}>
			<span className={`${imageStyles.icon} ${styles.alert}`} />
			<div className={styles.message}>
				<p>Our apologies, there has been an error.</p>
				<p>Please try again later, or if you have any questions, contact us.</p>
			</div>
			{state?.previousPath && (
				<Link to={state.previousPath} className={styles.link}>
					Go Back Previous Page
				</Link>
			)}

			<Link
				to="/sign-in"
				className={styles.link}
				onClick={() => onReGetUser && onReGetUser()}
			>
				Back to Sign In Page
			</Link>
		</div>
	);
};
