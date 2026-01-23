import { describe, it, expect } from 'vitest';

import { render } from '@testing-library/react';

import { Header } from './Header';

describe('Header component', () => {
	it('should match snapshot', () => {
		const { asFragment } = render(<Header />);

		const actual = asFragment();

		expect(actual).toMatchSnapshot();
	});
});
