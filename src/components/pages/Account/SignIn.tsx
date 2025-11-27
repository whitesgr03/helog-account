import styles from './SignIn.module.css';

import { Federation } from './Federation';

export const SignIn = () => {
	return (
		<div className={styles.account}>
			<div className={styles.container}>
				<h2 className={styles.title}>User Sign In</h2>
				<Federation />
			</div>
		</div>
	);
};
