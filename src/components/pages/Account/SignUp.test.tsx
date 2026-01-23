import { expect, describe, it, vi, beforeEach } from 'vitest';
import {
	render,
	screen,
	waitFor,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router';
import isEmpty from 'lodash.isempty';
import { useAppDataAPI } from '../AppContext';

import { SignUp } from './SignUp';
import { Loading } from '../../utils/Loading';

import { verifySchema } from '../../../lib/verifySchema';
import { requestRegister } from '../../../lib/handleAccount';

vi.mock('../../../lib/verifySchema', { spy: true });
vi.mock('../../../lib/handleAccount');
vi.mock('../../utils/Loading');
vi.mock('../AppContext');
vi.mock('lodash.isempty');

describe('SignUp component', () => {
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

		const mockUsername = 'example';
		const mockEmail = 'example@gmail';
		const mockPassword = '12345678';
		const mockConfirmPassword = '66666666';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignUp,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const usernameField = screen.getByLabelText('Username', {
			selector: 'input',
		});

		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});

		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});

		const confirmPasswordField = screen.getByLabelText('Confirm Password', {
			selector: 'input',
		});

		await user.type(usernameField, mockUsername);
		await user.type(emailField, mockEmail);
		await user.type(passwordField, mockPassword);
		await user.type(confirmPasswordField, mockConfirmPassword);

		expect(usernameField).toHaveValue(mockUsername);
		expect(emailField).toHaveValue(mockEmail);
		expect(passwordField).toHaveValue(mockPassword);
		expect(confirmPasswordField).toHaveValue(mockConfirmPassword);
	});
	it('should render the error field messages and active debounce if the fields validation fails after submission', async () => {
		const user = userEvent.setup();

		const mockUsername = ' ';
		const mockEmail = 'example';
		const mockPassword = '123';
		const mockConfirmPassword = '44';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignUp,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const usernameField = screen.getByLabelText('Username', {
			selector: 'input',
		});
		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});
		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});
		const confirmPasswordField = screen.getByLabelText('Confirm Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(usernameField, mockUsername);
		await user.type(emailField, mockEmail);
		await user.type(passwordField, mockPassword);
		await user.type(confirmPasswordField, mockConfirmPassword);

		expect(screen.getAllByText('Message Placeholder')).toHaveLength(4);

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
				username: 'error',
				email: 'error',
				password: 'error',
				confirmPassword: 'error',
			},
		};

		vi.mocked(requestRegister).mockImplementationOnce(
			async () =>
				await new Promise(resolve =>
					setTimeout(() => resolve(mockResolve), 100),
				),
		);

		const mockUsername = 'example';
		const mockEmail = 'example@gmail.com';
		const mockPassword = '12345678';
		const mockConfirmPassword = '12345678';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignUp,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const usernameField = screen.getByLabelText('Username', {
			selector: 'input',
		});
		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});
		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});
		const confirmPasswordField = screen.getByLabelText('Confirm Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(usernameField, mockUsername);
		await user.type(emailField, mockEmail);
		await user.type(passwordField, mockPassword);
		await user.type(confirmPasswordField, mockConfirmPassword);

		await user.click(submitButton);

		await waitForElementToBeRemoved(screen.queryByText('Loading component'));

		expect(requestRegister).toBeCalledTimes(1);
		expect(screen.queryAllByText('Message Placeholder')).toHaveLength(0);
		await waitFor(() => {
			expect(verifySchema).toBeCalledTimes(2);
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

		vi.mocked(requestRegister).mockImplementationOnce(
			async () =>
				await new Promise((_resolve, reject) =>
					setTimeout(
						() => reject(new Error('response error', { cause: mockResponse })),
						100,
					),
				),
		);

		const mockUsername = 'example';
		const mockEmail = 'example@gmail.com';
		const mockPassword = '12345678';
		const mockConfirmPassword = '12345678';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignUp,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const usernameField = screen.getByLabelText('Username', {
			selector: 'input',
		});
		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});
		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});
		const confirmPasswordField = screen.getByLabelText('Confirm Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(usernameField, mockUsername);
		await user.type(emailField, mockEmail);
		await user.type(passwordField, mockPassword);
		await user.type(confirmPasswordField, mockConfirmPassword);

		await user.click(submitButton);

		await waitForElementToBeRemoved(screen.queryByText('Loading component'));

		expect(requestRegister).toBeCalledTimes(1);
		expect(mockCustomHook.onAlert).toBeCalledTimes(1);
	});
	it('should navigate to the "/error" path if an unknown error occurs', async () => {
		const user = userEvent.setup();

		const mockResponse = new Response('', {
			status: 500,
		});
		vi.mocked(requestRegister).mockImplementationOnce(
			async () =>
				await new Promise((_resolve, reject) =>
					setTimeout(
						() => reject(new Error('response error', { cause: mockResponse })),
						100,
					),
				),
		);

		const mockUsername = 'example';
		const mockEmail = 'example@gmail.com';
		const mockPassword = '12345678';
		const mockConfirmPassword = '12345678';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignUp,
			},
			{
				path: '/error',
				Component: () => <div>error component</div>,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const usernameField = screen.getByLabelText('Username', {
			selector: 'input',
		});
		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});
		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});
		const confirmPasswordField = screen.getByLabelText('Confirm Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(usernameField, mockUsername);
		await user.type(emailField, mockEmail);
		await user.type(passwordField, mockPassword);
		await user.type(confirmPasswordField, mockConfirmPassword);

		await user.click(submitButton);

		await waitForElementToBeRemoved(screen.queryByText('Loading component'));

		expect(requestRegister).toBeCalledTimes(1);
		expect(screen.getByText('error component'));
	});
	it('should render a modal contain a success message if request registration is successful', async () => {
		const user = userEvent.setup();

		vi.mocked(requestRegister).mockImplementationOnce(
			async () =>
				await new Promise(resolve =>
					setTimeout(
						() =>
							resolve({
								success: true,
							}),
						100,
					),
				),
		);

		const mockUsername = 'example';
		const mockEmail = 'example@gmail.com';
		const mockPassword = '12345678';
		const mockConfirmPassword = '12345678';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignUp,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const usernameField = screen.getByLabelText('Username', {
			selector: 'input',
		});
		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});
		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});
		const confirmPasswordField = screen.getByLabelText('Confirm Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(usernameField, mockUsername);
		await user.type(emailField, mockEmail);
		await user.type(passwordField, mockPassword);
		await user.type(confirmPasswordField, mockConfirmPassword);

		await user.click(submitButton);

		await waitForElementToBeRemoved(screen.queryByText('Loading component'));

		expect(requestRegister).toBeCalledTimes(1);
		expect(mockCustomHook.onModal).toBeCalledTimes(1);
		expect(usernameField).toHaveValue('');
		expect(emailField).toHaveValue('');
		expect(passwordField).toHaveValue('');
		expect(confirmPasswordField).toHaveValue('');
	});
	it('should change password of input type to text if the checkbox is clicked', async () => {
		const user = userEvent.setup();

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignUp,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});
		const confirmPasswordField = screen.getByLabelText('Confirm Password', {
			selector: 'input',
		});

		const checkbox = screen.getByLabelText('Show Password', {
			selector: 'input',
		});

		expect(passwordField).toHaveAttribute('type', 'password');
		expect(confirmPasswordField).toHaveAttribute('type', 'password');

		await user.click(checkbox);

		expect(passwordField).toHaveAttribute('type', 'text');
		expect(confirmPasswordField).toHaveAttribute('type', 'text');
	});
	it('should check if input errors are empty when the debounce is true and submit button is clicked', async () => {
		const user = userEvent.setup();

		const mockUsername = ' ';
		const mockEmail = 'example';
		const mockPassword = '123';
		const mockConfirmPassword = '44';

		vi.mocked(isEmpty).mockReturnValueOnce(false);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: SignUp,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const usernameField = screen.getByLabelText('Username', {
			selector: 'input',
		});
		const emailField = screen.getByLabelText('Email', {
			selector: 'input',
		});
		const passwordField = screen.getByLabelText('Password', {
			selector: 'input',
		});
		const confirmPasswordField = screen.getByLabelText('Confirm Password', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(usernameField, mockUsername);
		await user.type(emailField, mockEmail);
		await user.type(passwordField, mockPassword);
		await user.type(confirmPasswordField, mockConfirmPassword);

		await user.click(submitButton);

		await user.click(submitButton);
		expect(isEmpty).toBeCalledTimes(1);
	});
});
