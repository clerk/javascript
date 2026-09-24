import type { PasswordSettingsData } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUserProfilePasswordModel } from './user-profile-password-section.model';

type TestUser = {
  id: string;
  passwordEnabled: boolean;
  enterpriseAccounts: { active: boolean }[];
  updatePassword: ReturnType<typeof vi.fn>;
};

type TestSession = { id: string; publicUserData: { identifier: string | null } };

const passwordSettings: PasswordSettingsData = {
  min_length: 8,
  max_length: 72,
  require_numbers: false,
  require_uppercase: false,
  require_lowercase: false,
  require_special_char: false,
  allowed_special_characters: '',
  disable_hibp: false,
  show_zxcvbn: true,
  min_zxcvbn_strength: 2,
};

function createEnvironment() {
  return {
    userSettings: { instanceIsPasswordBased: true, passwordSettings },
    authConfig: { reverification: false },
  };
}

let isUserLoaded: boolean;
let isSessionLoaded: boolean;
let user: TestUser | null;
let session: TestSession | null;
let environment: ReturnType<typeof createEnvironment> | undefined;

const clerk = {
  get user() {
    return user;
  },
  get session() {
    return session;
  },
  get __internal_environment() {
    return environment;
  },
};

vi.mock('@clerk/shared/react', () => ({
  useClerk: () => clerk,
  useUser: () => ({ isLoaded: isUserLoaded, user }),
  useSession: () => ({ isLoaded: isSessionLoaded, session }),
}));

beforeEach(() => {
  isUserLoaded = true;
  isSessionLoaded = true;
  user = { id: 'user_1', passwordEnabled: false, enterpriseAccounts: [], updatePassword: vi.fn() };
  session = { id: 'session_1', publicUserData: { identifier: 'person@example.com' } };
  environment = createEnvironment();
});

afterEach(cleanup);

function ready(model: ReturnType<typeof useUserProfilePasswordModel>) {
  expect(model.status).toBe('ready');
  if (model.status !== 'ready') {
    throw new Error('expected ready model');
  }
  return model;
}

