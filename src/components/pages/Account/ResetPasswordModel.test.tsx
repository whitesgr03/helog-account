import { expect, describe, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router';

import isEmpty from 'lodash.isempty';
import { formatDistanceStrict } from 'date-fns';

import { ResetPasswordModel } from './ResetPasswordModel';
import { Loading } from '../../utils/Loading';

import { useAppDataAPI } from '../AppContext';

import { verifySchema } from '../../../lib/verifySchema';
import { resetPassword } from '../../../lib/handleAccount';

vi.mock('../AppContext');
vi.mock('../../utils/Loading');
vi.mock('../../../lib/verifySchema', { spy: true });
vi.mock('../../../lib/handleAccount');
vi.mock('lodash.isempty');
vi.mock('date-fns', { spy: true });

describe('ResetPasswordModel component', () => {
	const mockCustomHook = {
		onAlert: vi.fn(),
		onModal: vi.fn(),
	};
	beforeEach(() => {
		vi.mocked(useAppDataAPI).mockReturnValue(mockCustomHook);
		vi.mocked(Loading).mockImplementation(() => <div>Loading component</div>);
	});
	it('should render a model if the reset password session is expired', async () => {
		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResetPasswordModel({
						email: 'example@gmail',
						sessionExpireAfter: 1,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);
		await waitFor(() => {
			expect(mockCustomHook.onModal).toBeCalledTimes(1);
		});
	});
	it('should change the field values if the field is entered', async () => {
		const user = userEvent.setup();

		const mockPassword = '12345678';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResetPasswordModel({
						email: 'example@gmail',
						sessionExpireAfter: 10000,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const passwordField = screen.getByLabelText('New Password', {
			selector: 'input',
		});

		await user.type(passwordField, mockPassword);

		expect(passwordField).toHaveValue(mockPassword);
	});
	it('should render the error field messages and active debounce if the fields validation fails after submission', async () => {
		const user = userEvent.setup();

		const mockPassword = '123';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResetPasswordModel({
						email: 'example@gmail',
						sessionExpireAfter: 10000,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const passwordField = screen.getByLabelText('New Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(passwordField, mockPassword);

		expect(screen.getAllByText('Message Placeholder')).toHaveLength(1);

		await user.click(submitButton);

		expect(screen.queryAllByText('Message Placeholder')).toHaveLength(0);

		await waitFor(() => {
			expect(verifySchema).toBeCalledTimes(2);
		});
	});
	it('should render the error field messages and active debounce if the server validation fails and response status code is 400', async () => {
		const user = userEvent.setup();

		const mockPassword = '12345678';
		const mockResponse = new Response(
			JSON.stringify({
				success: false,
				fields: {
					password: 'error',
				},
			}),
			{
				status: 400,
			},
		);

		vi.mocked(resetPassword).mockResolvedValueOnce(mockResponse);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResetPasswordModel({
						email: 'example@gmail',
						sessionExpireAfter: 10000,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const passwordField = screen.getByLabelText('New Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(passwordField, mockPassword);

		expect(screen.getAllByText('Message Placeholder')).toHaveLength(1);

		await user.click(submitButton);

		expect(screen.queryAllByText('Message Placeholder')).toHaveLength(0);

		await waitFor(() => {
			expect(verifySchema).toBeCalledTimes(2);
		});
	});
	it('should render a model if the server validation fails and response status code is 401', async () => {
		const user = userEvent.setup();

		const mockPassword = '12345678';
		const mockResponse = new Response(
			JSON.stringify({
				success: false,
			}),
			{
				status: 401,
			},
		);

		vi.mocked(resetPassword).mockResolvedValueOnce(mockResponse);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResetPasswordModel({
						email: 'example@gmail',
						sessionExpireAfter: 10000,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const passwordField = screen.getByLabelText('New Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(passwordField, mockPassword);

		await user.click(submitButton);

		expect(mockCustomHook.onModal).toBeCalledTimes(1);
	});
	it('should navigate to the "/error" path if the server validation fails', async () => {
		const user = userEvent.setup();

		const mockPassword = '12345678';
		const mockResponse = new Response(
			JSON.stringify({
				success: false,
			}),
			{
				status: 500,
			},
		);

		vi.mocked(resetPassword).mockResolvedValueOnce(mockResponse);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResetPasswordModel({
						email: 'example@gmail',
						sessionExpireAfter: 10000,
					}),
			},
			{
				path: '/error',
				Component: () => <div>error component</div>,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const passwordField = screen.getByLabelText('New Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(passwordField, mockPassword);

		await user.click(submitButton);

		expect(mockCustomHook.onModal).toBeCalledTimes(1);
		expect(screen.getByText('error component'));
	});
	it('should check if input errors are empty when the debounce is true and submit button is clicked', async () => {
		const user = userEvent.setup();

		const mockPassword = '12345';

		vi.mocked(isEmpty).mockReturnValueOnce(false);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResetPasswordModel({
						email: 'example@gmail',
						sessionExpireAfter: 10000,
					}),
			},
			{
				path: '/error',
				Component: () => <div>error component</div>,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const passwordField = screen.getByLabelText('New Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(passwordField, mockPassword);

		await user.click(submitButton);

		await user.click(submitButton);

		expect(isEmpty).toBeCalledTimes(1);
	});
	it('should change password of input type to text if the checkbox is clicked', async () => {
		const user = userEvent.setup();

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResetPasswordModel({
						email: 'example@gmail',
						sessionExpireAfter: 10000,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const passwordField = screen.getByLabelText('New Password', {
			selector: 'input',
		});

		const checkbox = screen.getByLabelText('Show Password', {
			selector: 'input',
		});

		expect(passwordField).toHaveAttribute('type', 'password');

		await user.click(checkbox);

		expect(passwordField).toHaveAttribute('type', 'text');
	});
	it('should render a alert message if the user registered too many times', async () => {
		const user = userEvent.setup();

		const mockPassword = '12345678';
		const mockResponse = new Response('', {
			status: 429,
			headers: {
				'retry-after': '5000',
			},
		});

		vi.mocked(resetPassword).mockRejectedValueOnce(
			new Error('response error', { cause: mockResponse }),
		);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResetPasswordModel({
						email: 'example@gmail',
						sessionExpireAfter: 10000,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const passwordField = screen.getByLabelText('New Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(passwordField, mockPassword);

		await user.click(submitButton);

		expect(mockCustomHook.onModal).toBeCalledTimes(1);
		expect(formatDistanceStrict).toBeCalledTimes(1);
		expect(mockCustomHook.onAlert).toBeCalledTimes(1);
	});
	it('should navigate to the "/error" path if an unknown error occurs', async () => {
		const user = userEvent.setup();

		const mockPassword = '12345678';
		const mockResponse = new Response('', {
			status: 500,
		});

		vi.mocked(resetPassword).mockRejectedValueOnce(
			new Error('response error', { cause: mockResponse }),
		);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResetPasswordModel({
						email: 'example@gmail',
						sessionExpireAfter: 10000,
					}),
			},
			{
				path: '/error',
				Component: () => <div>error component</div>,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const passwordField = screen.getByLabelText('New Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(passwordField, mockPassword);

		await user.click(submitButton);

		expect(mockCustomHook.onModal).toBeCalledTimes(1);
		expect(screen.getByText('error component'));
	});
	it('should render a model if the user reset password is successful', async () => {
		const user = userEvent.setup();

		const mockPassword = '12345678';
		const mockResponse = new Response(JSON.stringify({ success: true }), {
			status: 200,
		});

		vi.mocked(resetPassword).mockResolvedValueOnce(mockResponse);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					ResetPasswordModel({
						email: 'example@gmail',
						sessionExpireAfter: 10000,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const passwordField = screen.getByLabelText('New Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(passwordField, mockPassword);

		await user.click(submitButton);

		expect(mockCustomHook.onModal).toBeCalledTimes(1);
	});
});
