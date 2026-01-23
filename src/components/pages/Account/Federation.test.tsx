import { expect, describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router';

import { Federation } from './Federation';

describe('Federation component', () => {
	it('should execute onLoading prop if the federation links is clicked', async () => {
		const user = userEvent.setup();

		const mockProps = {
			onLoading: vi.fn(),
		};

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () => <Federation {...mockProps} />,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const links: HTMLAnchorElement[] = screen.getAllByRole('link');

		for (const link of links) {
			await user.click(link);
		}

		expect(mockProps.onLoading).toBeCalledTimes(links.length);
	});
});
