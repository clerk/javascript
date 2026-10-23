import { Clerk } from '@clerk/clerk-js';
import type { LoomHydration, PrefetchedProfile } from '@clerk/loom';
import { LoomProvider } from '@clerk/loom/handoff';
import { ClerkContextProvider } from '@clerk/shared/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToReadableStream, renderToString } from 'react-dom/server.browser';
import { expect, it, vi } from 'vitest';

import { publishableKey, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { MosaicProvider } from '../../../mosaic-provider';
import { LoomPassword } from '../loom-account-status';
import { LoomComposedProfile } from '../loom-composed-profile';
import { profileSettings } from './profile-fixture';

type ProfileSettingsSeed = Awaited<PrefetchedProfile['settings']>;

function seed(clerk: Clerk, name = 'Seed') {
  return {
    version: 5,
    scope: {
      instanceKey: JSON.stringify([clerk.publishableKey, clerk.frontendApi, clerk.proxyUrl ?? '', clerk.domain]),
      userId: 'user_1',
      sessionId: 'sess_1',
    },
    profileSettings: { data: profileSettings, updatedAt: Date.now() },
    user: {
      data: {
        id: 'user_1',
        firstName: name,
        lastName: null,
        username: null,
        imageUrl: '',
        hasImage: false,
        primaryEmailAddressId: null,
        passwordEnabled: true,
        deleteSelfEnabled: true,
        emailAddresses: [],
        externalAccounts: [],
        enterpriseAccounts: [],
      },
      updatedAt: Date.now(),
    },
  } satisfies LoomHydration;
}

function profile(clerk: Clerk, hydration: LoomHydration) {
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
          <LoomComposedProfile />
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>
  );
}

function prefetchedProfile(clerk: Clerk, prefetch: PrefetchedProfile) {
  return (
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider>
        <LoomProvider
          clerk={clerk}
          prefetch={prefetch}
        >
          <LoomComposedProfile />
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>
  );
}

async function selectSecurity() {
  const actor = userEvent.setup();
  await actor.click(screen.getByRole('button', { name: 'Account' }));
  await actor.click(screen.getByRole('tab', { name: 'Security' }));
}

it('uses one React 19 runtime for server rendering, hydration, and Testing Library', async () => {
  expect(typeof React.use).toBe('function');
  const container = document.createElement('div');
  document.body.append(container);
  const tree = <p>React 19 handoff</p>;
  container.innerHTML = renderToString(tree);
  const errors: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  await act(async () => {
    root = hydrateRoot(container, tree, { onRecoverableError: error => errors.push(error) });
    await Promise.resolve();
  });
  expect(screen.getByText('React 19 handoff')).toBeVisible();
  expect(errors).toEqual([]);
  root?.unmount();
  container.remove();
});

it('hydrates server seed markup after real Clerk loads without a mismatch or detached user read', async () => {
  const user = fapiUser({ id: 'user_1', first_name: 'Live' });
  serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
  const clerk = new Clerk(publishableKey());
  const hydration = seed(clerk);
  const container = document.createElement('div');
  document.body.append(container);
  container.innerHTML = renderToString(profile(clerk, hydration));
  expect(container.textContent).toContain('Seed');
  const readUser = vi.spyOn(clerk, '__internal_readUser');
  await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
  const errors: unknown[] = [];
  const warnings = vi.spyOn(console, 'error');
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, profile(clerk, hydration), { onRecoverableError: error => errors.push(error) });
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.getByText('Live')).toBeVisible());
    expect(errors).toEqual([]);
    expect(
      warnings.mock.calls.flat().filter(message => /hydration|server rendered|didn't match/i.test(String(message))),
    ).toEqual([]);
  } finally {
    warnings.mockRestore();
  }
  expect(readUser).not.toHaveBeenCalled();
  expect(screen.queryByText('Seed')).toBeNull();
  root?.unmount();
  container.remove();
});

