import styles from './Federation.module.css';

import googleIcon from '../../../assets/google.png';
import facebookIcon from '../../../assets/facebook.png';

export const Federation = ({ onLoading }: { onLoading: () => void }) => {
	return (
		<div className={styles.federation}>
			<a
				href={`${import.meta.env.VITE_RESOURCE_URL}/account/login/google`}
				className={styles['federation-link']}
				onClick={onLoading}
			>
				<div className={styles['federation-icon']}>
					<img src={googleIcon} alt="Google icon" />
				</div>
				Sign in With google
			</a>
			<a
				href={`${import.meta.env.VITE_RESOURCE_URL}/account/login/facebook`}
				className={styles['federation-link']}
				onClick={onLoading}
			>
				<div className={styles['federation-icon']}>
					<img src={facebookIcon} alt="Facebook icon" />
				</div>
				Sign in With Facebook
			</a>
		</div>
	);
};
