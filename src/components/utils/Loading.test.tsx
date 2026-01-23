import { expect, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Loading } from './Loading';

describe('Loading component', () => {
	it('should render the text if the text prop is provided', () => {
		const mockProp = {
			text: 'loading',
		};

		render(<Loading {...mockProp} />);

		const element = screen.getByText(mockProp.text);

		expect(element).toBeInTheDocument();
	});
	it('should render the dark class if the dark prop is provided', () => {
		const mockProp = {
			dark: true,
			text: 'loading',
		};

		render(<Loading {...mockProp} />);

		const element = screen.getByText(mockProp.text);

		expect(element).toHaveClass(/dark/);
	});
	it('should render the light class if the light prop is provided', () => {
		const mockProp = {
			light: true,
			text: 'loading',
		};

		render(<Loading {...mockProp} />);

		const element = screen.getByText(mockProp.text);

		expect(element).toHaveClass(/light/);
	});
	it('should render the shadow class if the shadow prop is provided', () => {
		const mockProp = {
			shadow: true,
			text: 'loading',
		};

		render(<Loading {...mockProp} />);

		const element = screen.getByText(mockProp.text);

		expect(element).toHaveClass(/shadow/);
	});
	it('should render the blur class if the blur prop is provided', () => {
		const mockProp = {
			blur: true,
			text: 'loading',
		};

		render(<Loading {...mockProp} />);

		const element = screen.getByText(mockProp.text);

		expect(element).toHaveClass(/blur/);
	});
});
