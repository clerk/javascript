import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';

import { createLoomClient } from '../client';
import { LoomProvider, useSessions } from '../react';
import type { Sessions } from '../types';

it('renders concurrent request-local owners in Node without a browser or ClerkJS', async () => {
  expect(typeof window).toBe('undefined');
  const scope = { instanceKey: 'controlled', userId: 'user_a', sessionId: 'sess_a' };
  const device = (id: string): Sessions => [
    {
      id,
      status: 'active',
      lastActiveAt: null,
      expireAt: 1000,
      abandonAt: 1000,
      hasActor: false,
      latestActivity: { id: 'a' },
    },
  ];
  const a = createLoomClient({
    scope,
    transport: { read: () => Promise.resolve(device('request_a')), revoke: () => Promise.resolve() },
  });
  const b = createLoomClient({
    scope,
    transport: { read: () => Promise.resolve(device('request_b')), revoke: () => Promise.resolve() },
  });
  await Promise.all([a.prefetch(), b.prefetch()]);
  function List() {
    return createElement('p', null, useSessions().data?.[0]?.id);
  }
  const html = (client: typeof a) => renderToString(createElement(LoomProvider, { client }, createElement(List)));
  expect(html(a)).toBe('<p>request_a</p>');
  expect(html(b)).toBe('<p>request_b</p>');
  expect(JSON.stringify(a.dehydrate())).not.toContain('request_b');
  a.dispose();
  expect(html(b)).toBe('<p>request_b</p>');
  b.dispose();
});
