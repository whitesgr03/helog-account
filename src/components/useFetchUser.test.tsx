import { expect, describe, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { useFetchUser } from './useFetchUser';

import { getUserInfo } from '../lib/handleUser';

vi.mock('../lib/handleUser');

describe('useFetchUser hook', () => {
	it('should set "isError" to true if the server is response an unknown error', async () => {
		vi.mocked(getUserInfo).mockRejectedValue(new Error('error'));

		const { result } = renderHook(() => useFetchUser());

		expect(result.current).toEqual({
			isError: false,
			isLogin: false,
			isLoading: true,
		});

		await waitFor(() => {
			expect(result.current).toEqual({
				isError: true,
				isLogin: false,
				isLoading: false,
			});
		});
	});
	it('should set "isLogin" to true if the server is response success false', async () => {
		vi.mocked(getUserInfo).mockResolvedValueOnce({ success: true });

		const { result } = renderHook(() => useFetchUser());

		await waitFor(() => {
			expect(result.current).toEqual({
				isError: false,
				isLogin: true,
				isLoading: false,
			});
		});
	});
	it('should not set if the server is response success false', async () => {
		vi.mocked(getUserInfo).mockResolvedValueOnce({ success: false });

		const { result } = renderHook(() => useFetchUser());

		await waitFor(() => {
			expect(result.current).toEqual({
				isError: false,
				isLogin: false,
				isLoading: false,
			});
		});
	});
});
