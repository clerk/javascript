import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Component, type ReactNode, StrictMode, Suspense } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ClerkSessionsHost } from '../clerk';
import { createLoomClient } from '../client';
import * as reactApi from '../react';
import {
  LoomProvider,
  QueryErrorResetBoundary,
  useLoom,
  useSessions,
  useSuspenseSessions,
  useSuspenseUser,
  useUser,
} from '../react';
import { LoomClientProvider } from '../react-context';
import type { LoomHydration, Sessions } from '../types';
import { clerkHost, publicUser, userSeed } from './fixtures/react';

const scope = { instanceKey: 'controlled-server', userId: 'user_a', sessionId: 'sess_current' };
const sessions: Sessions = [
  {
    id: 'sess_other',
    status: 'active',
    expireAt: 1000,
    abandonAt: 1000,
    lastActiveAt: 100,
    hasActor: false,
    latestActivity: { id: 'a' },
  },
];

afterEach(cleanup);

describe('public LoomProvider with ClerkJS without ClerkProvider', () => {
  it('exports one provider', () => {
    expect(Object.keys(reactApi).filter(name => name.endsWith('Provider'))).toEqual(['LoomProvider']);
  });
  it('renders its fallback on the server without subscribing to the host', () => {
    const { host, resourceListeners, statusListeners } = clerkHost();
    host.loaded = true;
    host.user = { id: 'user_a' };
    host.session = { id: 'sess_a' };
    expect(
      renderToString(
        <LoomProvider
          clerk={host}
          fallback={<p>Waiting</p>}
        >
          <List />
        </LoomProvider>,
      ),
    ).toContain('Waiting');
    expect(resourceListeners.size).toBe(0);
    expect(statusListeners.size).toBe(0);
  });

  it('moves from loading through sign-out and a new identity under StrictMode', async () => {
    const { host, request, resourceListeners, statusListeners, emitResource, emitStatus } = clerkHost();
    const view = render(
      <StrictMode>
        <LoomProvider
          clerk={host}
          fallback={<p>Waiting</p>}
        >
          <List />
        </LoomProvider>
      </StrictMode>,
    );
    expect(screen.getByText('Waiting')).toBeDefined();
    act(() => {
      host.loaded = true;
      host.user = { id: 'user_a' };
      host.session = { id: 'sess_a' };
      emitStatus();
    });
    expect(await screen.findByText('sess_other')).toBeDefined();
    const requestsBeforeSignOut = request.mock.calls.length;
    act(() => {
      host.user = null;
      host.session = null;
      emitResource();
    });
    expect(screen.getByText('Waiting')).toBeDefined();
    expect(request).toHaveBeenCalledTimes(requestsBeforeSignOut);
    act(() => {
      host.user = { id: 'user_b' };
      host.session = { id: 'sess_b' };
      emitStatus();
    });
    expect(await screen.findByText('sess_other')).toBeDefined();
    expect(request.mock.calls.length).toBeGreaterThan(requestsBeforeSignOut);
    expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ sessionId: 'sess_b' }));
    view.unmount();
    expect(resourceListeners.size).toBe(0);
    expect(statusListeners.size).toBe(0);
  });

  it('replaces a host even when the new host has the same identity', async () => {
    const first = clerkHost();
    const second = clerkHost();
    first.host.loaded = second.host.loaded = true;
    first.host.user = second.host.user = { id: 'user_a' };
    first.host.session = second.host.session = { id: 'sess_a' };
    second.request.mockResolvedValue(Object.assign(new Response(), { payload: [] }));
    const tree = (host: ClerkSessionsHost) => (
      <LoomProvider
        clerk={host}
        fallback={<p>Waiting</p>}
      >
        <List />
      </LoomProvider>
    );
    const view = render(tree(first.host));
    expect(await screen.findByText('sess_other')).toBeDefined();
    view.rerender(tree(second.host));
    expect(await screen.findByText('Empty')).toBeDefined();
    expect(first.resourceListeners.size).toBe(0);
    expect(first.statusListeners.size).toBe(0);
    view.unmount();
    expect(second.resourceListeners.size).toBe(0);
    expect(second.statusListeners.size).toBe(0);
  });

  it('does not publish a delayed read from a retired identity', async () => {
    const { host, request, emitResource } = clerkHost();
    host.loaded = true;
    host.user = { id: 'user_a' };
    host.session = { id: 'sess_a' };
    const pending = Promise.withResolvers<Response & { payload: unknown }>();
    request.mockReturnValueOnce(pending.promise).mockResolvedValueOnce(Object.assign(new Response(), { payload: [] }));
    const view = render(
      <LoomProvider
        clerk={host}
        fallback={<p>Waiting</p>}
      >
        <List />
      </LoomProvider>,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    act(() => {
      host.user = { id: 'user_b' };
      host.session = { id: 'sess_b' };
      emitResource();
    });
    expect(await screen.findByText('Empty')).toBeDefined();
    await act(async () => {
      pending.resolve(
        Object.assign(new Response(), {
          payload: [
            {
              id: 'sess_stale',
              status: 'active',
              expire_at: 1000,
              abandon_at: 1000,
              last_active_at: 100,
              actor: null,
              latest_activity: { id: 'a' },
            },
          ],
        }),
      );
      await pending.promise;
    });
    expect(screen.getByText('Empty')).toBeDefined();
    expect(screen.queryByText('sess_stale')).toBeNull();
    expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ sessionId: 'sess_b' }));
    view.unmount();
  });
});

