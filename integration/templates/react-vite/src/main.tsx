import { ClerkProvider } from '@clerk/clerk-react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, useNavigate } from 'react-router-dom';

import App from './App.tsx';
import Protected from './protected';
import SignIn from './sign-in';
import SignInPopup from './sign-in-popup';
import SignUp from './sign-up';
import UserProfile from './user';
import UserProfileCustom from './custom-user-profile';
import UserButtonCustom from './custom-user-button';
import UserButtonCustomDynamicLabels from './custom-user-button/with-dynamic-labels.tsx';
import UserButtonCustomDynamicLabelsAndCustomPages from './custom-user-button/with-dynamic-label-and-custom-pages.tsx';
import UserButtonCustomTrigger from './custom-user-button-trigger';
import UserButtonCustomDynamicItems from './custom-user-button/with-dynamic-items.tsx';
import UserButton from './user-button';
import UserAvatar from './user-avatar';
import Waitlist from './waitlist';
import OrganizationProfile from './organization-profile';
import OrganizationList from './organization-list';
import CreateOrganization from './create-organization';
import OrganizationSwitcher from './organization-switcher';
import Buttons from './buttons';
import ClerkStatusPage from './clerk-status';

const Root = () => {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      // @ts-ignore
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string}
      clerkJSUrl={import.meta.env.VITE_CLERK_JS_URL as string}
      routerPush={(to: string) => navigate(to)}
      routerReplace={(to: string) => navigate(to, { replace: true })}
      experimental={{
        persistClient: import.meta.env.VITE_EXPERIMENTAL_PERSIST_CLIENT
          ? import.meta.env.VITE_EXPERIMENTAL_PERSIST_CLIENT === 'true'
          : undefined,
      }}
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
        path: '/sign-in-popup/*',
        element: <SignInPopup />,
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
        path: '/user-button',
        element: <UserButton />,
      },
      {
        path: '/user-avatar',
        element: <UserAvatar />,
      },
      {
        path: '/protected',
        element: <Protected />,
      },
      {
        path: '/buttons',
        element: <Buttons />,
      },
      {
        path: '/custom-user-profile/*',
        element: <UserProfileCustom />,
      },
      {
        path: '/custom-user-button',
        element: <UserButtonCustom />,
      },
      {
        path: '/custom-user-button-dynamic-items',
        element: <UserButtonCustomDynamicItems />,
      },
      {
        path: '/custom-user-button-dynamic-labels',
        element: <UserButtonCustomDynamicLabels />,
      },
      {
        path: '/custom-user-button-dynamic-labels-and-custom-pages',
        element: <UserButtonCustomDynamicLabelsAndCustomPages />,
      },
      {
        path: '/custom-user-button-trigger',
        element: <UserButtonCustomTrigger />,
      },
      {
        path: '/waitlist',
        element: <Waitlist />,
      },
      {
        path: '/organization-profile',
        element: <OrganizationProfile />,
      },
      {
        path: '/organization-list',
        element: <OrganizationList />,
      },
      {
        path: '/organization-switcher',
        element: <OrganizationSwitcher />,
      },
      {
        path: '/create-organization',
        element: <CreateOrganization />,
      },
      {
        path: '/clerk-status',
        element: <ClerkStatusPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
