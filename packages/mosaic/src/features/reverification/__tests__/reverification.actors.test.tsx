import { ClerkAPIResponseError } from '@clerk/shared/error';
import type * as SharedReact from '@clerk/shared/react';
import type { PreferredSignInStrategy, SessionVerificationResource } from '@clerk/shared/types';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useReverificationActors } from '../reverification.actors';

let session:
  | {
      id: string;
      startVerification: ReturnType<typeof vi.fn>;
      prepareFirstFactorVerification: ReturnType<typeof vi.fn>;
      prepareSecondFactorVerification: ReturnType<typeof vi.fn>;
      attemptFirstFactorVerification: ReturnType<typeof vi.fn>;
      attemptSecondFactorVerification: ReturnType<typeof vi.fn>;
      verifyWithPasskey: ReturnType<typeof vi.fn>;
    }
  | null
  | undefined;
let environmentHydrated: boolean;
let preferredSignInStrategy: PreferredSignInStrategy;
let webAuthnSupported: boolean;
let setActive: ReturnType<typeof vi.fn>;

function environment() {
  return environmentHydrated ? { displayConfig: { preferredSignInStrategy } } : undefined;
}

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useSession: () => ({ session }),
    useClerk: () => ({ setActive }),
  };
});

vi.mock('../../../hooks/useMosaicEnvironment', () => ({
  useMosaicEnvironment: () => environment(),
}));

vi.mock('@clerk/shared/webauthn', () => ({
  isWebAuthnSupported: () => webAuthnSupported,
}));

function resource(overrides: Partial<SessionVerificationResource> = {}): SessionVerificationResource {
  return {
    status: 'needs_first_factor',
    level: 'first_factor',
    session: { id: 'sess_1' },
    supportedFirstFactors: [{ strategy: 'password' }],
    supportedSecondFactors: null,
    ...overrides,
  } as SessionVerificationResource;
}

