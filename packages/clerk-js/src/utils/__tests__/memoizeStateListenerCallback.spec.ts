// TODO: jest fails because of a circular dependency on Client -> Base -> Client
// This circular dep is a known issue we plan to address soon. Enable the tests then

import { describe, it, expect, vi } from 'vitest';
import { memoizeListenerCallback } from '../memoizeStateListenerCallback';

describe('memoizeStateListenerCallback', () => {
  it('returns same user ref if user obj state has not changed', () => {
    // Mock user objects (simulate same user, different object refs)
    const user1 = { id: 'u1', updatedAt: new Date(1), firstName: 'clerk', organizationMemberships: [] };
    const user2 = { id: 'u1', updatedAt: new Date(1), firstName: 'clerk', organizationMemberships: [] };

    let calledWith: any;
    const listener = memoizeListenerCallback(
      vi.fn((e: any) => {
        calledWith = e.user;
      }),
    );

    listener({ user: user1 });
    listener({ user: user2 });
    expect(calledWith).toStrictEqual(user1);
  });
});
