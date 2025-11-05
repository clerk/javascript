import type { Resources, UserJSON } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { User } from '../../core/resources/User';
import { memoizeListenerCallback } from '../memoizeStateListenerCallback';

describe('memoizeStateListenerCallback', () => {
  it('returns same user ref if user obj state has not changed', () => {
    const user1 = new User({
      id: 'u1',
      updated_at: 1,
      first_name: 'clerk',
      email_addresses: [],
      external_accounts: [],
      phone_numbers: [],
      web3_wallets: [],
    } as unknown as UserJSON);

    const user2 = new User({
      id: 'u1',
      updated_at: 1,
      first_name: 'clerk',
      email_addresses: [],
      external_accounts: [],
      phone_numbers: [],
      web3_wallets: [],
    } as unknown as UserJSON);

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
    const user1 = new User({
      id: 'u1',
      updated_at: 1,
      first_name: 'clerk',
      email_addresses: [],
      external_accounts: [],
      phone_numbers: [],
      web3_wallets: [],
    } as unknown as UserJSON);

    const user2 = new User({
      id: 'u1',
      updated_at: 2,
      first_name: 'clerk',
      email_addresses: [],
      external_accounts: [],
      phone_numbers: [],
      web3_wallets: [],
    } as unknown as UserJSON);

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
    const user1 = new User({
      id: 'u1',
      updated_at: 1,
      first_name: 'clerk',
      email_addresses: [],
      external_accounts: [],
      phone_numbers: [],
      web3_wallets: [],
    } as unknown as UserJSON);

    const user2 = new User({
      id: 'u2',
      updated_at: 1,
      first_name: 'clerk',
      email_addresses: [],
      external_accounts: [],
      phone_numbers: [],
      web3_wallets: [],
    } as unknown as UserJSON);

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
    const user1 = new User({
      id: 'u1',
      updated_at: 1,
      first_name: 'clerk',
      email_addresses: [],
      external_accounts: [],
      phone_numbers: [],
      web3_wallets: [],
    } as unknown as UserJSON);

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
    const user1 = new User({
      id: 'u1',
      updated_at: 1,
      first_name: 'clerk',
      email_addresses: [],
      external_accounts: [],
      phone_numbers: [],
      web3_wallets: [],
    } as unknown as UserJSON);

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
    const user1 = new User({
      id: 'u1',
      updated_at: 1,
      first_name: 'clerk',
      email_addresses: [],
      external_accounts: [],
      phone_numbers: [],
      web3_wallets: [],
    } as unknown as UserJSON);

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