it('retires pending seed settings and enables native Password when Clerk loads', async () => {
  const user = fapiUser({ id: 'user_1', password_enabled: true });
  serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
  const clerk = new Clerk(publishableKey());
  const { profileSettings: _settings, ...hydration } = seed(clerk);
  const settings = Promise.withResolvers<ProfileSettingsSeed>();
  const prefetch = { hydration, settings: settings.promise };
  const view = render(prefetchedProfile(clerk, prefetch));
  await selectSecurity();
  expect(screen.queryByRole('button', { name: 'Change password' })).toBeNull();
  await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
  view.rerender(prefetchedProfile(clerk, prefetch));
  expect(await screen.findByRole('button', { name: 'Change password' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Security' })).toBeVisible();
  await act(async () => {
    settings.resolve({ kind: 'ready', hydration: seed(clerk) });
    await settings.promise;
  });
  expect(screen.getByRole('button', { name: 'Change password' })).toBeEnabled();
  view.unmount();
});

it('retires a failed seed section and recovers through native Password', async () => {
  const user = fapiUser({ id: 'user_1', password_enabled: true });
  serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
  const clerk = new Clerk(publishableKey());
  const { profileSettings: _settings, ...hydration } = seed(clerk);
  const settings = Promise.withResolvers<ProfileSettingsSeed>();
  const prefetch = { hydration, settings: settings.promise };
  const view = render(prefetchedProfile(clerk, prefetch));
  await selectSecurity();
  await act(async () => {
    settings.reject(new Error('Settings unavailable'));
    await settings.promise.catch(() => undefined);
  });
  await waitFor(() => expect(screen.getByText('Could not load password status.')).toBeVisible());
  await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
  view.rerender(prefetchedProfile(clerk, prefetch));
  expect(await screen.findByRole('button', { name: 'Change password' })).toBeEnabled();
  expect(screen.queryByText('Could not load password status.')).toBeNull();
  view.unmount();
});

it('keeps Security selected across an account switch and never replays the previous seed', async () => {
  const first = fapiUser({ id: 'user_1', first_name: 'Alice', password_enabled: true });
  const second = fapiUser({ id: 'user_2', first_name: 'Bob', password_enabled: false });
  serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_1', user: first }), fapiSession({ id: 'sess_2', user: second })]),
  });
  const clerk = new Clerk(publishableKey());
  const { profileSettings: _settings, ...hydration } = seed(clerk, 'Seed Alice');
  const settings = Promise.withResolvers<ProfileSettingsSeed>();
  const prefetch = { hydration, settings: settings.promise };
  const view = render(prefetchedProfile(clerk, prefetch));
  await selectSecurity();
  await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
  view.rerender(prefetchedProfile(clerk, prefetch));
  expect(await screen.findByRole('button', { name: 'Change password' })).toBeEnabled();
  await act(() => clerk.setActive({ session: 'sess_2' }));
  view.rerender(prefetchedProfile(clerk, prefetch));
  expect(screen.getByRole('button', { name: 'Security' })).toBeVisible();
  expect(await screen.findByRole('button', { name: 'Set password' })).toBeEnabled();
  await act(async () => {
    settings.resolve({ kind: 'ready', hydration: seed(clerk, 'Seed Alice') });
    await settings.promise;
  });
  expect(screen.getByRole('button', { name: 'Set password' })).toBeEnabled();
  await userEvent.setup().click(screen.getByRole('button', { name: 'Security' }));
  await userEvent.setup().click(screen.getByRole('tab', { name: 'Account' }));
  expect(await screen.findByText('Bob')).toBeVisible();
  expect(screen.queryByText('Seed Alice')).toBeNull();
  await act(() => clerk.signOut());
  const unresolved = new Clerk(publishableKey());
  view.rerender(prefetchedProfile(unresolved, prefetch));
  expect(screen.queryByText('Seed Alice')).toBeNull();
  view.unmount();
});

it('refreshes native context when one loaded Clerk host replaces another', async () => {
  const first = fapiUser({ id: 'user_1', first_name: 'Alice', password_enabled: true });
  const second = fapiUser({ id: 'user_2', first_name: 'Bob', password_enabled: false });
  serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_1', user: first }), fapiSession({ id: 'sess_2', user: second })]),
  });
  const firstClerk = new Clerk(publishableKey());
  const hydration = seed(firstClerk, 'Seed Alice');
  await act(() => firstClerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
  const view = render(profile(firstClerk, hydration));
  await selectSecurity();
  expect(await screen.findByRole('button', { name: 'Change password' })).toBeEnabled();
  const secondClerk = new Clerk(publishableKey());
  await act(() => secondClerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
  await act(() => secondClerk.setActive({ session: 'sess_2' }));
  view.rerender(profile(secondClerk, hydration));
  expect(screen.getByRole('button', { name: 'Security' })).toBeVisible();
  expect(await screen.findByRole('button', { name: 'Set password' })).toBeEnabled();
  view.unmount();
});

it('refreshes native context when a loaded host is replaced with the same identity and status', async () => {
  const first = fapiUser({ id: 'user_1', first_name: 'First host' });
  serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: first })]) });
  const firstClerk = new Clerk(publishableKey());
  const hydration = seed(firstClerk);
  await act(() => firstClerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
  const view = render(profile(firstClerk, hydration));
  expect(await screen.findByText('First host')).toBeVisible();
  const second = fapiUser({ id: 'user_1', first_name: 'Replacement host' });
  serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: second })]) });
  const secondClerk = new Clerk(publishableKey());
  await act(() => secondClerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
  view.rerender(profile(secondClerk, hydration));
  expect(await screen.findByText('Replacement host')).toBeVisible();
  expect(screen.queryByText('First host')).toBeNull();
  view.unmount();
});