function List() {
  const query = useSessions();
  return <output>{query.isPending ? 'Loading' : query.data?.map(item => item.id).join(',') || 'Empty'}</output>;
}

function SuspenseList() {
  const query = useSuspenseSessions();
  return (
    <>
      <output>{query.data.map(item => item.id).join(',') || 'Empty'}</output>
      {query.isFetching ? <span>Refreshing</span> : null}
      {query.error ? <span>Refresh failed</span> : null}
    </>
  );
}

function Prefetch() {
  const client = useLoom();
  return (
    <button
      type='button'
      onMouseEnter={() => void client.prefetch()}
      onFocus={() => void client.prefetch()}
    >
      Devices
    </button>
  );
}

class Boundary extends Component<{ children: ReactNode; reset: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <button
        type='button'
        onClick={() => {
          this.props.reset();
          this.setState({ failed: false });
        }}
      >
        Retry
      </button>
    ) : (
      this.props.children
    );
  }
}

describe('official React adapter', () => {
  it('keeps Suspense data visible during a shared background refresh and failure', async () => {
    const pending = Promise.withResolvers<Sessions>();
    const read = vi
      .fn<() => Promise<Sessions>>()
      .mockResolvedValueOnce(sessions)
      .mockImplementationOnce(() => pending.promise);
    const client = createLoomClient({ scope, transport: { read, revoke: () => Promise.resolve() } });
    await client.prefetch();
    render(
      <LoomClientProvider client={client}>
        <Suspense fallback={<p>Waiting</p>}>
          <SuspenseList />
          <List />
        </Suspense>
      </LoomClientProvider>,
    );
    let refresh: Promise<Sessions> | undefined;
    act(() => {
      refresh = client.refresh();
    });
    await screen.findByText('Refreshing');
    expect(screen.getAllByText('sess_other')).toHaveLength(2);
    expect(read).toHaveBeenCalledTimes(2);
    const rejected = expect(refresh).rejects.toThrow('offline');
    pending.reject(new Error('offline'));
    await rejected;
    await screen.findByText('Refresh failed');
    expect(screen.getAllByText('sess_other')).toHaveLength(2);
    expect(screen.queryByText('Waiting')).toBeNull();
    cleanup();
    client.dispose();
  });
  it('switches observers when a different owner has the same authenticated scope', async () => {
    const first = createLoomClient({
      scope,
      transport: { read: () => Promise.resolve(sessions), revoke: () => Promise.resolve() },
    });
    const read = vi.fn(() => Promise.resolve([]));
    const second = createLoomClient({ scope, transport: { read, revoke: () => Promise.resolve() } });
    const view = render(
      <LoomClientProvider client={first}>
        <List />
      </LoomClientProvider>,
    );
    expect(await screen.findByText('sess_other')).toBeDefined();
    first.dispose();
    view.rerender(
      <LoomClientProvider client={second}>
        <List />
      </LoomClientProvider>,
    );
    await screen.findByText('Empty');
    expect(second.getSnapshot()?.data).toEqual([]);
    cleanup();
    second.dispose();
  });
  it('shares hover and focus prefetch with mounted consumers and remounts', async () => {
    const read = vi.fn(() => Promise.resolve(sessions));
    const client = createLoomClient({ scope, transport: { read, revoke: () => Promise.resolve() } });
    const tree = (show: boolean) => (
      <LoomClientProvider client={client}>
        <Prefetch />
        {show && <List />}
      </LoomClientProvider>
    );
    const view = render(tree(false));
    fireEvent.mouseEnter(screen.getByText('Devices'));
    fireEvent.focus(screen.getByText('Devices'));
    await waitFor(() => expect(client.getSnapshot()?.data).toEqual(sessions));
    view.rerender(tree(true));
    expect(screen.getByText('sess_other')).toBeDefined();
    view.unmount();
    render(tree(true));
    expect(screen.getByText('sess_other')).toBeDefined();
    expect(read).toHaveBeenCalledTimes(1);
    cleanup();
    client.dispose();
  });

  it('suspends, surfaces initial errors, and recovers through QueryErrorResetBoundary', async () => {
    const pending = Promise.withResolvers<Sessions>();
    const read = vi
      .fn<() => Promise<Sessions>>()
      .mockImplementationOnce(() => pending.promise)
      .mockResolvedValueOnce(sessions);
    const client = createLoomClient({ scope, transport: { read, revoke: () => Promise.resolve() } });
    const failure = new Error('offline');
    const ignoreExpected = (event: ErrorEvent) => {
      if (event.error === failure) {
        event.preventDefault();
      }
    };
    window.addEventListener('error', ignoreExpected);
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(
        <LoomClientProvider client={client}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <Boundary reset={reset}>
                <Suspense fallback={<p>Waiting</p>}>
                  <SuspenseList />
                </Suspense>
              </Boundary>
            )}
          </QueryErrorResetBoundary>
        </LoomClientProvider>,
      );
      expect(screen.getByText('Waiting')).toBeDefined();
      act(() => {
        pending.reject(failure);
      });
      fireEvent.click(await screen.findByText('Retry'));
      expect(await screen.findByText('sess_other')).toBeDefined();
      expect(read).toHaveBeenCalledTimes(2);
    } finally {
      cleanup();
      client.dispose();
      report.mockRestore();
      window.removeEventListener('error', ignoreExpected);
    }
  });

  it('renders and hydrates controlled request-local data without refetching', async () => {
    const server = createLoomClient({
      scope,
      transport: { read: () => Promise.resolve(sessions), revoke: () => Promise.resolve() },
    });
    await server.fetch();
    const state = JSON.parse(JSON.stringify(server.dehydrate()));
    const html = renderToString(
      <LoomClientProvider client={server}>
        <List />
      </LoomClientProvider>,
    );
    server.dispose();
    const read = vi.fn(() => Promise.resolve([]));
    const browser = createLoomClient({ scope, transport: { read, revoke: () => Promise.resolve() }, hydration: state });
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);
    const onRecoverableError = vi.fn();
    const root = hydrateRoot(
      container,
      <LoomClientProvider client={browser}>
        <List />
      </LoomClientProvider>,
      { onRecoverableError },
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(container.textContent).toBe('sess_other');
    expect(read).not.toHaveBeenCalled();
    expect(onRecoverableError).not.toHaveBeenCalled();
    act(() => root.unmount());
    container.remove();
    browser.dispose();
  });
});

