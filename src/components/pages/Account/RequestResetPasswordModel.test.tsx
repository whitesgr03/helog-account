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
import { requestResetPassword } from '../../../lib/handleAccount';
import { formatDistanceStrict } from 'date-fns';

import { RequestResetPasswordModel } from './RequestResetPasswordModel';
import { Loading } from '../../utils/Loading';

import { useAppDataAPI } from '../AppContext';
import { verifySchema } from '../../../lib/verifySchema';

vi.mock('../../../lib/verifySchema', { spy: true });
vi.mock('../../../lib/handleAccount');
vi.mock('../../utils/Loading');
vi.mock('./VerificationCodeModel');
vi.mock('../AppContext');
vi.mock('lodash.isempty');
vi.mock('date-fns', { spy: true });

describe('RequestResetPasswordModel component', () => {
	const mockCustomHook = {
		onAlert: vi.fn(),
		onModal: vi.fn(),
	};
	beforeEach(() => {
		vi.mocked(useAppDataAPI).mockReturnValue(mockCustomHook);
		vi.mocked(Loading).mockImplementation(() => <div>Loading component</div>);
	});
	it('should change a field value if the field is entered', async () => {
		const user = userEvent.setup();

		const mockEmail = 'example@gmail';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: RequestResetPasswordModel,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Enter your Email', {
			selector: 'input',
		});

		await user.type(emailField, mockEmail);

		expect(emailField).toHaveValue(mockEmail);
	});
	it('should render a error field message and active debounce if the fields validation fails after submission', async () => {
		const user = userEvent.setup();

		const mockEmail = 'example';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: RequestResetPasswordModel,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Enter your Email', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(emailField, mockEmail);

		expect(screen.getAllByText('Message Placeholder')).toHaveLength(1);

		await user.click(submitButton);

		expect(screen.queryAllByText('Message Placeholder')).toHaveLength(0);

		await waitFor(() => {
			expect(verifySchema).toBeCalledTimes(2);
		});
	});
	it('should render a error field message and active debounce if the server validation fails after request registration', async () => {
		const user = userEvent.setup();

		const mockResolve = {
			data: {
				success: false,
				fields: {
					email: 'error',
				},
			},
		};

		vi.mocked(requestResetPassword).mockImplementationOnce(
			async () =>
				await new Promise(resolve =>
					setTimeout(() => resolve(mockResolve), 100),
				),
		);

		const mockEmail = 'example@gmail';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: RequestResetPasswordModel,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Enter your Email', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(emailField, mockEmail);

		await user.click(submitButton);

		await waitForElementToBeRemoved(screen.queryByText('Loading component'));

		expect(requestResetPassword).toBeCalledTimes(1);
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
				Component: RequestResetPasswordModel,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Enter your Email', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(emailField, mockEmail);

		await user.click(submitButton);

		await user.click(submitButton);
		expect(isEmpty).toBeCalledTimes(1);
	});
	it('should render a alert message if the user registered too many times', async () => {
		const user = userEvent.setup();

		const mockResponse = new Response('', {
			status: 429,
			headers: {
				'retry-after': '5000',
			},
		});

		vi.mocked(requestResetPassword).mockRejectedValueOnce(
			new Error('response error', { cause: mockResponse }),
		);

		const mockEmail = 'example@gmail';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: RequestResetPasswordModel,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Enter your Email', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(emailField, mockEmail);

		await user.click(submitButton);

		expect(formatDistanceStrict).toBeCalledTimes(1);
		expect(mockCustomHook.onAlert).toBeCalledTimes(1);
		expect(mockCustomHook.onModal).toBeCalledTimes(1);
	});
	it('should navigate to the "/error" path if an unknown error occurs', async () => {
		const user = userEvent.setup();

		const mockResponse = new Response('', {
			status: 500,
		});

		vi.mocked(requestResetPassword).mockRejectedValueOnce(
			new Error('response error', { cause: mockResponse }),
		);

		const mockEmail = 'example@gmail';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: RequestResetPasswordModel,
			},
			{
				path: '/error',
				Component: () => <div>Error component</div>,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Enter your Email', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(emailField, mockEmail);

		await user.click(submitButton);

		expect(mockCustomHook.onModal).toBeCalledTimes(1);
		expect(screen.getByText('Error component'));
	});
	it('should render a model if the user request resetting password is successful', async () => {
		const user = userEvent.setup();

		const mockResponse = {
			data: {
				success: true,
			},
			headers: new Response('', {
				status: 200,
				headers: {
					'expire-after': '5000',
				},
			}).headers,
		};

		vi.mocked(requestResetPassword).mockResolvedValueOnce(mockResponse);

		const mockEmail = 'example@gmail';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: RequestResetPasswordModel,
			},
			{
				path: '/error',
				Component: () => <div>Error component</div>,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const emailField = screen.getByLabelText('Enter your Email', {
			selector: 'input',
		});

		const submitButton = screen.getByRole('button', { name: 'Submit' });

		await user.type(emailField, mockEmail);

		await user.click(submitButton);

		expect(mockCustomHook.onModal).toBeCalledTimes(1);
	});
});
