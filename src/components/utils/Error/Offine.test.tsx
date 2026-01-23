import { expect, describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { createRoutesStub } from 'react-router';

import { Offline } from './Offline';

describe('Offline component', () => {
	it('should match snapshot', () => {
		const Stub = createRoutesStub([
			{
				path: '/',
				Component: Offline,
			},
		]);

		const { asFragment } = render(<Stub />);

		const actual = asFragment();

		expect(actual).toMatchSnapshot();
	});
});
