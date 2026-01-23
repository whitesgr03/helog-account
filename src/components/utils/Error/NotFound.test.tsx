import { expect, describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { createRoutesStub } from 'react-router';

import { NotFound } from './NotFound';

describe('NotFound component', () => {
	it('should match snapshot', () => {
		const Stub = createRoutesStub([
			{
				path: '/',
				Component: NotFound,
			},
		]);

		const { asFragment } = render(<Stub />);

		const actual = asFragment();

		expect(actual).toMatchSnapshot();
	});
});
