import { ClerkProvider } from '@clerk/clerk-react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, useNavigate } from 'react-router-dom';

import App from './App.tsx';
import Protected from './protected';
import SignIn from './sign-in';
import SignUp from './sign-up';
import UserProfile from './user';
import SignInHash from './hash/sign-in';
import SignUpHash from './hash/sign-up';
import UserProfileHash from './hash/user';

const Root = () => {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      // @ts-ignore
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string}
      clerkJSUrl={import.meta.env.VITE_CLERK_JS as string}
      navigate={(to: string) => navigate(to)}
    >
      <Outlet />
    </ClerkProvider>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/sign-in/*',
        element: <SignIn />,
      },
      {
        path: '/sign-up/*',
        element: <SignUp />,
      },
      {
        path: '/user/*',
        element: <UserProfile />,
      },
      {
        path: '/protected',
        element: <Protected />,
      },
      {
        path: '/hash/sign-up/*',
        element: <SignUpHash />,
      },
      {
        path: '/hash/sign-in/*',
        element: <SignInHash />,
      },
      {
        path: '/hash/user/*',
        element: <UserProfileHash />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
