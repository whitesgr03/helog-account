import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { useFetchUser } from '../useFetchUser';

import { App } from './App';

import { Header } from '../layout/header/Header';
import { Loading } from '../utils/Loading';
import { ErrorComponent } from '../utils/Error/Error';
import { Modal } from './Modal';
import { Alert } from './Alert';
import { Footer } from '../layout/footer/Footer';
import { Offline } from '../utils/Error/Offline';

vi.mock('../layout/header/Header');
vi.mock('../utils/Loading');
vi.mock('../utils/Error/Error');
vi.mock('../utils/Error/Offline');
vi.mock('./Modal');
vi.mock('./Alert');
vi.mock('../layout/footer/Footer');
vi.mock('../useFetchUser');

describe('App component', () => {
	beforeEach(() => {
		window.scrollTo = vi.fn();
	});
	it('should render the Loading component if the isLoading state is true', async () => {
		vi.mocked(useFetchUser).mockReturnValueOnce({
			isError: false,
			isLoading: true,
			isLogin: false,
		});
		vi.mocked(Loading).mockImplementation(() => <div>Loading component</div>);

		vi.stubGlobal('history', {
			replaceState: vi.fn(),
		});

		window.location.hash = '#_=_';

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: App,
			},
		]);

		render(<Stub initialEntries={['/']} />);
		expect(screen.getByText('Loading component'));
		expect(window.history.replaceState).toBeCalledTimes(1);
	});
	it('should render the Error component if the isError state is true', async () => {
		vi.mocked(useFetchUser).mockReturnValueOnce({
			isError: true,
			isLoading: false,
			isLogin: false,
		});
		vi.mocked(ErrorComponent).mockImplementation(() => (
			<div>Error component</div>
		));

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: App,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		expect(screen.getByText('Error component'));
	});
	it('should render the Loading component and redirecting to home page if the isLogin state is true', async () => {
		vi.mocked(useFetchUser).mockReturnValueOnce({
			isError: false,
			isLoading: false,
			isLogin: true,
		});
		vi.mocked(Loading).mockImplementation(() => <div>Loading component</div>);

		vi.stubGlobal('location', {
			assign: vi.fn(),
		});

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: App,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		expect(screen.getByText('Loading component'));
		expect(window.location.assign).toBeCalledTimes(1);
	});
	it('should render the main components if the isError, isLogin and isLoading are not true', async () => {
		vi.mocked(useFetchUser).mockReturnValueOnce({
			isError: false,
			isLoading: false,
			isLogin: false,
		});

		vi.mocked(Header).mockImplementation(() => <div>Header component</div>);
		vi.mocked(Alert).mockImplementation(() => <div>Alert component</div>);
		vi.mocked(Modal).mockImplementation(() => <div>Modal component</div>);
		vi.mocked(Footer).mockImplementation(() => <div>Footer component</div>);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: App,
				children: [
					{ index: true, Component: () => <div>Outlet component</div> },
				],
			},
		]);

		render(<Stub initialEntries={['/']} />);

		expect(screen.getByText('Header component'));
		expect(screen.getByText('Alert component'));
		expect(screen.getByText('Modal component'));
		expect(screen.getByText('Footer component'));
		expect(screen.getByText('Outlet component'));
	});
	it('should detect offline state then online state', async () => {
		vi.mocked(useFetchUser).mockReturnValue({
			isError: false,
			isLoading: false,
			isLogin: false,
		});

		vi.mocked(Header).mockImplementation(() => <div>Header component</div>);
		vi.mocked(Modal).mockImplementation(() => <div>Modal component</div>);
		vi.mocked(Alert).mockImplementation(() => <div>Alert component</div>);
		vi.mocked(Footer).mockImplementation(() => <div>Footer component</div>);
		vi.mocked(Offline).mockImplementation(() => <div>Offline component</div>);

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: App,
				children: [
					{ index: true, Component: () => <div>Outlet component</div> },
				],
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const offlineEvent = new Event('offline');
		const onlineEvent = new Event('online');

		await waitFor(() => {
			window.dispatchEvent(offlineEvent);
		});

		expect(screen.getByText('Offline component'));

		await waitFor(() => {
			window.dispatchEvent(onlineEvent);
		});

		expect(screen.getByText('Outlet component'));
	});
});
