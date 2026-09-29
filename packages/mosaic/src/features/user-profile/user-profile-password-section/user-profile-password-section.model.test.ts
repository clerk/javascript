import type { PasswordSettingsData } from '@clerk/shared/types';
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
  return { userSettings: { instanceIsPasswordBased: true, passwordSettings } };
}

let user: TestUser | null;
let session: TestSession | null;
let environment: ReturnType<typeof createEnvironment>;

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
  useUser: () => ({ isLoaded: true, user }),
  useSession: () => ({ isLoaded: true, session }),
}));

beforeEach(() => {
  user = { id: 'user_1', passwordEnabled: true, enterpriseAccounts: [], updatePassword: vi.fn() };
  session = { id: 'session_1', publicUserData: { identifier: 'person@example.com' } };
  environment = createEnvironment();
});

afterEach(cleanup);

function ready(model: ReturnType<typeof useUserProfilePasswordModel>) {
  if (model.status !== 'ready') {
    throw new Error('expected ready model');
  }
  return model;
}

describe('useUserProfilePasswordModel context changes', () => {
  it.each(['signed out', 'different user', 'different session', 'no session', 'disabled', 'enterprise', 'mode'])(
    'rejects a captured action after %s',
    async change => {
      if (!user || !session) {
        throw new Error('expected loaded fixtures');
      }
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
      }

      const input = { currentPassword: 'old password', newPassword: 'new password', signOutOfOtherSessions: true };
      await expect(action(input)).rejects.toMatchObject({ code: 'unavailable' });
      rerender();
      await expect(action(input)).rejects.toMatchObject({ code: 'unavailable' });
      expect(updatePassword).not.toHaveBeenCalled();
    },
  );

  it('rejects an update when a loaded user has no active session', async () => {
    if (!user) {
      throw new Error('expected user');
    }
    session = null;
    const { result } = renderHook(() => useUserProfilePasswordModel());
    await expect(
      ready(result.current).updatePassword({ newPassword: 'new password', signOutOfOtherSessions: true }),
    ).rejects.toMatchObject({ code: 'unavailable' });
    expect(user.updatePassword).not.toHaveBeenCalled();
  });
});