describe('useUserProfilePasswordModel', () => {
  it.each([undefined, ''])('rejects a missing required current password (%j)', async currentPassword => {
    if (!user) {
      throw new Error('expected user');
    }
    user.passwordEnabled = true;
    const { result } = renderHook(() => useUserProfilePasswordModel());
    await expect(
      ready(result.current).updatePassword({
        currentPassword,
        newPassword: 'new password',
        signOutOfOtherSessions: true,
      }),
    ).rejects.toThrow('Current password is required.');
    expect(user.updatePassword).not.toHaveBeenCalled();
  });

  it.each([
    'signed out',
    'different user',
    'different session',
    'no session',
    'disabled',
    'enterprise',
    'mode',
    'proof',
  ])('rejects a captured action after the context changes: %s', async change => {
    if (!user || !session || !environment) {
      throw new Error('expected loaded fixtures');
    }
    user.passwordEnabled = true;
    const updatePassword = user.updatePassword;
    const { result, rerender } = renderHook(() => useUserProfilePasswordModel());
    const action = ready(result.current).updatePassword;

    switch (change) {
      case 'signed out':
        user = null;
        break;
      case 'different user':
        user = { ...user, id: 'user_2' };
        break;
      case 'different session':
        session = { ...session, id: 'session_2' };
        break;
      case 'no session':
        session = null;
        break;
      case 'disabled':
        environment.userSettings.instanceIsPasswordBased = false;
        break;
      case 'enterprise':
        user.enterpriseAccounts = [{ active: true }];
        break;
      case 'mode':
        user.passwordEnabled = false;
        break;
      case 'proof':
        environment.authConfig.reverification = true;
        break;
    }

    const input = { currentPassword: 'old password', newPassword: 'new password', signOutOfOtherSessions: true };
    await expect(action(input)).rejects.toThrow('Password update is no longer available.');
    rerender();
    await expect(action(input)).rejects.toThrow('Password update is no longer available.');
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it('rejects updates when a loaded user has no active session', async () => {
    if (!user) {
      throw new Error('expected user');
    }
    session = null;
    const { result } = renderHook(() => useUserProfilePasswordModel());
    await expect(
      ready(result.current).updatePassword({ newPassword: 'new password', signOutOfOtherSessions: true }),
    ).rejects.toThrow('Password update is no longer available.');
    expect(user.updatePassword).not.toHaveBeenCalled();
  });

  it.each([
    { passwordEnabled: false, reverification: false, signOutOfOtherSessions: true, currentPassword: undefined },
    { passwordEnabled: false, reverification: true, signOutOfOtherSessions: false, currentPassword: undefined },
    { passwordEnabled: true, reverification: false, signOutOfOtherSessions: false, currentPassword: ' old secret ' },
    { passwordEnabled: true, reverification: true, signOutOfOtherSessions: true, currentPassword: undefined },
  ])('sends the legacy payload for %j', async policy => {
    if (!user || !environment) {
      throw new Error('expected loaded fixtures');
    }
    user.passwordEnabled = policy.passwordEnabled;
    environment.authConfig.reverification = policy.reverification;
    const { result } = renderHook(() => useUserProfilePasswordModel());
    const input = {
      currentPassword: ' old secret ',
      newPassword: ' new e\u0301 secret ',
      confirmPassword: 'must never reach the SDK',
      signOutOfOtherSessions: policy.signOutOfOtherSessions,
    };

    await ready(result.current).updatePassword(input);

    const expected = {
      newPassword: ' new e\u0301 secret ',
      signOutOfOtherSessions: policy.signOutOfOtherSessions,
    };
    expect(user.updatePassword).toHaveBeenCalledExactlyOnceWith(
      policy.currentPassword === undefined ? expected : { ...expected, currentPassword: ' old secret ' },
    );
  });

  it('waits for the SDK resource and derives change mode only after hydration', async () => {
    if (!user) {
      throw new Error('expected user');
    }
    const request = createDeferredPromise();
    user.updatePassword.mockReturnValueOnce(request.promise);
    const { result, rerender } = renderHook(() => useUserProfilePasswordModel());
    const promise = ready(result.current).updatePassword({ newPassword: 'new password', signOutOfOtherSessions: true });
    expect(ready(result.current).mode).toBe('set');
    expect(user.passwordEnabled).toBe(false);

    user = { ...user, passwordEnabled: true };
    request.resolve(user);
    await expect(promise).resolves.toBe(user);
    rerender();
    expect(ready(result.current).mode).toBe('change');
  });

  it.each([
    { errors: [{ code: 'form_password_incorrect', meta: { paramName: 'current_password' } }] },
    { errors: [{ code: 'session_reverification_required' }] },
    new Error('network failure'),
  ])('preserves the SDK rejection for the caller', async error => {
    if (!user) {
      throw new Error('expected user');
    }
    user.updatePassword.mockRejectedValueOnce(error);
    const { result } = renderHook(() => useUserProfilePasswordModel());
    await expect(
      ready(result.current).updatePassword({ newPassword: 'new password', signOutOfOtherSessions: true }),
    ).rejects.toBe(error);
  });

  it.each([
    { passwordEnabled: false, reverification: false, mode: 'set', requiresCurrentPassword: false },
    { passwordEnabled: false, reverification: true, mode: 'set', requiresCurrentPassword: false },
    { passwordEnabled: true, reverification: false, mode: 'change', requiresCurrentPassword: true },
    { passwordEnabled: true, reverification: true, mode: 'change', requiresCurrentPassword: false },
  ])('derives $mode mode with reverification=$reverification', policy => {
    if (!user || !environment) {
      throw new Error('expected loaded fixtures');
    }
    user.passwordEnabled = policy.passwordEnabled;
    environment.authConfig.reverification = policy.reverification;
    const { result } = renderHook(() => useUserProfilePasswordModel());
    expect(result.current).toMatchObject({
      status: 'ready',
      mode: policy.mode,
      requiresCurrentPassword: policy.requiresCurrentPassword,
      userId: 'user_1',
      sessionId: 'session_1',
      identifier: 'person@example.com',
      passwordSettings,
    });
  });

  it('keeps a loaded user visible when there is no session identifier', () => {
    session = null;
    const { result } = renderHook(() => useUserProfilePasswordModel());
    expect(result.current).toMatchObject({ status: 'ready', sessionId: null, identifier: '' });
  });

  it.each([false, true])('makes active enterprise accounts readonly with passwordEnabled=%s', passwordEnabled => {
    if (!user) {
      throw new Error('expected user');
    }
    user.passwordEnabled = passwordEnabled;
    user.enterpriseAccounts = [{ active: false }, { active: true }, { active: true }];
    const { result, rerender } = renderHook(() => useUserProfilePasswordModel());
    expect(result.current).toEqual({
      status: 'readonly',
      reason: 'enterprise_account',
      mode: passwordEnabled ? 'change' : 'set',
    });

    user.enterpriseAccounts = [{ active: false }];
    rerender();
    expect(result.current.status).toBe('ready');
  });

  it('hides the section when the loaded user is absent', () => {
    user = null;
    const { result } = renderHook(() => useUserProfilePasswordModel());
    expect(result.current).toEqual({ status: 'hidden', reason: 'no_user' });
  });

  it.each([false, true])('hides disabled instance passwords when user passwordEnabled is %s', passwordEnabled => {
    if (!user || !environment) {
      throw new Error('expected loaded fixtures');
    }
    user.passwordEnabled = passwordEnabled;
    environment.userSettings.instanceIsPasswordBased = false;
    const { result } = renderHook(() => useUserProfilePasswordModel());
    expect(result.current).toEqual({ status: 'hidden', reason: 'password_disabled' });
  });

  it.each(['user', 'session', 'environment'])('waits for %s to load', resource => {
    if (resource === 'user') {
      isUserLoaded = false;
    } else if (resource === 'session') {
      isSessionLoaded = false;
    } else {
      environment = undefined;
    }

    const { result } = renderHook(() => useUserProfilePasswordModel());

    expect(result.current).toEqual({ status: 'loading' });
  });
});
