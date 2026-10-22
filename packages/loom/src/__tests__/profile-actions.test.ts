import { describe, expect, it, vi } from 'vitest';

import { bindClerk, type ClerkSessionsHost } from '../clerk';
import { createLoomClient } from '../client';
import type { ProfileEnvironment } from '../profile-host-types';

const web3Mock = vi.hoisted(() => ({ getWeb3Identifier: vi.fn(), generateWeb3Signature: vi.fn() }));
vi.mock('@clerk/shared/internal/clerk-js/web3', () => ({ createWeb3: () => web3Mock }));

function policy(): ProfileEnvironment {
  return {
    userSettings: {
      attributes: {
        email_address: {
          enabled: true,
          immutable: false,
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: ['email_code'],
        },
        username: {
          enabled: true,
          immutable: false,
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
        },
      },
      enterpriseSSO: { enabled: false },
      socialProviderStrategies: ['oauth_google'],
      usernameSettings: { min_length: 3, max_length: 30 },
      instanceIsPasswordBased: true,
      passwordSettings: {
        min_length: 8,
        max_length: 72,
        allowed_special_characters: '',
        disable_hibp: false,
        require_special_char: false,
        require_numbers: false,
        require_uppercase: false,
        require_lowercase: false,
        show_zxcvbn: false,
        min_zxcvbn_strength: 2,
      },
    },
    authConfig: { reverification: false },
    displayConfig: { userProfileUrl: 'https://example.com/profile' },
  };
}

