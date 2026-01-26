import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { useAlert, useModal, useAppDataAPI } from './AppContext';
import { AppProvider } from './AppProvider';

describe('App Context', () => {
	it('should add alert data', async () => {
		const user = userEvent.setup();
		const mockAlertData = [
			{ message: 'alert1', error: true, delay: 0 },
			{ message: 'alert2', error: false, delay: 0 },
			{ message: 'alert3', error: true, delay: 0 },
		];

		const MockComponent = () => {
			const alerts = useAlert();
			const { onAlert } = useAppDataAPI();

			return (
				<div>
					<ul>
						{alerts.map(alert => (
							<li key={alert.message} className={alert.error ? 'error' : ''}>
								{alert.message}
							</li>
						))}
					</ul>
					<button onClick={() => onAlert([mockAlertData[0]])}>
						Send an alert
					</button>
					<button onClick={() => onAlert(mockAlertData)}>
						Send multiple alert
					</button>
					<button onClick={() => onAlert([])}>Send an empty alert</button>
				</div>
			);
		};

		render(
			<AppProvider>
				<MockComponent />
			</AppProvider>,
		);

		const sendAnAlertButton = screen.getByRole('button', {
			name: 'Send an alert',
		});
		const sendMultipleAlertButton = screen.getByRole('button', {
			name: 'Send multiple alert',
		});
		const sendAnEmptyAlertButton = screen.getByRole('button', {
			name: 'Send an empty alert',
		});

		await user.click(sendAnAlertButton);

		const item = screen.getByRole('listitem');

		expect(item).toHaveTextContent(mockAlertData[0].message);
		expect(item).toHaveClass(/error/);

		await user.click(sendAnEmptyAlertButton);

		expect(item).not.toBeInTheDocument();

		await user.click(sendMultipleAlertButton);

		const items = screen.getAllByRole('listitem');

		expect(items).toHaveLength(mockAlertData.length);

		items.forEach((item, index) => {
			expect(item).toHaveTextContent(mockAlertData[index].message);
			if (mockAlertData[index].error) {
				expect(item).toHaveClass(/error/);
			} else {
				expect(item).not.toHaveClass(/error/);
			}
		});
	});
	it('should add modal data', async () => {
		const user = userEvent.setup();
		const mockComponentContent = 'Active component';
		const mockModalData = {
			component: <div>{mockComponentContent}</div>,
			clickToClose: true,
		};

		const MockComponent = () => {
			const modal = useModal();
			const { onModal } = useAppDataAPI();

			return (
				<div>
					{modal.component && (
						<div
							data-testid="modal"
							className={modal.clickToClose ? 'close' : ''}
						>
							{modal.component}
						</div>
					)}
					<button onClick={() => onModal(mockModalData)}>Active a modal</button>
				</div>
			);
		};

		render(
			<AppProvider>
				<MockComponent />
			</AppProvider>,
		);

		const button = screen.getByRole('button', { name: 'Active a modal' });

		await user.click(button);

		if (mockModalData.clickToClose) {
			expect(screen.getByTestId('modal')).toHaveClass('close');
		}
		expect(screen.getByText(mockComponentContent));
	});
});
