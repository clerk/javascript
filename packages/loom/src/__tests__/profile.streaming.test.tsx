import { act, Component, type ReactNode, StrictMode, Suspense, version } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';

import { createLoomClient } from '../client';
import { parseProfileSettings } from '../profile-settings';
import { LoomProvider, QueryErrorResetBoundary, useLoom, useSuspenseProfile, useSuspenseUser } from '../react';
import { LoomClientProvider } from '../react-context';
import type { PrefetchedProfile, ProfileSettingsSeed } from '../types';
import environment from './fixtures/environment.json';
import { clerkHost, publicUser, userSeed } from './fixtures/react';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLDivElement;
afterEach(async () => {
  await act(() => root?.unmount());
  container?.remove();
  vi.restoreAllMocks();
});

async function render(children: ReactNode) {
  if (!root) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  await act(() => root?.render(children));
}

afterEach(() => {
  root = undefined;
});

function Danger() {
  return <output>{useSuspenseUser().data.firstName} can delete account</output>;
}
function Profile() {
  const { user, settings } = useSuspenseProfile();
  return (
    <p>
      {user.firstName} {settings.firstName.enabled ? 'names enabled' : 'names disabled'}
    </p>
  );
}
function seed(host: ReturnType<typeof clerkHost>['host'], settings: Promise<ProfileSettingsSeed>): PrefetchedProfile {
  return { hydration: { ...userSeed(host), user: { data: publicUser, updatedAt: Date.now() } }, settings };
}
function ready(host: ReturnType<typeof clerkHost>['host']): ProfileSettingsSeed {
  return {
    kind: 'ready',
    hydration: {
      version: 5,
      scope: userSeed(host).scope,
      profileSettings: { data: parseProfileSettings(environment), updatedAt: Date.now() },
    },
  };
}

it.each(['before', 'after'])(
  'streams ordinary profile hooks with user-only content before settings %s Clerk readiness',
  async timing => {
    expect(version.startsWith('19.')).toBe(true);
    const { host, request, emitStatus } = clerkHost();
    const settings = Promise.withResolvers<ProfileSettingsSeed>();
    const prefetch = seed(host, settings.promise);
    await render(
      <StrictMode>
        <LoomProvider
          clerk={host}
          prefetch={prefetch}
        >
          <Danger />
          <Suspense fallback={<p>Waiting</p>}>
            <Profile />
            <Profile />
          </Suspense>
        </LoomProvider>
      </StrictMode>,
    );
    expect(container.textContent).toContain('Ada can delete account');
    expect(container.textContent).toContain('Waiting');
    expect(request).not.toHaveBeenCalled();
    if (timing === 'before') {
      await act(() => settings.resolve(ready(host)));
    }
    await act(() => {
      host.loaded = true;
      host.user = publicUser;
      host.session = { id: 'sess_current' };
      emitStatus();
    });
    await act(() => settings.resolve(ready(host)));
    expect(container.textContent).not.toContain('Waiting');
    expect(container.querySelectorAll('p')).toHaveLength(2);
    expect(container.textContent).toContain('Ada names enabled');
    expect(request).not.toHaveBeenCalled();
  },
);

it.each(['pending', 'error', 'invalidated', 'newer'])(
  'bypasses an unresolved stream for an existing %s query',
  async status => {
    const { host } = clerkHost();
    const settings = Promise.withResolvers<ProfileSettingsSeed>();
    const prefetch = seed(host, settings.promise);
    const data = { ...parseProfileSettings(environment), firstName: { enabled: false, required: false } };
    const read = vi.fn(() => Promise.resolve(data));
    const client = createLoomClient({
      scope: prefetch.hydration.scope,
      hydration: prefetch.hydration,
      readProfileSettings: read,
    });
    const queryKey = client.profileSettingsQueryOptions().queryKey;
    if (status === 'pending') {
      client.queryClient.getQueryCache().build(client.queryClient, { queryKey });
    } else if (status === 'error') {
      await client.queryClient
        .fetchQuery({ queryKey, queryFn: () => Promise.reject(new Error('offline')), retry: false })
        .catch(() => {});
    } else {
      client.queryClient.setQueryData(queryKey, data);
      if (status === 'invalidated') {
        await client.queryClient.invalidateQueries({ queryKey });
      }
    }
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await render(
      <LoomClientProvider
        client={client}
        prefetch={prefetch}
      >
        <Boundary>
          <Suspense fallback={<p>Waiting</p>}>
            <Profile />
          </Suspense>
        </Boundary>
      </LoomClientProvider>,
    );
    await act(() => {});
    expect(container.textContent).toContain(status === 'error' ? 'Unavailable' : 'Ada names disabled');
    const before = client.queryClient.getQueryState(queryKey);
    await act(() => settings.resolve(ready(host)));
    expect(client.queryClient.getQueryState(queryKey)).toBe(before);
    client.dispose();
  },
);

