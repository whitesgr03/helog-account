// Styles
import styles from './Loading.module.css';
import imageStyles from '../../styles/image.module.css';

interface Props {
	text: string;
	dark?: boolean;
	light?: boolean;
	shadow?: boolean;
	blur?: boolean;
}

export const Loading = ({ text, dark, light, shadow, blur }: Props) => {
	return (
		<div
			className={`${styles.loading} ${dark ? styles.dark : ''} ${
				light ? styles.light : ''
			} ${shadow ? styles.shadow : ''} ${blur ? styles.blur : ''}`}
		>
			{text}
			<span className={`${imageStyles.icon} ${styles.load}`} />
		</div>
	);
};