it.each(['resolve', 'reject'])('keeps standalone Password live when retired settings %s', async outcome => {
  const user = fapiUser({ id: 'user_1', password_enabled: true });
  serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
  const clerk = new Clerk(publishableKey());
  const { profileSettings: _settings, ...hydration } = seed(clerk);
  const settings = Promise.withResolvers<ProfileSettingsSeed>();
  const prefetch = { hydration, settings: settings.promise };
  const view = render(
    <MosaicProvider>
      <LoomProvider
        clerk={clerk}
        prefetch={prefetch}
      >
        <LoomPassword />
      </LoomProvider>
    </MosaicProvider>,
  );
  expect(screen.queryByRole('button', { name: 'Change password' })).toBeNull();
  await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
  expect(await screen.findByRole('button', { name: 'Change password' })).toBeEnabled();
  await act(async () => {
    if (outcome === 'resolve') {
      settings.resolve({ kind: 'ready', hydration: seed(clerk) });
    } else {
      settings.reject(new Error('Late settings failure'));
    }
    await settings.promise.catch(() => undefined);
  });
  expect(screen.getByRole('button', { name: 'Change password' })).toBeEnabled();
  expect(screen.queryByText('Could not load password status.')).toBeNull();
  view.unmount();
});

it('streams the profile shell before independent settings resolve', async () => {
  serveFapi({});
  const clerk = new Clerk(publishableKey());
  const { profileSettings: _settings, ...hydration } = seed(clerk);
  const settings = Promise.withResolvers<ProfileSettingsSeed>();
  const prefetch = { hydration, settings: settings.promise };
  const stream = await renderToReadableStream(prefetchedProfile(clerk, prefetch));
  const reader = stream.getReader();
  const first = await reader.read();
  expect(first.done).toBe(false);
  const decoder = new TextDecoder();
  let html = decoder.decode(first.value);
  expect(html).toContain('User profile');
  settings.resolve({ kind: 'ready', hydration: seed(clerk) });
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) {
      break;
    }
    html += decoder.decode(chunk.value);
  }
  expect(html).toContain('Password');
});