function seed(host: ClerkSessionsHost, updatedAt = Date.now()): LoomHydration {
  return {
    version: 5,
    scope: {
      instanceKey: JSON.stringify([host.publishableKey, host.frontendApi, host.proxyUrl ?? '', host.domain]),
      userId: 'user_a',
      sessionId: 'sess_current',
    },
    sessions: { data: sessions, updatedAt },
  };
}

function Readiness() {
  return <span>{useSessions().isEnabled ? 'Live' : 'Read only'}</span>;
}

describe('public snapshot hydration', () => {
  it('renders seeded regular and suspense consumers on the server without host access', () => {
    const { host, request, resourceListeners, statusListeners } = clerkHost();
    const html = renderToString(
      <LoomProvider
        clerk={host}
        hydration={seed(host, 1)}
      >
        <List />
        <SuspenseList />
        <Readiness />
      </LoomProvider>,
    );
    expect(html.match(/sess_other/g)).toHaveLength(2);
    expect(html).toContain('Read only');
    expect(request).not.toHaveBeenCalled();
    expect(resourceListeners.size + statusListeners.size).toBe(0);
  });

  it('hydrates deterministic HTML with an already loaded matching host without refetch', async () => {
    const { host, request, resourceListeners, statusListeners } = clerkHost();
    const hydration = seed(host);
    const tree = (
      <StrictMode>
        <LoomProvider
          clerk={host}
          hydration={hydration}
        >
          <List />
          <Readiness />
        </LoomProvider>
      </StrictMode>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    expect(container.textContent).toBe('sess_otherRead only');
    document.body.append(container);
    host.loaded = true;
    host.user = { id: 'user_a' };
    host.session = { id: 'sess_current' };
    const onRecoverableError = vi.fn();
    const root = hydrateRoot(container, tree, { onRecoverableError });
    await act(async () => {
      await Promise.resolve();
    });
    expect(container.textContent).toBe('sess_otherLive');
    expect(request).not.toHaveBeenCalled();
    expect(onRecoverableError).not.toHaveBeenCalled();
    act(() => root.unmount());
    container.remove();
    expect(resourceListeners.size + statusListeners.size).toBe(0);
  });

  it('keeps stale seeds read only until live handoff and never restores them after sign-out', async () => {
    const { host, request, emitStatus, emitResource } = clerkHost();
    request.mockResolvedValue(Object.assign(new Response(), { payload: [] }));
    render(
      <LoomProvider
        clerk={host}
        hydration={seed(host, 1)}
        fallback={<p>Waiting</p>}
      >
        <List />
        <Readiness />
      </LoomProvider>,
    );
    expect(screen.getByText('sess_other')).toBeDefined();
    expect(request).not.toHaveBeenCalled();
    act(() => {
      host.loaded = true;
      host.user = { id: 'user_a' };
      host.session = { id: 'sess_current' };
      emitStatus();
    });
    expect(await screen.findByText('Empty')).toBeDefined();
    expect(request).toHaveBeenCalledTimes(1);
    act(() => {
      host.user = null;
      host.session = null;
      emitResource();
    });
    expect(screen.getByText('Waiting')).toBeDefined();
    act(() => {
      host.user = { id: 'user_a' };
      host.session = { id: 'sess_current' };
      emitResource();
    });
    expect(screen.queryByText('sess_other')).toBeNull();
    expect(await screen.findByText('Empty')).toBeDefined();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it.each(['user', 'session', 'instance'])('rejects seed handoff for a different %s', async kind => {
    const { host, request, emitStatus } = clerkHost();
    request.mockResolvedValue(Object.assign(new Response(), { payload: [] }));
    render(
      <LoomProvider
        clerk={host}
        hydration={seed(host)}
      >
        <List />
      </LoomProvider>,
    );
    act(() => {
      host.loaded = true;
      host.user = { id: kind === 'user' ? 'user_b' : 'user_a' };
      host.session = { id: kind === 'session' ? 'sess_b' : 'sess_current' };
      if (kind === 'instance') {
        host.frontendApi = 'other.clerk.test';
      }
      emitStatus();
    });
    expect(screen.queryByText('sess_other')).toBeNull();
    expect(await screen.findByText('Empty')).toBeDefined();
  });

  it('replaces the bootstrap when navigation supplies a new snapshot', () => {
    const { host } = clerkHost();
    const hydration = seed(host);
    const tree = (value: LoomHydration) => (
      <LoomProvider
        clerk={null}
        hydration={value}
      >
        <List />
      </LoomProvider>
    );
    const view = render(tree(hydration));
    expect(screen.getByText('sess_other')).toBeDefined();
    view.rerender(tree({ ...hydration, sessions: { data: [], updatedAt: Date.now() } }));
    expect(screen.getByText('Empty')).toBeDefined();
  });
});

describe('bootstrap authority and retirement', () => {
  it('fails closed for raw operations before Clerk loads', async () => {
    let client: ReturnType<typeof useLoom> | undefined;
    function Capture() {
      client = useLoom();
      return <List />;
    }
    const { host } = clerkHost();
    render(
      <LoomProvider
        clerk={null}
        hydration={seed(host)}
      >
        <Capture />
      </LoomProvider>,
    );
    expect(client).toBeDefined();
    await expect(client?.fetch()).rejects.toThrow('waiting for Clerk');
    await expect(client?.prefetch()).rejects.toThrow('waiting for Clerk');
    await expect(client?.refresh()).rejects.toThrow('waiting for Clerk');
    await expect(client?.revoke('sess_other')).rejects.toThrow('waiting for Clerk');
    expect(() => client?.subscribe(() => {})).toThrow('waiting for Clerk');
  });

  it('never restores bootstrap after a live host is removed or replaced by a loading host', () => {
    const first = clerkHost();
    first.host.loaded = true;
    first.host.user = { id: 'user_a' };
    first.host.session = { id: 'sess_current' };
    const hydration = seed(first.host);
    const tree = (host: ClerkSessionsHost | null) => (
      <LoomProvider
        clerk={host}
        hydration={hydration}
        fallback={<p>Waiting</p>}
      >
        <List />
      </LoomProvider>
    );
    const view = render(tree(first.host));
    expect(screen.getByText('sess_other')).toBeDefined();
    view.rerender(tree(null));
    expect(screen.queryByText('sess_other')).toBeNull();
    view.rerender(tree(clerkHost().host));
    expect(screen.queryByText('sess_other')).toBeNull();
  });
});

it('releases bootstrap query observers on StrictMode unmount without disposing replayed memory', () => {
  let client: ReturnType<typeof useLoom> | undefined;
  function Capture() {
    client = useLoom();
    return (
      <>
        <List />
        <SuspenseList />
      </>
    );
  }
  const { host, resourceListeners, statusListeners } = clerkHost();
  const view = render(
    <StrictMode>
      <LoomProvider
        clerk={host}
        hydration={seed(host)}
      >
        <Capture />
      </LoomProvider>
    </StrictMode>,
  );
  expect(screen.getAllByText('sess_other')).toHaveLength(2);
  expect(client?.queryClient.getQueryCache().getAll()[0]?.getObserversCount()).toBe(2);
  view.unmount();
  expect(client?.queryClient.getQueryCache().getAll()[0]?.getObserversCount()).toBe(0);
  expect(resourceListeners.size + statusListeners.size).toBe(0);
});

function UserProfile() {
  const query = useSuspenseUser();
  const regular = useUser();
  return (
    <>
      <output>{query.data.firstName}</output>
      <span>{regular.isEnabled ? 'Live user' : 'Seeded user'}</span>
      <span>{query.updateName && regular.updateName ? 'Can edit name' : 'Name read only'}</span>
      <button
        type='button'
        onClick={() => void query.refetch()}
      >
        Refresh user
      </button>
      {query.isFetching ? <span>Refreshing user</span> : null}
      {query.error ? <span>User refresh failed</span> : null}
    </>
  );
}

function userResponse(firstName = 'Grace', id = 'user_a') {
  return Object.assign(new Response(), {
    payload: {
      response: {
        id,
        first_name: firstName,
        last_name: null,
        username: null,
        image_url: publicUser.imageUrl,
        has_image: false,
        primary_email_address_id: null,
        email_addresses: [],
        password_enabled: false,
        delete_self_enabled: true,
        external_accounts: [],
        enterprise_accounts: [],
      },
    },
  });
}

describe('user SSR and Suspense', () => {
  it('reconciles conflicting loaded data after deterministic server hydration', async () => {
    const { host, request } = clerkHost();
    const tree = (
      <StrictMode>
        <LoomProvider
          clerk={host}
          hydration={userSeed(host)}
        >
          <Suspense fallback={<p>Loading user</p>}>
            <UserProfile />
          </Suspense>
        </LoomProvider>
      </StrictMode>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    expect(container.textContent).toContain('Ada');
    document.body.append(container);
    host.loaded = true;
    host.user = { ...publicUser, firstName: 'Edited' };
    host.session = { id: 'sess_current' };
    request.mockResolvedValue(userResponse());
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    act(() => {
      root = hydrateRoot(container, tree, { onRecoverableError });
    });
    expect(await screen.findByText('Grace')).toBeDefined();
    expect(container.textContent).not.toContain('Ada');
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledTimes(1);
    act(() => root?.unmount());
    container.remove();
  });

  it('renders user-only seed and hydrates matching loaded host without a duplicate request', async () => {
    const { host, request } = clerkHost();
    const hydration = userSeed(host);
    const tree = (
      <StrictMode>
        <LoomProvider
          clerk={host}
          hydration={hydration}
        >
          <Suspense fallback={<p>Loading user</p>}>
            <UserProfile />
          </Suspense>
        </LoomProvider>
      </StrictMode>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    expect(container.textContent).toContain('Ada');
    expect(container.textContent).toContain('Name read only');
    document.body.append(container);
    host.loaded = true;
    host.user = { ...publicUser, update: input => Promise.resolve({ ...publicUser, ...input }) };
    host.session = { id: 'sess_current' };
    const onRecoverableError = vi.fn();
    const root = hydrateRoot(container, tree, { onRecoverableError });
    await act(async () => {
      await Promise.resolve();
    });
    expect(container.textContent).toContain('Live user');
    expect(container.textContent).toContain('Can edit name');
    expect(request).not.toHaveBeenCalled();
    expect(onRecoverableError).not.toHaveBeenCalled();
    request.mockResolvedValue(userResponse());
    fireEvent.click(screen.getByText('Refresh user'));
    expect(await screen.findByText('Grace')).toBeDefined();
    expect(request).toHaveBeenCalledTimes(1);
    act(() => root.unmount());
    container.remove();
  });
  it('shows real cold Suspense, retries initial errors, and resets after account change', async () => {
    const { host, request, emitResource } = clerkHost();
    host.loaded = true;
    host.user = publicUser;
    host.session = { id: 'sess_current' };
    const pending = Promise.withResolvers<Response & { payload: unknown }>();
    request.mockReturnValueOnce(pending.promise).mockResolvedValue(userResponse());
    const failure = new Error('offline');
    const ignoreExpected = (event: ErrorEvent) => {
      if (event.error === failure) {
        event.preventDefault();
      }
    };
    window.addEventListener('error', ignoreExpected);
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(
        <LoomProvider
          clerk={host}
          fallback={<p>Host waiting</p>}
        >
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <Boundary reset={reset}>
                <Suspense fallback={<p>Loading user</p>}>
                  <UserProfile />
                </Suspense>
              </Boundary>
            )}
          </QueryErrorResetBoundary>
        </LoomProvider>,
      );
      expect(screen.getByText('Loading user')).toBeDefined();
      act(() => pending.reject(failure));
      fireEvent.click(await screen.findByText('Retry'));
      expect(await screen.findByText('Grace')).toBeDefined();
      request.mockResolvedValue(userResponse('Lin', 'user_b'));
      act(() => {
        host.user = { ...publicUser, id: 'user_b' };
        host.session = { id: 'sess_b' };
        emitResource();
      });
      expect(await screen.findByText('Lin')).toBeDefined();
      expect(screen.queryByText('Grace')).toBeNull();
      act(() => {
        host.user = null;
        host.session = null;
        emitResource();
      });
      expect(screen.getByText('Host waiting')).toBeDefined();
    } finally {
      cleanup();
      report.mockRestore();
      window.removeEventListener('error', ignoreExpected);
    }
  });
  it.each(['stale', 'mismatch'])('fetches user after %s hydration handoff', async kind => {
    const { host, request, emitStatus } = clerkHost();
    request.mockResolvedValue(userResponse('Grace', kind === 'mismatch' ? 'user_b' : 'user_a'));
    render(
      <LoomProvider
        clerk={host}
        hydration={userSeed(host, kind === 'stale' ? 1 : Date.now())}
      >
        <Suspense fallback={<p>Loading user</p>}>
          <UserProfile />
        </Suspense>
      </LoomProvider>,
    );
    expect(screen.getByText('Ada')).toBeDefined();
    expect(request).not.toHaveBeenCalled();
    act(() => {
      host.loaded = true;
      host.user = { ...publicUser, id: kind === 'mismatch' ? 'user_b' : 'user_a' };
      host.session = { id: 'sess_current' };
      emitStatus();
    });
    expect(await screen.findByText('Grace')).toBeDefined();
    expect(request).toHaveBeenCalledTimes(1);
  });
});

it('explicitly gates streaming prefetch on React 18 while keeping hydration supported', () => {
  const { host } = clerkHost();
  const prefetch = {
    hydration: { ...userSeed(host), user: { data: publicUser, updatedAt: Date.now() } },
    settings: Promise.resolve({ kind: 'unavailable' as const }),
  };
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() =>
    renderToString(
      <LoomProvider
        clerk={host}
        prefetch={prefetch}
      >
        <p>Profile</p>
      </LoomProvider>,
    ),
  ).toThrow('requires React 19');
  error.mockRestore();
});
