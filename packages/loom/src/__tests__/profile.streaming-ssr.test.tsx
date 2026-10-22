import { Suspense } from 'react';
import { renderToReadableStream } from 'react-dom/server';
import { expect, it } from 'vitest';

import { parseProfileSettings } from '../profile-settings';
import { LoomProvider, useSuspenseProfile, useSuspenseUser } from '../react';
import type { PrefetchedProfile, ProfileSettingsSeed } from '../types';
import environment from './fixtures/environment.json';
import { clerkHost, publicUser, userSeed } from './fixtures/react';

function Danger() {
  return <output>{useSuspenseUser().data.firstName} can delete account</output>;
}
function Profile() {
  return <p>{useSuspenseProfile().settings.firstName.enabled ? 'names enabled' : 'names disabled'}</p>;
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

it('streams user-only HTML before settings through the real React 19 server renderer', async () => {
  const { host } = clerkHost();
  const settings = Promise.withResolvers<ProfileSettingsSeed>();
  const prefetch = seed(host, settings.promise);
  const stream = await renderToReadableStream(
    <main>
      <LoomProvider
        clerk={null}
        prefetch={prefetch}
      >
        <Danger />
        <Suspense fallback={null}>
          <Profile />
        </Suspense>
      </LoomProvider>
    </main>,
  );
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const first = await reader.read();
  const html = decoder.decode(first.value);
  expect(html).toContain('can delete account');
  expect(html).not.toContain('names enabled');
  expect(html).toContain('rel="preload"');
  settings.resolve(ready(host));
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
