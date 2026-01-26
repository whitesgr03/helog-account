import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { Modal } from './Modal';

import { useModal, useAppDataAPI } from './AppContext';

vi.mock('./AppContext');

describe('Modal component', () => {
	const mockCustomHook = {
		onAlert: vi.fn(),
		onModal: vi.fn(),
	};
	beforeEach(() => {
		vi.mocked(useAppDataAPI).mockReturnValue(mockCustomHook);
	});
	it(`should close modal component if "clickToClose" parameter is provided and the div element with modal class or close button is clicked`, async () => {
		const user = userEvent.setup();
		const mockModalData = {
			component: <div>Active modal component</div>,
			clickToClose: true,
		};

		vi.mocked(useModal).mockReturnValueOnce(mockModalData);

		render(<Modal />);

		const modal = screen.getByTestId('modal');
		const button = screen.getByTestId('close-btn');

		await user.click(modal);
		await user.click(button);

		expect(mockCustomHook.onModal).toBeCalledTimes(2);
	});
});
