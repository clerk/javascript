import type { Resources, UserJSON } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { User } from '../../core/resources/User';
import { memoizeListenerCallback } from '../memoizeStateListenerCallback';

function createTestUser(overrides: Partial<UserJSON> = {}): User {
  const defaultUserJSON: UserJSON = {
    email_addresses: [],
    external_accounts: [],
    first_name: 'clerk',
    id: 'u1',
    phone_numbers: [],
    updated_at: 1,
    web3_wallets: [],
  } as unknown as UserJSON;

  return new User({ ...defaultUserJSON, ...overrides } as unknown as UserJSON);
}

describe('memoizeStateListenerCallback', () => {
  it('returns same user ref if user obj state has not changed', () => {
    const user1 = createTestUser();
    const user2 = createTestUser();

    let calledWith: Resources | undefined;
    const listener = memoizeListenerCallback(
      vi.fn((e: Resources) => {
        calledWith = e;
      }),
    );

    listener({ client: null, organization: null, session: null, user: user1 });
    listener({ client: null, organization: null, session: null, user: user2 });

    expect(calledWith?.user).toBe(user1);
  });

  it('returns new user ref if user obj state has changed', () => {
    const user1 = createTestUser();
    const user2 = createTestUser({ updated_at: 2 });

    let calledWith: Resources | undefined;
    const listener = memoizeListenerCallback(
      vi.fn((e: Resources) => {
        calledWith = e;
      }),
    );

    listener({ client: null, organization: null, session: null, user: user1 });
    listener({ client: null, organization: null, session: null, user: user2 });

    expect(calledWith?.user).toBe(user2);
  });

  it('returns new user ref if user id has changed', () => {
    const user1 = createTestUser();
    const user2 = createTestUser({ id: 'u2' });

    let calledWith: Resources | undefined;
    const listener = memoizeListenerCallback(
      vi.fn((e: Resources) => {
        calledWith = e;
      }),
    );

    listener({ client: null, organization: null, session: null, user: user1 });
    listener({ client: null, organization: null, session: null, user: user2 });

    expect(calledWith?.user).toBe(user2);
  });

  it('handles user becoming null', () => {
    const user1 = createTestUser();

    let calledWith: Resources | undefined;
    const listener = memoizeListenerCallback(
      vi.fn((e: Resources) => {
        calledWith = e;
      }),
    );

    listener({ client: null, organization: null, session: null, user: user1 });
    listener({ client: null, organization: null, session: null, user: null });

    expect(calledWith?.user).toBe(null);
  });

  it('handles user transitioning from null to defined', () => {
    const user1 = createTestUser();

    let calledWith: Resources | undefined;
    const listener = memoizeListenerCallback(
      vi.fn((e: Resources) => {
        calledWith = e;
      }),
    );

    listener({ client: null, organization: null, session: null, user: null });
    listener({ client: null, organization: null, session: null, user: user1 });

    expect(calledWith?.user).toBe(user1);
  });

  it('calls the callback function each time', () => {
    const user1 = createTestUser();

    const mockCallback = vi.fn();
    const listener = memoizeListenerCallback(mockCallback);

    listener({ client: null, organization: null, session: null, user: user1 });
    listener({ client: null, organization: null, session: null, user: user1 });

    expect(mockCallback).toHaveBeenCalledTimes(2);
  });

  it('treats null and undefined as different values (null to undefined)', () => {
    let calledWith: Resources | undefined;
    const listener = memoizeListenerCallback(
      vi.fn((e: Resources) => {
        calledWith = e;
      }),
    );

    listener({ client: null, organization: null, session: null, user: null });
    listener({ client: null, organization: null, session: null, user: undefined });

    expect(calledWith?.user).toBe(undefined);
  });

  it('treats null and undefined as different values (undefined to null)', () => {
    let calledWith: Resources | undefined;
    const listener = memoizeListenerCallback(
      vi.fn((e: Resources) => {
        calledWith = e;
      }),
    );

    listener({ client: null, organization: null, session: null, user: undefined });
    listener({ client: null, organization: null, session: null, user: null });

    expect(calledWith?.user).toBe(null);
  });
});
