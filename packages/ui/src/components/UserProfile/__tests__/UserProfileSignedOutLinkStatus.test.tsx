import type { UserProfileProps } from '@clerk/shared/types';
import { act, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { Clerk } from '@/core/clerk';
import { Client, Environment } from '@/core/resources';
import { createBaseClientJSON, createBaseEnvironmentJSON } from '@/test/fixtures';
import { ClerkUI } from '@/ui/ClerkUI';

const productionPublishableKey = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';

const VERIFIED = 'Successfully verified email';
const EXPIRED = 'This verification link has expired';
const FAILED = 'This verification link is invalid';
const CLIENT_MISMATCH = 'Verification link is invalid for this device';

const PATH_ROUTING = { routing: 'path', path: '/user' } as const;

let clerk: Clerk;
let node: HTMLDivElement | undefined;

const navigate = (to: string, replace = false) => {
  window.history[replace ? 'replaceState' : 'pushState']({}, '', to);
};

const mountAt = async (url: string, props?: UserProfileProps) => {
  navigate(url, true);
  const mountNode = document.createElement('div');
  node = mountNode;
  document.body.appendChild(mountNode);
  await act(async () => {
    clerk.mountUserProfile(mountNode, props);
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  return mountNode;
};

const navigateTo = (url: string) =>
  act(async () => {
    navigate(url);
    await new Promise(resolve => setTimeout(resolve, 0));
  });

describe('<UserProfile /> mounted by clerk.mountUserProfile() while signed out', () => {
  beforeAll(async () => {
    const environment = new Environment(createBaseEnvironmentJSON());
    Environment.getInstance().fetch = vi.fn(() => Promise.resolve(environment));
    // @ts-expect-error The test replaces the client singleton's fetch with a fixture
    const client = new Client(createBaseClientJSON());
    Client.getOrCreateInstance().fetch = vi.fn(() => Promise.resolve(client));

    clerk = new Clerk(productionPublishableKey);
    await clerk.load({
      ui: { ClerkUI },
      routerPush: to => navigate(to),
      routerReplace: to => navigate(to, true),
    });

    await mountAt('/user/verify?__clerk_status=verified', PATH_ROUTING);
    await screen.findByText(VERIFIED, undefined, { timeout: 10_000 });
    clerk.unmountUserProfile(node as HTMLDivElement);
  }, 20_000);

  afterEach(async () => {
    if (node) {
      const mountNode = node;
      await act(async () => {
        clerk.unmountUserProfile(mountNode);
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      mountNode.remove();
      node = undefined;
    }
    navigate('/', true);
  });

  it.each([
    ['/user/verify?__clerk_status=expired', PATH_ROUTING, EXPIRED],
    ['/user/verify/?__clerk_status=client_mismatch', PATH_ROUTING, CLIENT_MISMATCH],
    ['/settings/account/verify?__clerk_status=failed', { routing: 'path', path: '/settings/account' }, FAILED],
    ['/user?__clerk_status=verified#/verify', PATH_ROUTING, VERIFIED],
    ['/account?__clerk_status=expired#/verify', undefined, EXPIRED],
    ['/account?__clerk_status=client_mismatch#/verify', { routing: 'hash' }, CLIENT_MISMATCH],
  ] as Array<[string, UserProfileProps | undefined, string]>)(
    'shows only the link status at %s',
    async (url, props, title) => {
      const mountNode = await mountAt(url, props);

      await waitFor(() => expect(mountNode).toHaveTextContent(title));
      expect(screen.queryByRole('button', { name: /Security/i })).not.toBeInTheDocument();
    },
  );

  it.each([
    ['/user/security?__clerk_status=verified', PATH_ROUTING],
    ['/user/verify/extra?__clerk_status=verified', PATH_ROUTING],
    ['/user?__clerk_status=verified', PATH_ROUTING],
    ['/account?__clerk_status=verified#/verify/extra', undefined],
    ['/account?__clerk_status=verified#/security', undefined],
  ] as Array<[string, UserProfileProps | undefined]>)('shows nothing at %s', async (url, props) => {
    const mountNode = await mountAt(url, props);

    expect(mountNode).toBeEmptyDOMElement();
  });

  it('shows the status of the link it navigates to', async () => {
    const mountNode = await mountAt('/user/verify?__clerk_status=verified', PATH_ROUTING);
    await waitFor(() => expect(mountNode).toHaveTextContent(VERIFIED));

    await navigateTo('/user/verify?__clerk_status=expired');

    await waitFor(() => expect(mountNode).toHaveTextContent(EXPIRED));
    expect(mountNode).not.toHaveTextContent(VERIFIED);
  });

  it.each(['/user/verify/extra?__clerk_status=verified', '/user/security?__clerk_status=verified'])(
    'shows nothing after navigating away from the verification page to %s',
    async url => {
      const mountNode = await mountAt('/user/verify?__clerk_status=verified', PATH_ROUTING);
      await waitFor(() => expect(mountNode).toHaveTextContent(VERIFIED));

      await navigateTo(url);

      await waitFor(() => expect(mountNode.textContent).toBe(''));
    },
  );

  it('shows nothing after the hash route leaves the verification page', async () => {
    const mountNode = await mountAt('/account?__clerk_status=verified#/verify');
    await waitFor(() => expect(mountNode).toHaveTextContent(VERIFIED));

    await act(async () => {
      window.location.hash = '#/security';
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => expect(mountNode.textContent).toBe(''));
  });
});
