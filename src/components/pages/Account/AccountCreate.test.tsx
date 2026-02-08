import { expect, describe, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { createRoutesStub } from 'react-router';

import { AccountCreate } from './AccountCreate';

import { register } from '../../../lib/handleAccount';
import { formatDistanceStrict } from 'date-fns';

import { useAppDataAPI } from '../AppContext';
import { Loading } from '../../utils/Loading';

vi.mock('../AppContext');
vi.mock('../../utils/Loading');
vi.mock('../../../lib/handleAccount');
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
	it('should navigate to sign in page if the params is not provided', async () => {
		const Stub = createRoutesStub([
			{
				path: '/',
				Component: AccountCreate,
			},

			{
				path: '/sign-in',
				Component: () => <div>Sign in component</div>,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		expect(screen.getByText('Sign in component'));
	});
	it('should render a modal and navigate to sign up page if the user registration failed', async () => {
		vi.mocked(register).mockResolvedValueOnce({ success: false });

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: AccountCreate,
			},
			{
				path: '/sign-up',
				Component: () => <div>Sign up component</div>,
			},
		]);

		render(<Stub initialEntries={[`/?token='123456'&identity='1'`]} />);

		expect(screen.getByText('Loading component'));
		expect(register).toBeCalledTimes(1);

		expect(await screen.findByText('Sign up component'));
		expect(mockCustomHook.onModal).toBeCalledTimes(1);
	});
	it('should render an alert message if the user registered too many times', async () => {
		const mockResponse = new Response('', {
			status: 429,
			headers: {
				'retry-after': '5000',
			},
		});

		vi.mocked(register).mockRejectedValueOnce(
			new Error('response error', { cause: mockResponse }),
		);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: AccountCreate,
			},
		]);

		render(<Stub initialEntries={[`/?token='123456'&identity='1'`]} />);

		await waitFor(() => {
			expect(formatDistanceStrict).toBeCalledTimes(1);
			expect(mockCustomHook.onAlert).toBeCalledTimes(1);
		});
	});
	it('should navigate to error page if an unknown error occurs', async () => {
		const mockResponse = new Response('', {
			status: 500,
		});

		vi.mocked(register).mockRejectedValueOnce(
			new Error('response error', { cause: mockResponse }),
		);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: AccountCreate,
			},
			{
				path: '/error',
				Component: () => <div>Error component</div>,
			},
		]);

		render(<Stub initialEntries={[`/?token='123456'&identity='1'`]} />);

		expect(await screen.findByText('Error component'));
	});
	it('should render an alert message and navigate to sign in page if the user registered successful', async () => {
		vi.mocked(register).mockResolvedValueOnce({ success: true });

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: AccountCreate,
			},
			{
				path: 'sign-in',
				Component: () => <div>Sign in component</div>,
			},
		]);

		render(<Stub initialEntries={[`/?token='123456'&identity='1'`]} />);

		expect(await screen.findByText('Sign in component'));
		expect(mockCustomHook.onAlert).toBeCalledTimes(1);
	});
});