describe('useReverificationActors', () => {
  beforeEach(() => {
    session = {
      id: 'sess_1',
      startVerification: vi.fn(),
      prepareFirstFactorVerification: vi.fn(),
      prepareSecondFactorVerification: vi.fn(),
      attemptFirstFactorVerification: vi.fn(),
      attemptSecondFactorVerification: vi.fn(),
      verifyWithPasskey: vi.fn(),
    };
    environmentHydrated = true;
    preferredSignInStrategy = 'password';
    webAuthnSupported = true;
    setActive = vi.fn().mockResolvedValue(undefined);
  });

  it('defaults to second-factor verification when no level is provided', async () => {
    session?.startVerification.mockResolvedValue(resource());
    const { result } = renderHook(() => useReverificationActors());

    await result.current.actors.startVerification(undefined);

    expect(session?.startVerification).toHaveBeenCalledWith({ level: 'second_factor' });
  });

  it('maps first-factor strategies and drops enterprise_sso and passkey without WebAuthn', async () => {
    webAuthnSupported = false;
    session?.startVerification.mockResolvedValue(
      resource({
        supportedFirstFactors: [
          { strategy: 'password' },
          { strategy: 'passkey' },
          { strategy: 'email_code', emailAddressId: 'idn_1', safeIdentifier: 'a***@ex.com' },
          {
            strategy: 'enterprise_sso',
            emailAddressId: 'idn_2',
            enterpriseConnectionId: 'ec_1',
            safeIdentifier: 'sso',
          },
        ],
      }),
    );

    const { result } = renderHook(() => useReverificationActors());
    const started = await result.current.actors.startVerification('first_factor');

    expect(session?.startVerification).toHaveBeenCalledWith({ level: 'first_factor' });
    expect(started.methods.map(method => method.strategy)).toEqual(['password', 'email_code']);
    expect(started.startingMethod?.strategy).toBe('password');
    expect(started.methods.find(method => method.strategy === 'email_code')).toEqual({
      id: 'email_code:idn_1',
      stage: 'first',
      strategy: 'email_code',
      identifier: 'a***@ex.com',
      emailAddressId: 'idn_1',
    });
  });

  it('prefers passkey when WebAuthn is available', async () => {
    session?.startVerification.mockResolvedValue(
      resource({
        supportedFirstFactors: [{ strategy: 'password' }, { strategy: 'passkey' }],
      }),
    );

    const { result } = renderHook(() => useReverificationActors());
    const started = await result.current.actors.startVerification('first_factor');
    expect(started.startingMethod?.strategy).toBe('passkey');
  });

  it('starts second factor on totp then phone then the first remaining method', async () => {
    session?.startVerification.mockResolvedValue(
      resource({
        status: 'needs_second_factor',
        supportedFirstFactors: null,
        supportedSecondFactors: [
          { strategy: 'backup_code' },
          { strategy: 'phone_code', phoneNumberId: 'pn_1', safeIdentifier: '+1••••1' },
          { strategy: 'totp' },
        ],
      }),
    );

    const { result } = renderHook(() => useReverificationActors());
    const started = await result.current.actors.startVerification('second_factor');
    expect(started.status).toBe('needs_second_factor');
    expect(started.startingMethod).toEqual({ id: 'totp', stage: 'second', strategy: 'totp' });
    expect(started.methods.find(method => method.strategy === 'phone_code')).toEqual({
      id: 'phone_code:pn_1',
      stage: 'second',
      strategy: 'phone_code',
      identifier: '+1••••1',
      phoneNumberId: 'pn_1',
    });
  });

  it('prepares and attempts with the Clerk param shape for the active method', async () => {
    session?.startVerification.mockResolvedValue(resource());
    session?.prepareFirstFactorVerification.mockResolvedValue(resource());
    session?.attemptFirstFactorVerification.mockResolvedValue(resource({ status: 'complete' }));

    const { result } = renderHook(() => useReverificationActors());
    await result.current.actors.startVerification('first_factor');
    await result.current.actors.prepareFactor({
      id: 'email_code:idn_1',
      stage: 'first',
      strategy: 'email_code',
      identifier: 'a***@ex.com',
      emailAddressId: 'idn_1',
    });
    expect(session?.prepareFirstFactorVerification).toHaveBeenCalledWith({
      strategy: 'email_code',
      emailAddressId: 'idn_1',
    });

    await result.current.actors.attemptFactor({
      method: { id: 'password', stage: 'first', strategy: 'password' },
      value: 'secret',
    });
    expect(session?.attemptFirstFactorVerification).toHaveBeenCalledWith({
      strategy: 'password',
      password: 'secret',
    });

    await result.current.actors.prepareFactor({
      id: 'phone_code:pn_1',
      stage: 'first',
      strategy: 'phone_code',
      phoneNumberId: 'pn_1',
      identifier: '+1••••1',
    });
    expect(session?.prepareFirstFactorVerification).toHaveBeenCalledWith({
      strategy: 'phone_code',
      phoneNumberId: 'pn_1',
    });
  });

  it('prepares second-factor phone codes and attempts totp against the second-factor API', async () => {
    session?.startVerification.mockResolvedValue(
      resource({
        status: 'needs_second_factor',
        supportedFirstFactors: null,
        supportedSecondFactors: [{ strategy: 'totp' }, { strategy: 'phone_code', phoneNumberId: 'pn_1' }],
      }),
    );
    session?.prepareSecondFactorVerification.mockResolvedValue(resource({ status: 'needs_second_factor' }));
    session?.attemptSecondFactorVerification.mockResolvedValue(resource({ status: 'complete' }));

    const { result } = renderHook(() => useReverificationActors());
    await result.current.actors.startVerification('second_factor');
    await result.current.actors.prepareFactor({
      id: 'phone_code:pn_1',
      stage: 'second',
      strategy: 'phone_code',
      phoneNumberId: 'pn_1',
      identifier: '+1••••1',
    });
    expect(session?.prepareSecondFactorVerification).toHaveBeenCalledWith({
      strategy: 'phone_code',
      phoneNumberId: 'pn_1',
    });

    await result.current.actors.attemptFactor({
      method: { id: 'totp', stage: 'second', strategy: 'totp' },
      value: '123456',
    });
    expect(session?.attemptSecondFactorVerification).toHaveBeenCalledWith({ strategy: 'totp', code: '123456' });
  });

  it('verifies a passkey', async () => {
    session?.verifyWithPasskey.mockResolvedValue(resource({ status: 'complete' }));
    const { result } = renderHook(() => useReverificationActors());

    await result.current.actors.attemptFactor({
      method: { id: 'passkey', stage: 'first', strategy: 'passkey' },
      value: '',
    });
    expect(session?.verifyWithPasskey).toHaveBeenCalledOnce();
  });

  it('rewrites Clerk API errors to plain Error messages', async () => {
    session?.attemptFirstFactorVerification.mockRejectedValue(
      new ClerkAPIResponseError('nope', {
        data: [
          {
            code: 'form_password_incorrect',
            message: 'Incorrect password',
            long_message: 'That password is incorrect.',
          },
        ],
        status: 422,
      }),
    );

    const { result } = renderHook(() => useReverificationActors());
    await expect(
      result.current.actors.attemptFactor({
        method: { id: 'password', stage: 'first', strategy: 'password' },
        value: 'bad',
      }),
    ).rejects.toMatchObject({ message: 'That password is incorrect.' });
  });

  it('activates the verified session to finish', async () => {
    const { result } = renderHook(() => useReverificationActors());

    await result.current.actors.finishVerification();

    expect(setActive).toHaveBeenCalledWith({ session: 'sess_1' });
  });

  it('rewrites a failed setActive to a plain Error', async () => {
    setActive.mockRejectedValue(new Error('Session could not be activated.'));
    const { result } = renderHook(() => useReverificationActors());

    await expect(result.current.actors.finishVerification()).rejects.toMatchObject({
      message: 'Session could not be activated.',
    });
  });

  it('fails verification when there is no session', async () => {
    session = null;
    const { result } = renderHook(() => useReverificationActors());

    await expect(result.current.actors.startVerification(undefined)).rejects.toBeInstanceOf(Error);
    expect(result.current.sessionId).toBeNull();
  });

  it('reports an unloaded session as undefined', () => {
    session = undefined;
    const { result } = renderHook(() => useReverificationActors());

    expect(result.current.sessionId).toBeUndefined();
  });
});
