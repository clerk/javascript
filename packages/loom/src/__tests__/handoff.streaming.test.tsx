import { act, Component, type ReactNode, Suspense } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';

import { LoomHandoff, LoomProvider, useProfileSnapshot, useUserSnapshot } from '../handoff';
import { parseProfileSettings } from '../profile-settings';
import type { PrefetchedProfile, ProfileSettingsSeed } from '../types';
import environment from './fixtures/environment.json';
import { clerkHost, publicUser, userSeed } from './fixtures/react';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLDivElement;

afterEach(async () => {
  await act(() => root?.unmount());
  root = undefined;
  container?.remove();
  vi.restoreAllMocks();
});

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <p>Unavailable</p> : this.props.children;
  }
}

function Profile() {
  const { user, settings } = useProfileSnapshot();
  return (
    <p>
      {user.firstName} {settings.firstName.enabled ? 'enabled' : 'disabled'}
    </p>
  );
}

function User() {
  return <p>{useUserSnapshot().user.firstName}</p>;
}

async function render(prefetch: PrefetchedProfile) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(() =>
    root?.render(
      <LoomProvider
        clerk={null}
        prefetch={prefetch}
      >
        <LoomHandoff live={<p>Live</p>}>
          <User />
          <Boundary>
            <Suspense fallback={<p>Waiting</p>}>
              <Profile />
            </Suspense>
          </Boundary>
        </LoomHandoff>
      </LoomProvider>,
    ),
  );
}

it.each(['unavailable', 'wrong scope'])('routes %s settings to the seed boundary', async kind => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const { host } = clerkHost();
  const seed = userSeed(host);
  const ready: ProfileSettingsSeed = {
    kind: 'ready',
    hydration: {
      version: 5,
      scope: { ...seed.scope, sessionId: 'other' },
      profileSettings: { data: parseProfileSettings(environment), updatedAt: Date.now() },
    },
  };
  const prefetch: PrefetchedProfile = {
    hydration: { ...seed, user: { data: publicUser, updatedAt: Date.now() } },
    settings: Promise.resolve(kind === 'unavailable' ? { kind: 'unavailable' } : ready),
  };
  await render(prefetch);
  expect(container.textContent).toContain('Ada');
  expect(container.textContent).toContain('Unavailable');
});
