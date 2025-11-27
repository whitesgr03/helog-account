import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { App } from './components/pages/App';
import { SignIn } from './components/pages/Account/SignIn';

export const Router = () => (
	<RouterProvider
		router={createBrowserRouter([
			{
				path: '/',
				element: <App />,
				children: [
					{
						index: true,
						element: <Navigate to="/sign-in" />,
					},
					{
						path: 'sign-in',
						element: <SignIn />,
					},
				],
			},
		])}
	/>
);
