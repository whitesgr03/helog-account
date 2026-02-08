import { expect, describe, it, vi, beforeEach } from 'vitest';
import {
	render,
	screen,
	waitForElementToBeRemoved,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router';

import { formatDistanceStrict } from 'date-fns';

import { ResendVerificationCodeButton } from './ResendVerificationCodeButton';
import { requestVerificationCode } from '../../../lib/handleAccount';

import { useAppDataAPI } from '../AppContext';
import { act } from 'react';

vi.mock('../../../lib/handleAccount');
vi.mock('../AppContext');
vi.mock('date-fns', { spy: true });

describe('ResendVerificationCodeButton component', () => {
	const mockCustomHook = {
		onAlert: vi.fn(),
		onModal: vi.fn(),
	};
	beforeEach(() => {
		vi.useFakeTimers({
			toFake: ['setInterval', 'clearInterval', 'Date'],
		});
		vi.mocked(useAppDataAPI).mockReturnValue(mockCustomHook);
	});
	it('should render the remaining time to resend the verification code', async () => {
		vi.spyOn(window, 'clearInterval');

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResendVerificationCodeButton({ email: 'example@gmail' }),
			},
			{
				path: '/error',
				Component: () => <div>error component</div>,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		act(() => {
			vi.advanceTimersByTime(10000);
		});

		expect(clearInterval).toBeCalledTimes(1);
	});
	it('should navigate to the "/error" path if requests verification code failed after click button', async () => {
		const user = userEvent.setup();

		const mockResolve = {
			success: false,
		};

		vi.mocked(requestVerificationCode).mockImplementationOnce(
			async () =>
				await new Promise(resolve =>
					setTimeout(() => resolve(mockResolve), 100),
				),
		);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResendVerificationCodeButton({ email: 'example@gmail' }),
			},
			{
				path: '/error',
				Component: () => <div>error component</div>,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		act(() => {
			vi.advanceTimersByTime(10000);
		});

		const button = screen.getByRole('button', { name: /Resend code/ });

		await user.click(button);

		await waitForElementToBeRemoved(screen.queryByText('Sending ...'));

		expect(requestVerificationCode).toBeCalledTimes(1);
		expect(screen.getByText('error component'));
	});
	it('should render an alert message if the user requests verification code too many times', async () => {
		const user = userEvent.setup();

		const mockResponse = new Response('', {
			status: 429,
			headers: {
				'retry-after': '5000',
			},
		});

		vi.mocked(requestVerificationCode).mockRejectedValueOnce(
			new Error('response error', { cause: mockResponse }),
		);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResendVerificationCodeButton({ email: 'example@gmail' }),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		act(() => {
			vi.advanceTimersByTime(10000);
		});

		const button = screen.getByRole('button', { name: /Resend code/ });

		await user.click(button);

		expect(formatDistanceStrict).toBeCalledTimes(1);
		expect(mockCustomHook.onAlert).toBeCalledTimes(1);
	});
	it('should navigate to the "/error" path if an unknown error occurs', async () => {
		const user = userEvent.setup();

		const mockResponse = new Response('', {
			status: 500,
		});
		vi.mocked(requestVerificationCode).mockRejectedValueOnce(
			new Error('response error', { cause: mockResponse }),
		);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResendVerificationCodeButton({ email: 'example@gmail' }),
			},
			{
				path: '/error',
				Component: () => <div>error component</div>,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		act(() => {
			vi.advanceTimersByTime(10000);
		});

		const button = screen.getByRole('button', { name: /Resend code/ });

		await user.click(button);

		expect(mockCustomHook.onModal).toBeCalledTimes(1);
		expect(screen.getByText('error component'));
	});
	it('should render an alert message and active countdown if the user requests verification code successful', async () => {
		vi.spyOn(window, 'clearInterval');
		vi.mocked(requestVerificationCode).mockResolvedValueOnce({
			success: true,
		});

		const user = userEvent.setup();

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResendVerificationCodeButton({ email: 'example@gmail' }),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		act(() => {
			vi.advanceTimersByTime(10000);
		});

		const button = screen.getByRole('button', { name: /Resend code/ });

		await user.click(button);

		expect(mockCustomHook.onAlert).toBeCalledTimes(1);

		act(() => {
			vi.advanceTimersByTime(30000);
		});

		expect(window.clearInterval).toBeCalledTimes(2);
	});
});
