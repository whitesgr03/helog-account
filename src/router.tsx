import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { App } from './components/pages/App';

export const Router = () => (
	<RouterProvider
		router={createBrowserRouter([
			{
				path: '/',
				element: <App />,
			},
		])}
	/>
);
