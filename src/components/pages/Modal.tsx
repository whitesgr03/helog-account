// Styles
import styles from './Modal.module.css';
import imageStyles from '../../styles/image.module.css';
import buttonStyles from '../../styles/button.module.css';
import { useModal, useAppDataAPI } from './AppContext';

export const Modal = () => {
	const modal = useModal();
	const { onModal } = useAppDataAPI();

	const handleCloseModal = (
		e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
	) => e.target === e.currentTarget && onModal({ component: null });

	return (
		<>
			{modal.component && (
				<div
					className={styles.modal}
					onClick={e => modal.clickToClose && handleCloseModal(e)}
					data-testid="modal"
				>
					<div className={styles['modal-wrap']}>
						{modal.clickToClose && (
							<button
								className={buttonStyles['close-btn']}
								onClick={handleCloseModal}
								data-testid="close-btn"
							>
								<span className={`${imageStyles.icon} ${buttonStyles.close}`} />
							</button>
						)}
						<div className={styles.container}>{modal.component}</div>
					</div>
				</div>
			)}
		</>
	);
};
