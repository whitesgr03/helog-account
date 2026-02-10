import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { Alert } from './Alert';
import { useAlert, useAppDataAPI } from './AppContext';

import { act } from 'react';

vi.mock('./AppContext');

describe('Alert component', () => {
	const mockCustomHook = {
		onAlert: vi.fn(),
		onModal: vi.fn(),
	};
	beforeEach(() => {
		vi.stubGlobal('jest', {
			advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
		});
		vi.useFakeTimers();
		vi.mocked(useAppDataAPI).mockReturnValue(mockCustomHook);
	});

	afterEach(() => {
		vi.useRealTimers();
	});
	it(`should render the alert message if the alert data is provided`, () => {
		const mockAlertData = [
			{ message: 'alert message', error: true, delay: 100 },
		];

		vi.mocked(useAlert).mockReturnValueOnce(mockAlertData);

		render(<Alert />);

		const alert = screen.getByTestId('alert');
		const message = screen.getByRole('paragraph');

		expect(alert).toHaveClass(/active/);
		expect(alert).toHaveClass(/error/);
		expect(message).toHaveTextContent(mockAlertData[0].message);
	});
	it(`should remove the alert if the alert is timeout`, async () => {
		const mockAlertData = [{ message: 'alert message', error: true, delay: 0 }];

		vi.mocked(useAlert).mockReturnValueOnce(mockAlertData).mockReturnValue([]);

		vi.spyOn(window, 'clearTimeout');
		vi.spyOn(window, 'clearInterval');

		render(<Alert />);

		const alert = screen.getByTestId('alert');
		const message = screen.getByRole('paragraph');

		expect(alert).toHaveClass(/active/);
		expect(alert).toHaveClass(/error/);
		expect(message).toHaveTextContent(mockAlertData[0].message);

		fireEvent.transitionEnd(alert);

		expect(clearTimeout).toBeCalledTimes(1);
		expect(clearInterval).toBeCalledTimes(1);

		act(() => {
			vi.runAllTimers();
		});

		expect(clearInterval).toBeCalledTimes(3);
		expect(alert).not.toHaveClass(/active/);

		fireEvent.transitionEnd(alert);

		expect(alert).not.toHaveClass(/error/);
		expect(message).toHaveTextContent('');
	});
	it(`should pause or resume timer if the user moves the mouse in and out of the alert element.`, async () => {
		const user = userEvent.setup({
			advanceTimers: vi.advanceTimersByTime.bind(vi),
		});

		const mockAlertData = [
			{ message: 'alert message', error: true, delay: 10000 },
		];

		vi.mocked(useAlert).mockReturnValue(mockAlertData);
		vi.spyOn(window, 'clearTimeout');

		render(<Alert />);

		const alert = screen.getByTestId('alert');
		const message = screen.getByRole('paragraph');

		fireEvent.transitionEnd(alert);

		expect(clearTimeout).toBeCalledTimes(1);

		await user.hover(message);

		expect(clearTimeout).toBeCalledTimes(2);

		await user.unhover(alert);

		expect(clearTimeout).toBeCalledTimes(3);
	});
	it(`should render the new message if the message already exists and a new message is added`, async () => {
		const mockAlertData = [
			{ message: 'alert message', error: false, delay: 10000 },
		];

		const newAlertData = {
			message: 'new message',
			error: false,
			delay: 10000,
		};

		vi.mocked(useAlert).mockReturnValue(mockAlertData);

		vi.spyOn(window, 'clearTimeout');

		const { rerender } = render(<Alert />);

		const alert = screen.getByTestId('alert');
		const message = screen.getByRole('paragraph');

		expect(alert).toHaveClass(/active/);
		expect(message).toHaveTextContent(mockAlertData[0].message);

		fireEvent.transitionEnd(alert);

		mockAlertData.push(newAlertData);

		fireEvent.transitionEnd(alert);

		mockAlertData.shift();

		expect(mockCustomHook.onAlert).toBeCalledWith([newAlertData]);

		rerender(<Alert />);

		expect(message).toHaveTextContent(newAlertData.message);
	});
});
