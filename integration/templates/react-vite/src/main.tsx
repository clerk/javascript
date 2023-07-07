import { ClerkProvider } from '@clerk/clerk-react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, useNavigate } from 'react-router-dom';

import App from './App.tsx';
import Protected from './protected';
import SignIn from './sign-in';
import SignUp from './sign-up';

const Root = () => {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      // @ts-ignore
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string}
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
        path: '/protected',
        element: <Protected />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
