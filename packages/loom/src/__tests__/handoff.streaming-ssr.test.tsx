import { Suspense } from 'react';
import { renderToReadableStream, renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';

import { LoomHandoff, LoomProvider, useProfileSnapshot, useUserSnapshot } from '../handoff';
import { parseProfileSettings } from '../profile-settings';
import type { PrefetchedProfile, ProfileSettingsSeed } from '../types';
import environment from './fixtures/environment.json';
import { clerkHost, publicUser, userSeed } from './fixtures/react';

function SnapshotUser() {
  return <output>{useUserSnapshot().user.firstName} can delete account</output>;
}

function SnapshotSettings() {
  return <p>{useProfileSnapshot().settings.firstName.enabled ? 'names enabled' : 'names disabled'}</p>;
}

it('streams the snapshot on the server while profile settings are pending', async () => {
  const { host } = clerkHost();
  const settings = Promise.withResolvers<ProfileSettingsSeed>();
  const prefetch: PrefetchedProfile = {
    hydration: { ...userSeed(host), user: { data: publicUser, updatedAt: Date.now() } },
    settings: settings.promise,
  };
  const stream = await renderToReadableStream(
    <LoomProvider
      clerk={null}
      prefetch={prefetch}
    >
      <main>
        <LoomHandoff live={<p>Live</p>}>
          <SnapshotUser />
          <Suspense fallback={<p>Waiting</p>}>
            <SnapshotSettings />
          </Suspense>
        </LoomHandoff>
      </main>
    </LoomProvider>,
  );
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const first = await reader.read();
  const firstHtml = decoder.decode(first.value);
  expect(firstHtml).toContain('Ada');
  expect(firstHtml).toContain('can delete account');
  expect(firstHtml).toContain('Waiting');
  expect(firstHtml).toContain('rel="preload"');
  expect(firstHtml).not.toContain('Live');
  settings.resolve({
    kind: 'ready',
    hydration: {
      version: 5,
      scope: userSeed(host).scope,
      profileSettings: { data: parseProfileSettings(environment), updatedAt: Date.now() },
    },
  });
  let rest = '';
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) {
      break;
    }
    rest += decoder.decode(chunk.value);
  }
  expect(rest).toContain('names enabled');
});

it('reads embedded profile settings without waiting for the stream', () => {
  const { host } = clerkHost();
  const hydration = {
    ...userSeed(host),
    profileSettings: { data: parseProfileSettings(environment), updatedAt: Date.now() },
  };
  const html = renderToString(
    <LoomProvider
      clerk={null}
      hydration={hydration}
    >
      <LoomHandoff live={<p>Live</p>}>
        <SnapshotSettings />
      </LoomHandoff>
    </LoomProvider>,
  );
  expect(html).toContain('names enabled');
  expect(html).not.toContain('Live');
});