it.each(['signout', 'other'])('discards the stream after %s and return to the same identity', async departure => {
  const { host, request, emitResource } = clerkHost();
  host.loaded = true;
  host.user = publicUser;
  host.session = { id: 'sess_current' };
  request.mockImplementation(({ path }) =>
    Promise.resolve(
      Object.assign(new Response(), {
        payload:
          path === '/me'
            ? {
                response: {
                  id: 'user_a',
                  first_name: 'Ada',
                  last_name: null,
                  username: null,
                  image_url: '',
                  has_image: false,
                  primary_email_address_id: null,
                  email_addresses: [],
                  password_enabled: false,
                  delete_self_enabled: true,
                  external_accounts: [],
                  enterprise_accounts: [],
                },
              }
            : {
                ...environment,
                user_settings: {
                  ...environment.user_settings,
                  attributes: {
                    ...environment.user_settings.attributes,
                    first_name: { ...environment.user_settings.attributes.first_name, enabled: false },
                  },
                },
              },
      }),
    ),
  );
  const settings = Promise.withResolvers<ProfileSettingsSeed>();
  const prefetch = seed(host, settings.promise);
  const tree = (profile: boolean) => (
    <LoomProvider
      clerk={host}
      prefetch={prefetch}
    >
      <Danger />
      {profile ? (
        <Suspense fallback={<p>Waiting</p>}>
          <Profile />
        </Suspense>
      ) : null}
    </LoomProvider>
  );
  await render(tree(true));
  await act(() => {
    host.user = departure === 'signout' ? null : { ...publicUser, id: 'user_b' };
    host.session = departure === 'signout' ? null : { id: 'sess_b' };
    emitResource();
    host.user = publicUser;
    host.session = { id: 'sess_current' };
    emitResource();
  });
  await render(tree(true));
  expect(container.textContent).toContain('Ada names disabled');
  await act(() => settings.resolve(ready(host)));
  expect(container.textContent).toContain('Ada names disabled');
  expect(request.mock.calls.map(([request]) => request.path)).toEqual(['/me', '/environment']);
});

it.each(['new hydration', 'same hydration'])('replaces unresolved prefetch with %s without waiting', async kind => {
  const { host } = clerkHost();
  const old = Promise.withResolvers<ProfileSettingsSeed>();
  const first = seed(host, old.promise);
  const second =
    kind === 'same hydration'
      ? { ...first, settings: Promise.resolve(ready(host)) }
      : seed(host, Promise.resolve(ready(host)));
  const tree = (prefetch: PrefetchedProfile) => (
    <StrictMode>
      <LoomProvider
        clerk={host}
        prefetch={prefetch}
      >
        <Suspense fallback={<p>Waiting</p>}>
          <Profile />
        </Suspense>
      </LoomProvider>
    </StrictMode>
  );
  await render(tree(first));
  expect(container.textContent).toContain('Waiting');
  await render(tree(second));
  expect(container.textContent).toContain('Ada names enabled');
  await act(() => old.resolve({ kind: 'unavailable' }));
  expect(container.textContent).toContain('Ada names enabled');
});

it('accepts a late prefetch before the host first becomes ready', async () => {
  const { host, request, emitStatus } = clerkHost();
  const tree = (prefetch?: PrefetchedProfile) => (
    <StrictMode>
      <LoomProvider
        clerk={host}
        prefetch={prefetch}
        fallback={<p>Waiting</p>}
      >
        <Danger />
      </LoomProvider>
    </StrictMode>
  );
  await render(tree());
  expect(container.textContent).toBe('Waiting');
  await render(tree(seed(host, Promise.resolve(ready(host)))));
  expect(container.textContent).toContain('Ada can delete account');
  await act(() => {
    host.loaded = true;
    host.user = publicUser;
    host.session = { id: 'sess_current' };
    emitStatus();
  });
  expect(container.textContent).toContain('Ada can delete account');
  expect(request).not.toHaveBeenCalled();
});

