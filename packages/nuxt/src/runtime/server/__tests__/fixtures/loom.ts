import { parsePublishableKey } from '@clerk/shared/keys';
import { addClerkPrefix, stripScheme } from '@clerk/shared/url';
import type { H3Event } from 'h3';

import { useRuntimeConfig as getRuntimeConfig } from '#imports';

import { prefetchProfile } from '../../../../../../loom/src/server';
import { clerkClient } from '../../clerkClient';

export async function prefetchProfileForEvent(event: H3Event) {
  const { userId, sessionId } = event.context.auth();
  const profile = await prefetchProfile({
    identity: { userId, sessionId },
    resolveBackend: () => {
      const config = getRuntimeConfig(event);
      const { publishableKey, domain, proxyUrl } = config.public.clerk;
      const key = parsePublishableKey(publishableKey);
      if (!key || typeof domain === 'function' || typeof proxyUrl === 'function') {
        throw new Error('Clerk request routing is unavailable.');
      }
      return Promise.resolve({
        client: clerkClient(event),
        routing: {
          publishableKey,
          frontendApi: key.frontendApi,
          proxyUrl,
          domain:
            key.instanceType === 'production' ? addClerkPrefix(stripScheme(domain ?? '')) : stripScheme(domain ?? ''),
        },
      });
    },
  });
  return profile && { hydration: profile.hydration, settings: await profile.settings };
}
