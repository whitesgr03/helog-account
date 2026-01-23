import { expect, describe, it, vi, beforeEach } from 'vitest';
import {
	render,
	screen,
	waitFor,
	waitForElementToBeRemoved,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router';

import { SignIn } from './SignIn';
import { login } from '../../../lib/handleAccount';

import { verifySchema } from '../../../lib/verifySchema';
import { useAppDataAPI } from '../AppContext';
import { Loading } from '../../utils/Loading';
import { RequestResetPasswordModal } from './RequestResetPasswordModal';

import isEmpty from 'lodash.isempty';
import { formatDistanceStrict } from 'date-fns';

vi.mock('../../../lib/verifySchema', { spy: true });
vi.mock('../../../lib/handleAccount');
vi.mock('../../utils/Loading');
vi.mock('./RequestResetPasswordModal');
vi.mock('../AppContext');
vi.mock('lodash.isempty');
vi.mock('date-fns', { spy: true });

describe('SignIn component', () => {
	const mockCustomHook = {
		onAlert: vi.fn(),
		onModal: vi.fn(),
	};
	beforeEach(() => {
		vi.mocked(useAppDataAPI).mockReturnValue(mockCustomHook);
		vi.mocked(Loading).mockImplementation(() => <div>Loading component</div>);
	});
	it('should change the field values if the field is entered', async () => {
		const user = userEvent.setup();

		const mockEmail = 'example@gmail';
		const mockPassword = '12345678';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignIn,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});

		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});

		await user.type(emailField, mockEmail);
		await user.type(passwordField, mockPassword);

		expect(emailField).toHaveValue(mockEmail);
		expect(passwordField).toHaveValue(mockPassword);
	});
	it('should render the error field messages and active debounce if the fields validation fails after submission', async () => {
		const user = userEvent.setup();

		const mockEmail = 'example';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignIn,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Login' });

		await user.type(emailField, mockEmail);

		expect(screen.getAllByText('Message Placeholder')).toHaveLength(2);

		await user.click(submitButton);

		expect(screen.queryAllByText('Message Placeholder')).toHaveLength(0);

		await waitFor(() => {
			expect(verifySchema).toBeCalledTimes(2);
		});
	});
	it('should render the error field messages and active debounce if the server validation fails after request registration', async () => {
		const user = userEvent.setup();

		const mockResolve = {
			success: false,
			fields: {
				email: 'error',
				password: 'error',
			},
		};

		vi.mocked(login).mockImplementationOnce(
			async () =>
				await new Promise(resolve =>
					setTimeout(() => resolve(mockResolve), 100),
				),
		);

		const mockEmail = 'exampl@gmail.com';
		const mockPassword = '12345678';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignIn,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});

		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Login' });

		await user.type(emailField, mockEmail);
		await user.type(passwordField, mockPassword);

		await user.click(submitButton);

		await waitForElementToBeRemoved(screen.queryByText('Loading component'));

		expect(login).toBeCalledTimes(1);
		expect(screen.queryAllByText('Message Placeholder')).toHaveLength(0);
		await waitFor(() => {
			expect(verifySchema).toBeCalledTimes(2);
		});
	});
	it('should check if input errors are empty when the debounce is true and submit button is clicked', async () => {
		const user = userEvent.setup();

		const mockEmail = 'example';

		vi.mocked(isEmpty).mockReturnValueOnce(false);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignIn,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Login' });

		await user.type(emailField, mockEmail);

		await user.click(submitButton);

		await user.click(submitButton);
		expect(isEmpty).toBeCalledTimes(1);
	});
	it('should change password of input type to text if the checkbox is clicked', async () => {
		const user = userEvent.setup();

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignIn,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});

		const checkbox = screen.getByLabelText('Show Password', {
			selector: 'input',
		});

		expect(passwordField).toHaveAttribute('type', 'password');

		await user.click(checkbox);

		expect(passwordField).toHaveAttribute('type', 'text');
	});
	it('should render the "RequestResetPasswordModal" if the forget password button is clicked', async () => {
		const user = userEvent.setup();

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignIn,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const button = screen.getByRole('button', {
			name: 'Forget Password?',
		});

		await user.click(button);

		expect(mockCustomHook.onModal).toBeCalledWith({
			component: <RequestResetPasswordModal />,
			clickToClose: true,
		});
	});
	it('should render a alert message if the user registered too many times', async () => {
		const user = userEvent.setup();

		const mockResponse = new Response('', {
			status: 429,
			headers: {
				'retry-after': '5000',
			},
		});

		vi.mocked(login).mockRejectedValueOnce(
			new Error('response error', { cause: mockResponse }),
		);

		const mockEmail = 'example@gmail.com';
		const mockPassword = '12345678';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignIn,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});
		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Login' });

		await user.type(emailField, mockEmail);
		await user.type(passwordField, mockPassword);

		await user.click(submitButton);

		expect(formatDistanceStrict).toBeCalledTimes(1);
		expect(mockCustomHook.onAlert).toBeCalledTimes(1);
	});
	it('should navigate to the "/error" path if an unknown error occurs', async () => {
		const user = userEvent.setup();

		const mockResponse = new Response('', {
			status: 500,
		});
		vi.mocked(login).mockRejectedValueOnce(
			new Error('response error', { cause: mockResponse }),
		);

		const mockEmail = 'example@gmail.com';
		const mockPassword = '12345678';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignIn,
			},
			{
				path: '/error',
				Component: () => <div>error component</div>,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});
		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Login' });

		await user.type(emailField, mockEmail);
		await user.type(passwordField, mockPassword);

		await user.click(submitButton);

		expect(screen.getByText('error component'));
	});
	it('should redirect to home page if login is successful', async () => {
		const user = userEvent.setup();
		const mockAssign = vi.fn();

		vi.mocked(login).mockResolvedValueOnce({
			success: true,
		});

		vi.stubGlobal('location', {
			assign: mockAssign,
		});

		const mockEmail = 'example@gmail.com';
		const mockPassword = '12345678';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignIn,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});
		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Login' });

		await user.type(emailField, mockEmail);
		await user.type(passwordField, mockPassword);

		await user.click(submitButton);

		expect(mockAssign).toBeCalledTimes(1);
	});
});
