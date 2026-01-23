import { expect, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub, Navigate } from 'react-router';
import { ErrorComponent } from './Error';

describe('Error component', () => {
	it('should render the "Go Back Previous Page" link if the "previousPath" state is provided', () => {
		const mockState = {
			previousPath: '/',
		};

		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () => <Navigate to={'/error'} state={{ ...mockState }} />,
			},
			{
				path: '/error',
				Component: ErrorComponent,
			},
		]);

		render(<Stub initialEntries={['/']} />);

		const element = screen.getByRole('link', { name: 'Go Back Previous Page' });

		expect(element).toBeInTheDocument();
	});
});