function fixture() {
  const listeners = new Set<() => void>();
  const update = vi.fn(() => Promise.resolve({}));
  const host: ClerkSessionsHost = {
    loaded: true,
    publishableKey: 'pk_test_a',
    frontendApi: 'clerk.test',
    domain: '',
    proxyUrl: undefined,
    user: { id: 'user_a', update, enterpriseAccounts: [] },
    session: { id: 'session_a' },
    addListener: listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    on: () => {},
    off: () => {},
  };
  return {
    host,
    update,
    emit: () => {
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

describe('owner-bound profile actions', () => {
  it('has no commands on a standalone hydration owner', () => {
    const owner = createLoomClient({ scope: { instanceKey: 'a', userId: 'a', sessionId: 'a' } });
    expect(owner.profileActions().details.updateName).toBeUndefined();
    expect(owner.profileActions().danger.delete).toBeUndefined();
    owner.dispose();
  });
  it('notifies action subscribers even when same-scope display facts have not changed', () => {
    const { host, emit } = fixture();
    const binding = bindClerk(host);
    const owner = binding.getSnapshot();
    if (!owner) {
      throw new Error('Missing owner');
    }
    const listener = vi.fn();
    owner.subscribeActions(listener);
    emit();
    expect(listener).toHaveBeenCalledOnce();
    binding.dispose();
  });
  it('retires captured commands through an A-B-A identity change', async () => {
    const { host, update, emit } = fixture();
    const binding = bindClerk(host);
    const command = binding.getSnapshot()?.profileActions().details.updateName;
    expect(command).toBeTypeOf('function');
    host.session = { id: 'session_b' };
    emit();
    host.session = { id: 'session_a' };
    emit();
    await expect(command?.({ firstName: 'Ada', lastName: '' })).rejects.toThrow();
    expect(update).not.toHaveBeenCalled();
    binding.dispose();
  });
});

describe('profile policy and write boundaries', () => {
  it('stops a wallet connection after discovery if the account switches', async () => {
    const { host, emit } = fixture();
    const environment = policy();
    environment.userSettings.attributes.web3_wallet = {
      enabled: true,
      immutable: false,
      used_for_first_factor: true,
      used_for_second_factor: false,
      verifications: [],
    };
    environment.userSettings.web3FirstFactors = ['web3_metamask_signature'];
    host.__internal_environment = environment;
    host.__internal_moduleManager = { import: () => Promise.resolve(undefined) };
    const createWeb3Wallet = vi.fn(() => Promise.reject(new Error('wallet creation reached')));
    if (!host.user) {
      throw new Error('Missing user');
    }
    host.user = { ...host.user, web3Wallets: [], createWeb3Wallet };
    const discovery = Promise.withResolvers<string>();
    web3Mock.getWeb3Identifier.mockReturnValueOnce(discovery.promise);
    const binding = bindClerk(host);
    const command = binding.getSnapshot()?.profileActions().wallet.connect;
    expect(command).toBeTypeOf('function');
    const pending = command?.('web3_metamask_signature');
    host.session = { id: 'session_b' };
    emit();
    discovery.resolve('0xabc');
    await expect(pending).rejects.toThrow();
    expect(createWeb3Wallet).not.toHaveBeenCalled();
    expect(web3Mock.generateWeb3Signature).not.toHaveBeenCalled();
    binding.dispose();
  });
  it('returns MFA setup secrets and backup codes only to the command caller', async () => {
    const { host } = fixture();
    const environment = policy();
    environment.userSettings.attributes.authenticator_app = {
      enabled: true,
      immutable: false,
      used_for_first_factor: false,
      used_for_second_factor: true,
      second_factors: ['totp'],
      verifications: [],
    };
    host.__internal_environment = environment;
    if (!host.user) {
      throw new Error('Missing user');
    }
    host.user = {
      ...host.user,
      phoneNumbers: [],
      totpEnabled: false,
      createTOTP: vi.fn(() => Promise.resolve({ secret: 'secret-123', uri: 'otpauth://private' })),
      verifyTOTP: vi.fn(() => Promise.resolve({ backupCodes: ['backup-123'] })),
    };
    const binding = bindClerk(host);
    const owner = binding.getSnapshot();
    if (!owner) {
      throw new Error('Missing owner');
    }
    expect(await owner.profileActions().mfa.createAuthenticator?.()).toEqual({
      secret: 'secret-123',
      uri: 'otpauth://private',
    });
    expect(await owner.profileActions().mfa.verifyAuthenticator?.('123456')).toEqual({ backupCodes: ['backup-123'] });
    expect(
      JSON.stringify(
        owner.queryClient
          .getQueryCache()
          .getAll()
          .map(query => query.state.data),
      ),
    ).not.toContain('secret-123');
    expect(
      JSON.stringify(
        owner.queryClient
          .getQueryCache()
          .getAll()
          .map(query => query.state.data),
      ),
    ).not.toContain('backup-123');
    binding.dispose();
  });
  it('permits phone creation when phone is a second factor without a general enabled flag', async () => {
    const { host } = fixture();
    const environment = policy();
    environment.userSettings.attributes.phone_number = {
      enabled: false,
      immutable: false,
      used_for_first_factor: false,
      used_for_second_factor: true,
      second_factors: ['phone_code'],
      verifications: ['phone_code'],
    };
    const createPhoneNumber = vi.fn(() => Promise.reject(new Error('creation reached')));
    if (!host.user) {
      throw new Error('Missing user');
    }
    host.user = { ...host.user, phoneNumbers: [], createPhoneNumber };
    host.__internal_environment = environment;
    const binding = bindClerk(host);
    const command = binding.getSnapshot()?.profileActions().phone.create;
    expect(command).toBeTypeOf('function');
    await expect(command?.('+15551230000')).rejects.toThrow('creation reached');
    expect(createPhoneNumber).toHaveBeenCalledOnce();
    binding.dispose();
  });
  it('rechecks username policy after render and permits an enabled non-factor username', async () => {
    const { host, update } = fixture();
    const environment = policy();
    host.__internal_environment = environment;
    const binding = bindClerk(host);
    const command = binding.getSnapshot()?.profileActions().details.updateUsername;
    expect(command).toBeTypeOf('function');
    if (!environment.userSettings.attributes.username) {
      throw new Error('Missing username policy');
    }
    environment.userSettings.attributes.username.immutable = true;
    await expect(command?.('grace')).rejects.toThrow('Username unavailable');
    expect(update).not.toHaveBeenCalled();
    binding.dispose();
  });
  it('subscribes before reading environment and releases the subscription', () => {
    const { host } = fixture();
    const listeners = new Set<() => void>();
    host.__internal_environment = policy();
    host.__internal_subscribeEnvironment = listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    };
    const binding = bindClerk(host);
    const owner = binding.getSnapshot();
    if (!owner) {
      throw new Error('Missing owner');
    }
    const listener = vi.fn();
    owner.subscribeActions(listener);
    host.__internal_environment = { ...policy(), userSettings: { ...policy().userSettings, attributes: {} } };
    for (const notify of listeners) {
      notify();
    }
    expect(listener).toHaveBeenCalledOnce();
    expect(owner.profileActions().details.updateUsername).toBeUndefined();
    binding.dispose();
    expect(listeners.size).toBe(0);
  });
  it('keeps failed mutation cache state unchanged without starting a refetch', async () => {
    const failure = new Error('reverification required');
    const owner = createLoomClient({ scope: { instanceKey: 'a', userId: 'a', sessionId: 'a' } });
    const invalidate = vi.spyOn(owner, 'invalidateUser');
    await expect(owner.mutateProfile(() => Promise.reject(failure))).rejects.toBe(failure);
    expect(invalidate).not.toHaveBeenCalled();
    owner.dispose();
  });
  it('reconciles overlapping name and profile writes without publishing an older name snapshot', async () => {
    const pending = Promise.withResolvers<void>();
    const snapshot = {
      id: 'a',
      firstName: 'Ada',
      lastName: '',
      username: null,
      imageUrl: '',
      hasImage: false,
      passwordEnabled: false,
      deleteSelfEnabled: false,
      primaryEmailAddressId: null,
      emailAddresses: [],
      enterpriseAccounts: [],
      externalAccounts: [],
    };
    const scope = { instanceKey: 'a', userId: 'a', sessionId: 'a' };
    const updateName = vi.fn(() => Promise.resolve({ ...snapshot, firstName: 'Grace' }));
    const owner = createLoomClient({
      scope,
      updateName,
      hydration: { version: 5, scope, user: { data: snapshot, updatedAt: Date.now() } },
    });
    const invalidate = vi.spyOn(owner, 'invalidateUser');
    const active = owner.mutateProfile(() => pending.promise);
    await expect(owner.updateName({ firstName: 'Grace', lastName: '' })).resolves.toMatchObject({ firstName: 'Grace' });
    expect(updateName).toHaveBeenCalledOnce();
    expect(owner.queryClient.getQueryData(owner.userQueryOptions().queryKey)).toEqual(snapshot);
    pending.resolve();
    await active;
    expect(invalidate).toHaveBeenCalled();
    await vi.waitFor(() =>
      expect(owner.queryClient.getQueryState(owner.userQueryOptions().queryKey)?.isInvalidated).toBe(true),
    );
    owner.dispose();
  });
  it('rejects password mutation when its current-password policy changes before retry', async () => {
    const { host } = fixture();
    const updatePassword = vi.fn(() => Promise.resolve({}));
    host.user = { id: 'user_a', passwordEnabled: true, updatePassword };
    host.__internal_environment = policy();
    const binding = bindClerk(host);
    const password = binding.getSnapshot()?.profileActions().password;
    if (password?.status !== 'ready') {
      throw new Error('Missing password actions');
    }
    host.__internal_environment.authConfig.reverification = true;
    await expect(password.update({ newPassword: 'password', signOutOfOtherSessions: false })).rejects.toThrow(
      'Password unavailable',
    );
    expect(updatePassword).not.toHaveBeenCalled();
    binding.dispose();
  });
});

describe('asynchronous profile actions', () => {
  it('blocks OAuth create when identity changes during redirect preparation', async () => {
    const { host, emit } = fixture();
    const redirect = Promise.withResolvers<string>();
    const create = vi.fn(() =>
      Promise.resolve({
        verification: { externalVerificationRedirectURL: new URL('https://idp.example') },
      }),
    );
    host.user = { id: 'user_a', createExternalAccount: create, externalAccounts: [] };
    host.__internal_environment = policy();
    host.__internal_oauthTransport = { getRedirectUrl: () => redirect.promise, open: vi.fn() };
    const binding = bindClerk(host);
    const result = binding.getSnapshot()?.profileActions().connectedAccounts.connect?.('oauth_google');
    host.session = { id: 'session_b' };
    emit();
    redirect.resolve('https://example.com/return');
    await expect(result).rejects.toThrow();
    expect(create).not.toHaveBeenCalled();
    binding.dispose();
  });
  it('wraps only reconnect creation and retries the captured target after reverification', async () => {
    const { host } = fixture();
    const redirect = 'https://example.com/return';
    const create = vi.fn(() =>
      Promise.resolve({
        verification: { externalVerificationRedirectURL: new URL('https://idp.example') },
      }),
    );
    host.user = {
      id: 'user_a',
      createExternalAccount: create,
      externalAccounts: [
        {
          id: 'account_a',
          provider: 'google',
          emailAddress: '',
          verification: { status: 'failed', strategy: 'oauth_google', error: { code: 'oauth_fetch_user_error' } },
        },
      ],
    };
    host.__internal_environment = policy();
    host.__internal_oauthTransport = { getRedirectUrl: () => redirect, open: vi.fn() };
    let retry: (() => Promise<void>) | undefined;
    const reverify = vi.fn((command: () => Promise<void>) => {
      retry = command;
      return Promise.resolve();
    });
    const binding = bindClerk(host);
    await expect(
      binding.getSnapshot()?.profileActions({ reverifyReconnect: reverify }).connectedAccounts.reconnect?.('account_a'),
    ).rejects.toThrow('unavailable');
    expect(reverify).toHaveBeenCalledOnce();
    if (!host.user || !retry) {
      throw new Error('Missing retry');
    }
    host.user.externalAccounts = [];
    await expect(retry()).rejects.toThrow('unavailable');
    expect(create).not.toHaveBeenCalled();
    binding.dispose();
  });
  it('keeps direct reauthorization outside the create reverification wrapper', async () => {
    const { host } = fixture();
    const reauthorize = vi.fn(() =>
      Promise.resolve({
        verification: { externalVerificationRedirectURL: new URL('https://idp.example') },
      }),
    );
    const reload = vi.fn(() => Promise.resolve({}));
    host.user = {
      id: 'user_a',
      reload,
      externalAccounts: [
        { id: 'account_a', provider: 'google', emailAddress: '', approvedScopes: 'profile', reauthorize },
      ],
    };
    host.__internal_environment = policy();
    host.__internal_oauthTransport = {
      getRedirectUrl: () => 'https://example.com/return',
      open: () => Promise.resolve({ callbackUrl: 'https://example.com/return?rotating_token_nonce=nonce' }),
    };
    const reverify = vi.fn(async (create: () => Promise<void>) => create());
    const binding = bindClerk(host);
    await binding
      .getSnapshot()
      ?.profileActions({ additionalOAuthScopes: { google: ['profile', 'email'] }, reverifyReconnect: reverify })
      .connectedAccounts.reconnect?.('account_a');
    expect(reauthorize).toHaveBeenCalledOnce();
    expect(reverify).not.toHaveBeenCalled();
    expect(reload).toHaveBeenCalledWith({ rotatingTokenNonce: 'nonce' });
    binding.dispose();
  });
  it('does not reload the next user after an OAuth popup resolves', async () => {
    const { host, emit } = fixture();
    const opened = Promise.withResolvers<{ callbackUrl: string }>();
    const reload = vi.fn(() => Promise.resolve({}));
    const create = vi.fn(() =>
      Promise.resolve({
        verification: { externalVerificationRedirectURL: new URL('https://idp.example') },
      }),
    );
    host.user = { id: 'user_a', createExternalAccount: create, reload };
    host.__internal_environment = policy();
    const open = vi.fn(() => opened.promise);
    host.__internal_oauthTransport = { getRedirectUrl: () => 'https://example.com/return', open };
    const binding = bindClerk(host);
    const result = binding.getSnapshot()?.profileActions().connectedAccounts.connect?.('oauth_google');
    await vi.waitFor(() => expect(open).toHaveBeenCalledOnce());
    host.user = { id: 'user_b', reload };
    emit();
    opened.resolve({ callbackUrl: 'https://example.com/return' });
    await expect(result).rejects.toThrow();
    expect(reload).not.toHaveBeenCalled();
    binding.dispose();
  });
  it('guards email verification and cancels link work once on owner retirement', async () => {
    const { host, emit } = fixture();
    const pending = Promise.withResolvers<void>();
    const cancel = vi.fn();
    const attempt = vi.fn(() => Promise.resolve({}));
    host.user = {
      id: 'user_a',
      emailAddresses: [
        {
          id: 'email_a',
          emailAddress: 'a@example.com',
          attemptVerification: attempt,
          createEmailLinkFlow: () => ({ startEmailLinkFlow: () => pending.promise, cancelEmailLinkFlow: cancel }),
        },
      ],
    };
    const environment = policy();
    if (!environment.userSettings.attributes.email_address) {
      throw new Error('Missing email policy');
    }
    environment.userSettings.attributes.email_address.verifications = ['email_link'];
    host.__internal_environment = environment;
    const binding = bindClerk(host);
    const verifier = binding.getSnapshot()?.profileActions().email.verifier('email_a');
    const verification = verifier?.start();
    if (verification?.method !== 'link') {
      throw new Error('Missing link verification');
    }
    host.session = { id: 'session_b' };
    emit();
    expect(cancel).toHaveBeenCalledOnce();
    verification.cancel();
    expect(cancel).toHaveBeenCalledOnce();
    pending.resolve();
    await expect(verification.verified).rejects.toThrow();
    await expect(verifier?.verifyCode('123456')).rejects.toThrow();
    expect(attempt).not.toHaveBeenCalled();
    binding.dispose();
  });
  it('skips stale sign-out after successful deletion switches the active user', async () => {
    const { host, emit } = fixture();
    const deleted = Promise.withResolvers<void>();
    const setActive = vi.fn(async () => {});
    host.user = { id: 'user_a', deleteSelfEnabled: true, delete: () => deleted.promise };
    host.setActive = setActive;
    host.buildAfterSignOutUrl = () => '/signed-out';
    host.buildAfterMultiSessionSingleSignOutUrl = () => '/switch';
    host.client = { signedInSessions: [] };
    const binding = bindClerk(host);
    const result = binding.getSnapshot()?.profileActions().danger.delete?.();
    host.user = { id: 'user_b' };
    emit();
    deleted.resolve();
    await expect(result).resolves.toBeUndefined();
    expect(setActive).not.toHaveBeenCalled();
    binding.dispose();
  });
});

describe('deletion completion after sign-out', () => {
  it.each(['user-and-session', 'session'])(
    'redirects when deletion clears %s and emits the host change',
    async cleared => {
      const { host, emit } = fixture();
      const setActive = vi.fn(() => Promise.resolve());
      host.user = {
        id: 'user_a',
        deleteSelfEnabled: true,
        delete: () => {
          if (cleared === 'user-and-session') {
            host.user = null;
          }
          host.session = null;
          emit();
          return Promise.resolve();
        },
      };
      host.setActive = setActive;
      host.buildAfterSignOutUrl = () => '/signed-out';
      host.buildAfterMultiSessionSingleSignOutUrl = () => '/switch';
      host.client = { signedInSessions: [] };
      const binding = bindClerk(host);
      await binding.getSnapshot()?.profileActions().danger.delete?.();
      expect(setActive).toHaveBeenCalledWith({ session: null, redirectUrl: '/signed-out' });
      binding.dispose();
    },
  );
  it.each(['binding', 'owner', 'replacement', 'instance'])(
    'skips deletion continuation after %s retirement',
    async retirement => {
      const { host, emit } = fixture();
      const pending = Promise.withResolvers<void>();
      const setActive = vi.fn(() => Promise.resolve());
      host.user = { id: 'user_a', deleteSelfEnabled: true, delete: () => pending.promise };
      host.setActive = setActive;
      host.buildAfterSignOutUrl = () => '/signed-out';
      host.buildAfterMultiSessionSingleSignOutUrl = () => '/switch';
      host.client = { signedInSessions: [] };
      const binding = bindClerk(host);
      const owner = binding.getSnapshot();
      const deleting = owner?.profileActions().danger.delete?.();
      if (retirement === 'binding') {
        binding.dispose();
      } else if (retirement === 'owner') {
        owner?.dispose();
      } else if (retirement === 'instance') {
        host.frontendApi = 'replacement.test';
        emit();
      } else {
        host.session = { id: 'session_b' };
        emit();
        host.session = null;
        emit();
      }
      pending.resolve();
      await deleting;
      expect(setActive).not.toHaveBeenCalled();
      binding.dispose();
    },
  );
});

it('disables incomplete email row capabilities on partial hosts', () => {
  const { host } = fixture();
  host.__internal_environment = policy();
  host.user = {
    id: 'user_a',
    emailAddresses: [{ id: 'email_a', emailAddress: 'a@example.com', verification: { status: 'unverified' } }],
  };
  const binding = bindClerk(host);
  expect(binding.getSnapshot()?.profileActions().email.canManageEmail('email_a')).toBe(false);
  binding.dispose();
});
