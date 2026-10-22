import { Clerk } from '@clerk/clerk-js';
import type { UserSnapshot } from '@clerk/loom';
import { LoomProvider, useLoom } from '@clerk/loom/react';
import { ClerkContextProvider } from '@clerk/shared/react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Suspense } from 'react';
import { renderToReadableStream, renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { fapiUrl, holdRequests, publishableKey, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnterpriseAccount,
  fapiEnvironment,
  fapiExternalAccount,
  fapiSession,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { UserProfileSecurityPanel } from '../../../features/user-profile/user-profile-security-panel';
import { MosaicProvider } from '../../../mosaic-provider';
import { LoomDanger, LoomPassword } from '../loom-account-status';
import { LoomComposedProfile } from '../loom-composed-profile';
import { profileSettings } from './profile-fixture';

const reconciledUser = fapiUser({
  id: 'user_1',
  first_name: 'Alice',
  password_enabled: false,
  external_accounts: [
    fapiExternalAccount({ id: 'cached_google', provider: 'google', approvedScopes: '', username: 'alice-google' }),
  ],
});

function seed(clerk: Clerk, overrides: Partial<UserSnapshot> = {}) {
  return {
    version: 5 as const,
    profileSettings: { data: profileSettings, updatedAt: Date.now() },
    scope: {
      instanceKey: JSON.stringify([clerk.publishableKey, clerk.frontendApi, clerk.proxyUrl ?? '', clerk.domain]),
      userId: 'user_1',
      sessionId: 'sess_1',
    },
    user: {
      data: {
        id: 'user_1',
        firstName: 'Alice',
        lastName: null,
        username: null,
        imageUrl: '',
        hasImage: false,
        primaryEmailAddressId: null,
        emailAddresses: [],
        passwordEnabled: false,
        deleteSelfEnabled: true,
        enterpriseAccounts: [],
        externalAccounts: [
          {
            id: 'cached_google',
            provider: 'google',
            approvedScopes: '',
            username: 'alice-google',
            emailAddress: '',
            verification: { status: 'verified', strategy: null, expireAt: null, error: null },
          },
          {
            id: 'pending_github',
            provider: 'github',
            approvedScopes: '',
            username: 'alice-github',
            emailAddress: '',
            verification: { status: 'pending', strategy: null, expireAt: null, error: null },
          },
          {
            id: 'null_apple',
            provider: 'apple',
            approvedScopes: '',
            username: null,
            emailAddress: 'apple@example.com',
            verification: null,
          },
        ],
        ...overrides,
      },
      updatedAt: Date.now(),
    },
  };
}

function tree(clerk: Clerk, hydration: ReturnType<typeof seed>, security = false) {
  return (
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider>
        <LoomProvider
          clerk={clerk}
          hydration={hydration}
        >
          {security ? <UserProfileSecurityPanel passwordSection={<LoomPassword />} /> : <LoomComposedProfile />}
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>
  );
}

describe('Loom account status', () => {
  it('server renders verified connected accounts and readonly danger without actions', () => {
    serveFapi({});
    const clerk = new Clerk(publishableKey());
    const html = renderToString(tree(clerk, seed(clerk)));
    expect(html).toContain('alice-google');
    expect(html).not.toContain('alice-github');
    expect(html).not.toContain('apple@example.com');
    expect(html).toContain('Permanently delete this account');
    expect(html).toContain('Manage Google');
    expect(html).toContain('Delete account');
    const view = render(tree(clerk, seed(clerk)));
    const danger = screen.getByRole('group', { name: 'Danger zone' });
    expect(within(danger).getByRole('button', { name: 'Delete account' })).toBeDisabled();
    view.unmount();
  });

  it('server renders while the preloaded Clerk host has no frontend API runtime yet', () => {
    serveFapi({});
    const clerk = new Clerk(publishableKey());
    const hydration = seed(clerk, { externalAccounts: [] });
    Object.defineProperty(clerk, 'frontendApi', { value: '', configurable: true });
    expect(clerk.loaded).toBe(false);
    const html = renderToString(tree(clerk, hydration));
    expect(html).toContain('Alice');
    expect(html).toContain('GitHub');
    expect(html).toContain('Google');
    expect(html).toContain('X / Twitter');
    expect(html).toContain('Permanently delete this account');
  });

  it('server renders password presence without controls in the actual Security panel', () => {
    serveFapi({});
    const clerk = new Clerk(publishableKey());
    const absent = renderToString(tree(clerk, seed(clerk), true));
    expect(absent).toContain('No password set');
    expect(absent).toContain('Set password');
    const present = renderToString(tree(clerk, seed(clerk, { passwordEnabled: true }), true));
    expect(present).toContain('••••');
    expect(present).toContain('Change password');
  });

  it('renders configured providers without linked accounts and omits disabled danger', () => {
    serveFapi({});
    const clerk = new Clerk(publishableKey());
    const view = render(
      tree(clerk, seed(clerk, { externalAccounts: [], enterpriseAccounts: [], deleteSelfEnabled: false })),
    );
    expect(screen.getByRole('group', { name: 'Connected accounts' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Danger zone' })).not.toBeInTheDocument();
    view.unmount();
  });

  it('enables Connect when the live user has no linked accounts', async () => {
    serveFapi({
      environment: fapiEnvironment({
        user_settings: {
          social: {
            oauth_google: {
              enabled: true,
              required: false,
              authenticatable: true,
              strategy: 'oauth_google',
              name: 'Google',
              logo_url: null,
            },
          },
        },
      }),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', external_accounts: [] }) })]),
    });
    const clerk = new Clerk(publishableKey());
    await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
    const view = render(tree(clerk, seed(clerk, { externalAccounts: [] })));
    expect(await screen.findByRole('button', { name: 'Connect Google' })).toBeEnabled();
    view.unmount();
  });

  it('submits a new password through the Loom action and closes the editor', async () => {
    const fapi = serveFapi({
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', password_enabled: false }) })]),
    });
    const clerk = new Clerk(publishableKey());
    await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
    const view = render(tree(clerk, seed(clerk, { passwordEnabled: false }), true));
    const actor = userEvent.setup();
    await actor.click(await screen.findByRole('button', { name: 'Set password' }));
    await actor.type(screen.getByLabelText('New password'), 'new-password-123');
    await actor.type(screen.getByLabelText('Confirm password'), 'new-password-123');
    await actor.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fapi.passwordUpdates[0]?.get('new_password')).toBe('new-password-123');
    view.unmount();
  });

  it('renders reconciled rows while host actions resolve their own resources', async () => {
    const user = fapiUser({
      id: 'user_1',
      external_accounts: [
        fapiExternalAccount({ id: 'host_github', provider: 'github', approvedScopes: '', username: 'host-github' }),
      ],
    });
    serveFapi({
      environment: fapiEnvironment({
        user_settings: {
          social: {
            oauth_github: {
              enabled: true,
              required: false,
              authenticatable: true,
              strategy: 'oauth_github',
              name: 'GitHub',
              logo_url: null,
            },
          },
        },
      }),
      client: fapiClient([fapiSession({ id: 'sess_1', user })]),
    });
    const clerk = new Clerk(publishableKey());
    const hydration = seed(clerk);
    worker.use(http.get(fapiUrl('/v1/me'), () => HttpResponse.json({ response: reconciledUser })));
    const view = render(tree(clerk, hydration));
    const accounts = screen.getByRole('group', { name: 'Connected accounts' });
    expect(within(accounts).getByText('alice-google')).toBeInTheDocument();
    expect(
      within(accounts)
        .getAllByRole('button')
        .every(button => button.hasAttribute('disabled')),
    ).toBe(true);
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    view.rerender(tree(clerk, hydration));
    expect(screen.queryByText('host-github')).not.toBeInTheDocument();
    expect(await screen.findByText('alice-google')).toBeInTheDocument();
    expect(clerk.user?.externalAccounts[0]?.username).toBe('host-github');
    expect(screen.getByRole('button', { name: /Manage Google/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Connect GitHub' })).toBeDisabled();
    view.unmount();
  });

  it('keeps prefetched social settings after reconciling user data', async () => {
    serveFapi({
      environment: fapiEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    });
    const clerk = new Clerk(publishableKey());
    const hydration = seed(clerk);
    worker.use(http.get(fapiUrl('/v1/me'), () => HttpResponse.json({ response: reconciledUser })));
    const view = render(tree(clerk, hydration));
    expect(screen.getByText('alice-google')).toBeInTheDocument();
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    view.rerender(tree(clerk, hydration));
    expect(await screen.findByText('alice-google')).toBeInTheDocument();
    view.unmount();
  });

  it('lets the host supply set-password availability and enterprise readonly policy', async () => {
    const user = fapiUser({ id: 'user_1', password_enabled: false });
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
    const clerk = new Clerk(publishableKey());
    const hydration = seed(clerk);
    const view = render(tree(clerk, hydration, true));
    expect(screen.getByText('No password set')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set password' })).toBeDisabled();
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    view.rerender(tree(clerk, hydration, true));
    expect(await screen.findByRole('button', { name: 'Set password' })).toBeInTheDocument();
    view.unmount();
  });

  it('renders reconciled password status while host enterprise policy prevents edits', async () => {
    const user = fapiUser({
      id: 'user_1',
      password_enabled: true,
      enterprise_accounts: [fapiEnterpriseAccount({ id: 'ent_1' })],
    });
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
    const clerk = new Clerk(publishableKey());
    const hydration = seed(clerk, { passwordEnabled: false });
    worker.use(http.get(fapiUrl('/v1/me'), () => HttpResponse.json({ response: reconciledUser })));
    const view = render(tree(clerk, hydration, true));
    expect(screen.getByText('No password set')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set password' })).toBeDisabled();
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    view.rerender(tree(clerk, hydration, true));
    expect(await screen.findByRole('button', { name: 'Set password' })).toBeDisabled();
    expect(clerk.user?.passwordEnabled).toBe(true);
    expect(clerk.user?.enterpriseAccounts).toHaveLength(1);
    expect(screen.queryByText('Managed by Company SSO')).not.toBeInTheDocument();
    expect(screen.getByText('No password set')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Change password' })).not.toBeInTheDocument();
    view.unmount();
  });

  it('keeps prefetched password settings after reconciling user data', async () => {
    const environment = fapiEnvironment();
    environment.user_settings.attributes.password.enabled = false;
    serveFapi({ environment, client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]) });
    const clerk = new Clerk(publishableKey());
    const hydration = seed(clerk);
    worker.use(http.get(fapiUrl('/v1/me'), () => HttpResponse.json({ response: reconciledUser })));
    const view = render(tree(clerk, hydration, true));
    expect(screen.getByText('No password set')).toBeInTheDocument();
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    view.rerender(tree(clerk, hydration, true));
    expect(await screen.findByRole('group', { name: 'Password' })).toBeInTheDocument();
    view.unmount();
  });

  it('renders reconciled danger visibility without an action when host disables deletion', async () => {
    serveFapi({
      client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', delete_self_enabled: false }) })]),
    });
    const clerk = new Clerk(publishableKey());
    const hydration = seed(clerk);
    worker.use(http.get(fapiUrl('/v1/me'), () => HttpResponse.json({ response: reconciledUser })));
    const view = render(tree(clerk, hydration));
    expect(screen.getByRole('group', { name: 'Danger zone' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete account' })).toBeDisabled();
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    view.rerender(tree(clerk, hydration));
    expect(await screen.findByRole('group', { name: 'Danger zone' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete account' })).toBeDisabled();
    expect(clerk.user?.deleteSelfEnabled).toBe(false);
    view.unmount();
  });

  it('does not show cached status after the host switches user or session', async () => {
    const alice = fapiUser({ id: 'user_1' });
    const bob = fapiUser({ id: 'user_2' });
    serveFapi({
      client: fapiClient([
        fapiSession({ id: 'sess_1', user: alice }),
        fapiSession({ id: 'sess_2', user: alice }),
        fapiSession({ id: 'sess_3', user: bob }),
      ]),
    });
    const clerk = new Clerk(publishableKey());
    const hydration = seed(clerk);
    const view = render(tree(clerk, hydration));
    expect(screen.getByText('alice-google')).toBeInTheDocument();
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    view.rerender(tree(clerk, hydration));
    await act(() => clerk.setActive({ session: 'sess_2' }));
    view.rerender(tree(clerk, hydration));
    expect(screen.queryByText('alice-google')).not.toBeInTheDocument();
    await act(() => clerk.setActive({ session: 'sess_3' }));
    view.rerender(tree(clerk, hydration));
    expect(screen.queryByText('alice-google')).not.toBeInTheDocument();
    view.unmount();
  });

  it('removes cached status when the host confirms sign-out', async () => {
    serveFapi({});
    const clerk = new Clerk(publishableKey());
    const hydration = seed(clerk);
    const view = render(tree(clerk, hydration));
    expect(screen.getByText('alice-google')).toBeInTheDocument();
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    view.rerender(tree(clerk, hydration));
    await waitFor(() => expect(screen.queryByText('alice-google')).not.toBeInTheDocument());
    view.unmount();
  });

  it('keeps profile sections pending while a cold Loom user query is held', async () => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]) });
    const clerk = new Clerk(publishableKey());
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    const held = holdRequests('get', '/v1/me');
    const view = render(
      <ClerkContextProvider
        clerk={clerk}
        clerkStatus={clerk.status}
      >
        <MosaicProvider>
          <LoomProvider clerk={clerk}>
            <LoomComposedProfile />
          </LoomProvider>
        </MosaicProvider>
      </ClerkContextProvider>,
    );
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Connected accounts' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Danger zone' })).not.toBeInTheDocument();
    held.release();
    view.unmount();
  });
});

it('renders danger from a user-only snapshot with disabled deletion before Clerk readiness', () => {
  serveFapi({});
  const clerk = new Clerk(publishableKey());
  const { profileSettings: _settings, ...hydration } = seed(clerk);
  const html = renderToString(
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider>
        <LoomProvider
          clerk={null}
          hydration={hydration}
        >
          <LoomDanger />
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>,
  );
  expect(html).toContain('Permanently delete this account');
  const document = new DOMParser().parseFromString(html, 'text/html');
  expect(document.querySelector('button')?.disabled).toBe(true);
});

it('loads standalone Password from the existing Clerk host', async () => {
  serveFapi({
    environment: fapiEnvironment(),
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', password_enabled: false }) })]),
  });
  const clerk = new Clerk(publishableKey());
  await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
  const pending = holdRequests('get', '/v1/environment');
  const view = render(
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider>
        <LoomProvider clerk={clerk}>
          <p>Standalone profile</p>
          <LoomPassword />
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>,
  );
  expect(await screen.findByText('Standalone profile')).toBeInTheDocument();
  await waitFor(() => expect(pending.requests).toHaveLength(1));
  expect(screen.queryByText('No password set')).not.toBeInTheDocument();
  pending.release();
  expect(await screen.findByText('No password set')).toBeInTheDocument();
  view.unmount();
});

it('shares user and settings reads between Password consumers without loading devices', async () => {
  serveFapi({
    environment: fapiEnvironment(),
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', password_enabled: false }) })]),
  });
  const clerk = new Clerk(publishableKey());
  await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
  const users = holdRequests('get', '/v1/me');
  const settings = holdRequests('get', '/v1/environment');
  const devices = holdRequests('get', '/v1/me/sessions/active');
  const view = render(
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider>
        <LoomProvider clerk={clerk}>
          <p>Standalone profile</p>
          <LoomPassword />
          <LoomPassword />
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>,
  );
  await waitFor(() => expect(users.requests).toHaveLength(1));
  expect(screen.getByText('Standalone profile')).toBeInTheDocument();
  expect(screen.queryByText('No password set')).not.toBeInTheDocument();
  users.release();
  await waitFor(() => expect(settings.requests).toHaveLength(1));
  settings.release();
  expect(await screen.findAllByText('No password set')).toHaveLength(2);
  expect(users.requests).toHaveLength(1);
  expect(settings.requests).toHaveLength(1);
  expect(devices.requests).toHaveLength(0);
  devices.release();
  view.unmount();
});

it('keeps standalone Password suspense inside the section', () => {
  serveFapi({});
  const clerk = new Clerk(publishableKey());
  const { profileSettings: _settings, ...hydration } = seed(clerk);
  const html = renderToString(
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider>
        <LoomProvider
          clerk={null}
          hydration={hydration}
        >
          <Suspense fallback={<p>Outer fallback</p>}>
            <p>Standalone profile</p>
            <LoomPassword />
          </Suspense>
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>,
  );
  expect(html).toContain('Standalone profile');
  expect(html).not.toContain('Outer fallback');
});

it('streams the composed profile with user-only Danger before shared settings', async () => {
  serveFapi({});
  const clerk = new Clerk(publishableKey());
  const { profileSettings: settings, ...hydration } = seed(clerk);
  const pending = Promise.withResolvers<typeof profileSettings>();
  function PendingSettings() {
    const owner = useLoom();
    const options = owner.profileSettingsQueryOptions();
    if (!owner.queryClient.getQueryState(options.queryKey)) {
      void owner.queryClient.fetchQuery({ ...options, queryFn: () => pending.promise });
    }
    return <LoomComposedProfile />;
  }
  const stream = await renderToReadableStream(
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider>
        <LoomProvider
          clerk={null}
          hydration={hydration}
        >
          <PendingSettings />
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>,
  );
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let html = '';
  while (!html.includes('Permanently delete this account')) {
    const chunk = await reader.read();
    if (chunk.done) {
      break;
    }
    html += decoder.decode(chunk.value);
  }
  expect(html).toContain('Permanently delete this account');
  expect(html).not.toContain('Profile picture');
  expect(html).not.toContain('alice-google');
  expect(html).not.toContain('No password set');
  expect(html).not.toContain('Loading');
  pending.resolve(settings.data);
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) {
      break;
    }
    html += decoder.decode(chunk.value);
  }
  expect(html).toContain('Profile picture');
  expect(html).toContain('alice-google');
  expect(html).toContain('No password set');
  expect(html).toContain('disabled');
});

it('retries standalone Password after its settings request fails', async () => {
  serveFapi({
    environment: fapiEnvironment(),
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', password_enabled: false }) })]),
  });
  const clerk = new Clerk(publishableKey());
  await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
  worker.use(
    http.get(
      fapiUrl('/v1/environment'),
      () => HttpResponse.json({ errors: [{ code: 'offline', message: 'Unavailable' }] }, { status: 400 }),
      { once: true },
    ),
  );
  const view = render(
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider>
        <LoomProvider clerk={clerk}>
          <LoomPassword />
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>,
  );
  expect(await screen.findByText('Could not load password status.')).toBeInTheDocument();
  await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('No password set')).toBeInTheDocument();
  expect(screen.queryByText('Could not load password status.')).not.toBeInTheDocument();
  view.unmount();
});
