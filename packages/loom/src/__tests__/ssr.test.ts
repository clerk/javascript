import { createElement, Fragment } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { parseHydration } from '../hydration';
import { LoomProvider, useSessions, useSuspenseSessions } from '../react';
import type { LoomHydration } from '../types';

const hydration: LoomHydration = {
  version: 5,
  scope: { instanceKey: 'server', userId: 'user_a', sessionId: 'session_a' },
  sessions: {
    updatedAt: 1,
    data: [
      {
        id: 'private_a',
        status: 'active',
        lastActiveAt: 1,
        expireAt: 2,
        abandonAt: 3,
        hasActor: false,
        latestActivity: { id: 'activity_a' },
      },
    ],
  },
};

function Rows() {
  const regular = useSessions();
  const suspense = useSuspenseSessions();
  return createElement(Fragment, null, regular.data?.[0]?.id, suspense.data[0]?.id, String(regular.isEnabled));
}

describe('request-local server rendering', () => {
  it('renders independent private roots without browser globals, timers, or a host', () => {
    expect(typeof window).toBe('undefined');
    const timeout = vi.spyOn(globalThis, 'setTimeout');
    const interval = vi.spyOn(globalThis, 'setInterval');
    try {
      const first = renderToString(createElement(LoomProvider, { clerk: null, hydration }, createElement(Rows)));
      const second = renderToString(
        createElement(
          LoomProvider,
          {
            clerk: null,
            hydration: {
              ...hydration,
              scope: { ...hydration.scope, userId: 'user_b' },
              sessions: { data: [], updatedAt: 1 },
            },
          },
          createElement(Rows),
        ),
      );
      expect(first).toContain('private_a');
      expect(first).toContain('false');
      expect(second).not.toContain('private_a');
      expect(timeout).not.toHaveBeenCalled();
      expect(interval).not.toHaveBeenCalled();
    } finally {
      timeout.mockRestore();
      interval.mockRestore();
    }
  });

  it.each([
    { ...hydration, scope: { instanceKey: 1, userId: 'a', sessionId: 'b' } },
    { ...hydration, scope: { instanceKey: 'a', userId: null, sessionId: 'b' } },
    { ...hydration, scope: { instanceKey: 'a', userId: 'b', sessionId: '' } },
    { ...hydration, sessions: [{ id: 'unvalidated' }] },
    { ...hydration, sessions: { ...hydration.sessions, updatedAt: NaN } },
  ])('rejects an invalid snapshot before creating a server owner', value => {
    expect(() => parseHydration(value)).toThrow('Invalid Loom hydration');
  });

  it('projects extras out before bootstrap can expose the snapshot', () => {
    const projected = parseHydration({
      ...hydration,
      credentials: 'secret',
      scope: { ...hydration.scope, token: 'secret' },
    });
    expect(JSON.stringify(projected)).not.toContain('secret');
  });
});
