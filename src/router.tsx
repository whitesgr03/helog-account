import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { App } from './components/pages/App';
import { SignIn } from './components/pages/Account/SignIn';
import { SignUp } from './components/pages/Account/SignUp';
import { AccountCreate } from './components/pages/Account/AccountCreate';
import { ErrorComponent } from './components/utils/Error/Error';
import { NotFound } from './components/utils/Error/NotFound';

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
					{
						path: 'sign-up',
						element: <SignUp />,
					},
					{
						path: 'create',
						element: <AccountCreate />,
					},
					{
						path: '*',
						element: <NotFound />,
					},
					{
						path: 'error',
						element: <ErrorComponent />,
					},
				],
			},
		])}
	/>
);