it('ignores a ready settings result from another scope', async () => {
  const { host, request, emitStatus } = clerkHost();
  const result = ready(host);
  if (result.kind !== 'ready') {
    throw new Error('Expected settings');
  }
  const prefetch = seed(
    host,
    Promise.resolve({
      ...result,
      hydration: { ...result.hydration, scope: { ...result.hydration.scope, sessionId: 'other' } },
    }),
  );
  host.loaded = true;
  host.user = publicUser;
  host.session = { id: 'sess_current' };
  request.mockResolvedValue(Object.assign(new Response(), { payload: environment }));
  await render(
    <LoomProvider
      clerk={host}
      prefetch={prefetch}
    >
      <Danger />
    </LoomProvider>,
  );
  await act(() => emitStatus());
  await render(
    <LoomProvider
      clerk={host}
      prefetch={prefetch}
    >
      <Suspense fallback={null}>
        <Profile />
      </Suspense>
    </LoomProvider>,
  );
  expect(container.textContent).toContain('Ada names enabled');
  expect(request).toHaveBeenCalledTimes(1);
});

class Boundary extends Component<{ children: ReactNode; reset?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <button
        type='button'
        onClick={() => {
          this.props.reset?.();
          this.setState({ failed: false });
        }}
      >
        Unavailable
      </button>
    ) : (
      this.props.children
    );
  }
}

it('retries a rejected server settings seed through the live query', async () => {
  const { host, request, emitStatus } = clerkHost();
  const settings = Promise.withResolvers<ProfileSettingsSeed>();
  const prefetch = seed(host, settings.promise);
  request.mockResolvedValue(Object.assign(new Response(), { payload: environment }));
  vi.spyOn(console, 'error').mockImplementation(() => {});
  await render(
    <LoomProvider
      clerk={host}
      prefetch={prefetch}
    >
      <Danger />
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <Boundary reset={reset}>
            <Suspense fallback={null}>
              <Profile />
              <Profile />
            </Suspense>
          </Boundary>
        )}
      </QueryErrorResetBoundary>
    </LoomProvider>,
  );
  await act(() => settings.reject(new Error('Invalid Loom profile settings response.')));
  expect(container.textContent).toContain('Unavailable');
  expect(request).not.toHaveBeenCalled();
  await act(() => {
    host.loaded = true;
    host.user = publicUser;
    host.session = { id: 'sess_current' };
    emitStatus();
  });
  expect(container.textContent).toContain('Ada can delete account');
  await act(() => container.querySelector('button')?.click());
  expect(container.textContent).not.toContain('Unavailable');
  expect(container.querySelectorAll('p')).toHaveLength(2);
  expect(container.textContent).toContain('Ada names enabled');
  expect(request.mock.calls.map(([request]) => request.path)).toEqual(['/environment']);
});

it('recovers unavailable settings after Clerk connects without removing user-only content', async () => {
  const { host, request, emitStatus } = clerkHost();
  const prefetch = seed(host, Promise.resolve({ kind: 'unavailable' }));
  request.mockResolvedValue(Object.assign(new Response(), { payload: environment }));
  vi.spyOn(console, 'error').mockImplementation(() => {});
  await render(
    <LoomProvider
      clerk={host}
      prefetch={prefetch}
    >
      <Danger />
      <Boundary>
        <Suspense fallback={null}>
          <Profile />
        </Suspense>
      </Boundary>
    </LoomProvider>,
  );
  expect(container.textContent).toContain('Ada can delete account');
  expect(container.textContent).toContain('Unavailable');
  await act(() => {
    host.loaded = true;
    host.user = publicUser;
    host.session = { id: 'sess_current' };
    emitStatus();
  });
  expect(container.textContent).toContain('Ada names enabled');
  expect(container.textContent).not.toContain('Unavailable');
  expect(request).toHaveBeenCalledTimes(1);
});

it('does not replace a user edited while the shared settings stream is pending', async () => {
  const { host } = clerkHost();
  const settings = Promise.withResolvers<ProfileSettingsSeed>();
  const prefetch = seed(host, settings.promise);
  let owner: ReturnType<typeof useLoom> | undefined;
  function Capture() {
    owner = useLoom();
    return null;
  }
  await render(
    <LoomProvider
      clerk={host}
      prefetch={prefetch}
    >
      <Capture />
      <Danger />
      <Suspense fallback={null}>
        <Profile />
      </Suspense>
    </LoomProvider>,
  );
  await act(() => {
    owner?.queryClient.setQueryData(owner.userQueryOptions().queryKey, { ...publicUser, firstName: 'Edited' });
    settings.resolve(ready(host));
  });
  expect(container.textContent).toContain('Edited names enabled');
  expect(owner?.dehydrate()?.user?.data.firstName).toBe('Edited');
});

