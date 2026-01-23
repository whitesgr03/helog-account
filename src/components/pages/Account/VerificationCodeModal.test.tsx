import { expect, describe, it, vi, beforeEach } from 'vitest';
import {
	render,
	screen,
	waitFor,
	waitForElementToBeRemoved,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router';

import { verifyCode } from '../../../lib/handleAccount';
import { useAppDataAPI } from '../AppContext';

import { Loading } from '../../utils/Loading';
import { VerificationCodeModal } from './VerificationCodeModal';

vi.mock('../AppContext');
vi.mock('../../../lib/handleAccount');
vi.mock('../../utils/Loading');
vi.mock('../AppContext');

describe('VerificationCodeModal component', () => {
	const mockCustomHook = {
		onAlert: () => {},
		onModal: vi.fn(),
	};
	beforeEach(() => {
		vi.mocked(useAppDataAPI).mockReturnValue(mockCustomHook);
	});
	it('should render a modal if the verification code is expired', async () => {
		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					VerificationCodeModal({
						email: 'example@gmail',
						codeExpireAfter: 1,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);
		await waitFor(() => {
			expect(mockCustomHook.onModal).toBeCalledTimes(1);
		});
	});
	it('should render a error messages if the field validation fails after input', async () => {
		const user = userEvent.setup();
		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					VerificationCodeModal({
						email: 'example@gmail',
						codeExpireAfter: 10000,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const codeField = screen.getByLabelText('Code', {
			selector: 'input',
		});

		expect(screen.getByTestId('errorMessage')).toBeEmptyDOMElement();

		await user.type(codeField, 'a');

		expect(screen.getByTestId('errorMessage')).not.toBeEmptyDOMElement();
	});
	it('should render a error messages if the server verification code failed', async () => {
		const user = userEvent.setup();
		const mockResponse = {
			data: {
				success: false,
			},
		};
		vi.mocked(Loading).mockImplementation(() => <div>Loading component</div>);
		vi.mocked(verifyCode).mockImplementationOnce(
			async () =>
				await new Promise(resolve =>
					setTimeout(() => resolve(mockResponse), 100),
				),
		);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					VerificationCodeModal({
						email: 'example@gmail',
						codeExpireAfter: 100000,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const codeField = screen.getByLabelText('Code', {
			selector: 'input',
		});

		await user.type(codeField, '123456');

		await waitForElementToBeRemoved(screen.queryByText('Loading component'));

		expect(codeField).not.toHaveFocus();
		expect(screen.getByTestId('errorMessage')).not.toBeEmptyDOMElement();
	});
	it('should render a modal if the verification code was failed too many times', async () => {
		const user = userEvent.setup();
		const mockResponse = {
			data: {
				success: false,
				fields: {
					code: 'error',
				},
			},
		};

		vi.mocked(verifyCode).mockResolvedValue(mockResponse);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					VerificationCodeModal({
						email: 'example@gmail',
						codeExpireAfter: 100000,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const codeField = screen.getByLabelText('Code', {
			selector: 'input',
		});

		for (let i = 0; i < 4; i++) {
			await user.type(codeField, '123456');
			await user.clear(codeField);
		}

		expect(verifyCode).toBeCalledTimes(3);
		expect(mockCustomHook.onModal).toBeCalledTimes(1);
	});
	it('should navigate to the "/error" path if an unknown error occurs', async () => {
		const user = userEvent.setup();

		const mockResponse = new Response('', {
			status: 500,
		});
		vi.mocked(verifyCode).mockRejectedValueOnce(
			new Error('response error', { cause: mockResponse }),
		);
		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					VerificationCodeModal({
						email: 'example@gmail',
						codeExpireAfter: 100000,
					}),
			},
			{
				path: '/error',
				Component: () => <div>error component</div>,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const codeField = screen.getByLabelText('Code', {
			selector: 'input',
		});

		await user.type(codeField, '123456');

		expect(mockCustomHook.onModal).toBeCalledTimes(1);
		expect(screen.getByText('error component'));
	});
	it('should render a modal if the verification code is successful', async () => {
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

		vi.mocked(verifyCode).mockResolvedValueOnce(mockResponse);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () =>
					VerificationCodeModal({
						email: 'example@gmail',
						codeExpireAfter: 100000,
					}),
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const codeField = screen.getByLabelText('Code', {
			selector: 'input',
		});

		await user.type(codeField, '123456');

		expect(mockCustomHook.onModal).toBeCalledTimes(1);
	});
});
