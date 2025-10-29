import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('Waitlist hook (react-vite)', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    app = await appConfigs.react.vite
      .clone()
      .addFile(
        'src/waitlist-hook.tsx',
        () => `import React from 'react';
import { useWaitlist } from '@clerk/react';

export default function WaitlistHook() {
  const { waitlist, fetchStatus, errors } = useWaitlist();
  const [email, setEmail] = React.useState('');
  const [done, setDone] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await waitlist.join({ emailAddress: email });
    if (!error) {
      setDone(true);
    }
  };

  return (
    <div className="e2e-waitlist-hook">
      <form onSubmit={onSubmit}>
        <label htmlFor="emailAddress">Email</label>
        <input
          id="emailAddress"
          name="emailAddress"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit">Join the waitlist</button>
      </form>
      {fetchStatus === 'fetching' && <p>Loading...</p>}
      {done && <p>Thanks for joining the waitlist!</p>}
      {errors.fields.emailAddress && <p role="alert">{errors.fields.emailAddress.message}</p>}
    </div>
  );
}
`,
      )
      .addFile(
        'src/main.tsx',
        () => `import { ClerkProvider } from '@clerk/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, useNavigate } from 'react-router-dom';

import App from './App.tsx';
import Protected from './protected';
import SignIn from './sign-in';
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
import WaitlistHook from './waitlist-hook';

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
      { path: '/', element: <App /> },
      { path: '/sign-in/*', element: <SignIn /> },
      { path: '/sign-up/*', element: <SignUp /> },
      { path: '/user/*', element: <UserProfile /> },
      { path: '/user-button', element: <UserButton /> },
      { path: '/user-avatar', element: <UserAvatar /> },
      { path: '/protected', element: <Protected /> },
      { path: '/buttons', element: <Buttons /> },
      { path: '/custom-user-profile/*', element: <UserProfileCustom /> },
      { path: '/custom-user-button', element: <UserButtonCustom /> },
      { path: '/custom-user-button-dynamic-items', element: <UserButtonCustomDynamicItems /> },
      { path: '/custom-user-button-dynamic-labels', element: <UserButtonCustomDynamicLabels /> },
      { path: '/custom-user-button-dynamic-labels-and-custom-pages', element: <UserButtonCustomDynamicLabelsAndCustomPages /> },
      { path: '/custom-user-button-trigger', element: <UserButtonCustomTrigger /> },
      { path: '/waitlist', element: <Waitlist /> },
      { path: '/waitlist-hook', element: <WaitlistHook /> },
      { path: '/organization-profile', element: <OrganizationProfile /> },
      { path: '/organization-list', element: <OrganizationList /> },
      { path: '/organization-switcher', element: <OrganizationSwitcher /> },
      { path: '/create-organization', element: <CreateOrganization /> },
      { path: '/clerk-status', element: <ClerkStatusPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
`,
      )
      .commit();

    await app.setup();
    await app.withEnv(appConfigs.envs.withWaitlistdMode);
    await app.dev();

    const m = createTestUtils({ app });
    fakeUser = m.services.users.createFakeUser({
      withUsername: true,
      fictionalEmail: true,
      withPhoneNumber: true,
    });
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('Join the waitlist using useWaitlist hook', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/waitlist-hook');

    // Wait for our custom hook page
    await u.po.waitlist.waitForMounted('.e2e-waitlist-hook');

    // Use existing page object helpers (expects input[name=emailAddress])
    await u.po.waitlist.joinWaitlist({ email: fakeUser.email });

    await expect(u.page.getByText(/Thanks for joining the waitlist!/i).first()).toBeVisible();
  });
});