it('keeps a confirmed name edit when navigation restores an older profile snapshot', async () => {
  const { host, request } = clerkHost();
  const edited = { ...publicUser, firstName: 'Edited' };
  host.loaded = true;
  host.session = { id: 'sess_current' };
  host.user = { ...publicUser, update: vi.fn(() => Promise.resolve(edited)) };
  const prefetch = seed(host, Promise.resolve(ready(host)));
  let owner: ReturnType<typeof useLoom> | undefined;
  function Capture() {
    owner = useLoom();
    return <Danger />;
  }
  const tree = (value: PrefetchedProfile) => (
    <LoomProvider
      clerk={host}
      prefetch={value}
    >
      <Capture />
    </LoomProvider>
  );
  await render(tree(prefetch));
  if (!owner) {
    throw new Error('Missing live owner.');
  }
  const liveOwner = owner;
  await act(async () => {
    await liveOwner.updateName({ firstName: 'Edited', lastName: '' });
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  expect(container.textContent).toContain('Edited can delete account');
  await render(tree({ ...prefetch, hydration: { ...prefetch.hydration } }));
  expect(container.textContent).toContain('Edited can delete account');
  expect(owner).toBe(liveOwner);
  expect(request).not.toHaveBeenCalled();
});

it('does not let a navigation snapshot replace the authenticated scope', async () => {
  const { host, request } = clerkHost();
  host.loaded = true;
  host.session = { id: 'sess_current' };
  host.user = publicUser;
  const first = seed(host, Promise.resolve(ready(host)));
  let owner: ReturnType<typeof useLoom> | undefined;
  function Capture() {
    owner = useLoom();
    return <Danger />;
  }
  const tree = (prefetch: PrefetchedProfile) => (
    <LoomProvider
      clerk={host}
      prefetch={prefetch}
    >
      <Capture />
    </LoomProvider>
  );
  await render(tree(first));
  const liveOwner = owner;
  await render(
    tree({
      ...first,
      hydration: {
        ...first.hydration,
        scope: { ...first.hydration.scope, userId: 'user_b' },
        user: { data: { ...publicUser, id: 'user_b', firstName: 'Other' }, updatedAt: Date.now() },
      },
    }),
  );
  expect(container.textContent).toContain('Ada can delete account');
  expect(container.textContent).not.toContain('Other');
  expect(owner).toBe(liveOwner);
  expect(request).not.toHaveBeenCalled();
});

it('does not revive bootstrap when the host and prefetch are replaced together', async () => {
  const first = clerkHost();
  const second = clerkHost();
  first.host.loaded = true;
  first.host.session = { id: 'sess_current' };
  first.host.user = publicUser;
  const tree = (host: typeof first.host, prefetch: PrefetchedProfile) => (
    <LoomProvider
      clerk={host}
      prefetch={prefetch}
      fallback={<p>Waiting</p>}
    >
      <Danger />
    </LoomProvider>
  );
  await render(tree(first.host, seed(first.host, Promise.resolve(ready(first.host)))));
  expect(container.textContent).toContain('Ada can delete account');
  await render(tree(second.host, seed(second.host, Promise.resolve(ready(second.host)))));
  expect(container.textContent).toBe('Waiting');
  expect(first.resourceListeners.size + first.statusListeners.size).toBe(0);
  expect(second.request).not.toHaveBeenCalled();
});

it('rechecks a query created while the old settings promise was suspended', async () => {
  const { host } = clerkHost();
  const pending = Promise.withResolvers<ProfileSettingsSeed>();
  const prefetch = seed(host, pending.promise);
  const client = createLoomClient({ scope: prefetch.hydration.scope, hydration: prefetch.hydration });
  await render(
    <LoomClientProvider
      client={client}
      prefetch={prefetch}
    >
      <Suspense fallback={<p>Waiting</p>}>
        <Profile />
      </Suspense>
    </LoomClientProvider>,
  );
  expect(container.textContent).toContain('Waiting');
  const data = { ...parseProfileSettings(environment), firstName: { enabled: false, required: false } };
  await act(() => {
    client.queryClient.setQueryData(client.profileSettingsQueryOptions().queryKey, data);
    pending.resolve(ready(host));
  });
  expect(container.textContent).toContain('Ada names disabled');
  expect(client.queryClient.getQueryData(client.profileSettingsQueryOptions().queryKey)).toEqual(data);
  client.dispose();
});
