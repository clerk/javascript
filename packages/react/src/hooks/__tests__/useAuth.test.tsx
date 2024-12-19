import { createCheckAuthorization } from '@clerk/shared/authorization';
import { ClerkInstanceContext } from '@clerk/shared/react';
import type { LoadedClerk } from '@clerk/types';
import { render, renderHook } from '@testing-library/react';
import React from 'react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { AuthContext } from '../../contexts/AuthContext';
import { errorThrower } from '../../errors/errorThrower';
import { invalidStateError } from '../../errors/messages';
import { useAuth, useDerivedAuth } from '../useAuth';

vi.mock('@clerk/shared/authorization', async () => ({
  ...(await vi.importActual('@clerk/shared/authorization')),
  createCheckAuthorization: vi.fn().mockReturnValue(vi.fn().mockReturnValue(true)),
}));

vi.mock('../../errors/errorThrower', () => ({
  errorThrower: {
    throw: vi.fn(),
    throwMissingClerkProviderError: vi.fn(() => {
      throw new Error('missing ClerkProvider error');
    }),
  },
}));

const TestComponent = () => {
  const { isLoaded, isSignedIn } = useAuth();
  return (
    <div>
      {isLoaded}
      {isSignedIn}
    </div>
  );
};

describe('useAuth', () => {
  let consoleErrorSpy: any;

  beforeAll(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  test('throws an error if not wrapped in <ClerkProvider>', () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow('missing ClerkProvider error');
  });

  test('renders the correct values when wrapped in <ClerkProvider>', () => {
    expect(() => {
      render(
        <ClerkInstanceContext.Provider value={{ value: {} as LoadedClerk }}>
          <AuthContext.Provider value={{ value: {} as any }}>
            <TestComponent />
          </AuthContext.Provider>
        </ClerkInstanceContext.Provider>,
      );
    }).not.toThrow();
  });
});

describe('useDerivedAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns not loaded state when sessionId and userId are undefined', () => {
    const {
      result: { current },
    } = renderHook(() => useDerivedAuth({}));

    expect(current.isLoaded).toBe(false);
    expect(current.isSignedIn).toBeUndefined();
    expect(current.sessionId).toBeUndefined();
    expect(current.userId).toBeUndefined();
    expect(current.actor).toBeUndefined();
    expect(current.orgId).toBeUndefined();
    expect(current.orgRole).toBeUndefined();
    expect(current.orgSlug).toBeUndefined();
    expect(current.has).toBeUndefined();
  });

  it('returns loaded but not signed in when sessionId and userId are null', () => {
    const {
      result: { current },
    } = renderHook(() => useDerivedAuth({ sessionId: null, userId: null }));
    expect(current.isLoaded).toBe(true);
    expect(current.isSignedIn).toBe(false);
    expect(current.sessionId).toBeNull();
    expect(current.userId).toBeNull();
    expect(current.actor).toBeNull();
    expect(current.orgId).toBeNull();
    expect(current.orgRole).toBeNull();
    expect(current.orgSlug).toBeNull();
    expect(current.has).toBeInstanceOf(Function);
    expect(current.has?.({ permission: 'test' })).toBe(false);
  });

  it('returns signed in with org context when sessionId, userId, orgId, and orgRole are present', () => {
    const authObject = {
      sessionId: 'session123',
      userId: 'user123',
      actor: 'actor123',
      orgId: 'org123',
      orgRole: 'admin',
      orgSlug: 'my-org',
      signOut: vi.fn(),
      getToken: vi.fn(),
    };

    const {
      result: { current },
    } = renderHook(() => useDerivedAuth(authObject));

    expect(current.isLoaded).toBe(true);
    expect(current.isSignedIn).toBe(true);
    expect(current.sessionId).toBe('session123');
    expect(current.userId).toBe('user123');
    expect(current.actor).toBe('actor123');
    expect(current.orgId).toBe('org123');
    expect(current.orgRole).toBe('admin');
    expect(current.orgSlug).toBe('my-org');
    expect(typeof current.has).toBe('function');
    expect(current.signOut).toBe(authObject.signOut);
    expect(current.getToken).toBe(authObject.getToken);

    // Check has function behavior
    vi.mocked(createCheckAuthorization).mockReturnValueOnce(vi.fn().mockReturnValue('authorized'));
    expect(current.has?.({ permission: 'read' })).toBe('authorized');
  });

  it('returns signed in without org context when sessionId and userId are present but no orgId', () => {
    const authObject = {
      sessionId: 'session123',
      userId: 'user123',
      actor: 'actor123',
      signOut: vi.fn(),
      getToken: vi.fn(),
    };
    const {
      result: { current },
    } = renderHook(() => useDerivedAuth(authObject));

    expect(current.isLoaded).toBe(true);
    expect(current.isSignedIn).toBe(true);
    expect(current.sessionId).toBe('session123');
    expect(current.userId).toBe('user123');
    expect(current.actor).toBe('actor123');
    expect(current.orgId).toBeNull();
    expect(current.orgRole).toBeNull();
    expect(current.orgSlug).toBeNull();
    expect(typeof current.has).toBe('function');
    expect(current.signOut).toBe(authObject.signOut);
    expect(current.getToken).toBe(authObject.getToken);

    // Check derivedHas fallback
    vi.mocked(createCheckAuthorization).mockReturnValueOnce(vi.fn().mockReturnValue(false));
    expect(current.has?.({ permission: 'read' })).toBe(false);
  });

  it('throws invalid state error if none of the conditions match', () => {
    const authObject = {
      sessionId: true,
      userId: undefined,
    };
    renderHook(() => useDerivedAuth(authObject));

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(errorThrower.throw).toHaveBeenCalledWith(invalidStateError);
  });

  it('uses provided has function if available', () => {
    const mockHas = vi.fn().mockReturnValue('mocked-result');
    const authObject = {
      sessionId: 'session123',
      userId: 'user123',
      has: mockHas,
    };
    const {
      result: { current },
    } = renderHook(() => useDerivedAuth(authObject));

    expect(current.has?.({ permission: 'test' })).toBe('mocked-result');
    expect(mockHas).toHaveBeenCalledWith({ permission: 'test' });
  });
});
