import type * as SharedReact from '@clerk/shared/react';
import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { PreferredSignInStrategy, SessionVerificationResource } from '@clerk/shared/types';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useReverificationModel, type ReverificationModel, type ReverificationReadyModel } from '../reverification.model';

function ready(model: ReverificationModel): ReverificationReadyModel {
  expect(model.status).toBe('ready');
  if (model.status !== 'ready') {
    throw new Error('expected ready');
  }
  return model;
}

let session: {
  id: string;
  startVerification: ReturnType<typeof vi.fn>;
  prepareFirstFactorVerification: ReturnType<typeof vi.fn>;
  prepareSecondFactorVerification: ReturnType<typeof vi.fn>;
  attemptFirstFactorVerification: ReturnType<typeof vi.fn>;
  attemptSecondFactorVerification: ReturnType<typeof vi.fn>;
  verifyWithPasskey: ReturnType<typeof vi.fn>;
} | null | undefined;
let environmentHydrated: boolean;
let preferredSignInStrategy: PreferredSignInStrategy;
let supportEmail: string;
let webAuthnSupported: boolean;
let setActive: ReturnType<typeof vi.fn>;

function environment() {
  return environmentHydrated
    ? { displayConfig: { preferredSignInStrategy, supportEmail } }
    : undefined;
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

function activeProps() {
  return {
    isActive: true as const,
    complete: vi.fn(),
    cancel: vi.fn(),
    level: 'first_factor' as const,
  };
}

describe('useReverificationModel', () => {
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
    supportEmail = 'support@example.com';
    webAuthnSupported = true;
    setActive = vi.fn().mockResolvedValue(undefined);
  });

  it('is loading until the session and environment are both present', () => {
    session = null;
    const { result } = renderHook(() => useReverificationModel(activeProps()));
    expect(result.current.status).toBe('loading');
    expect(result.current.isActive).toBe(true);
  });

  it('is active when props are active', () => {
    const { result } = renderHook(() => useReverificationModel(activeProps()));
    expect(result.current.isActive).toBe(true);
  });

  it('is inactive when props are idle', () => {
    const { result } = renderHook(() => useReverificationModel({ isActive: false }));
    expect(result.current.isActive).toBe(false);
  });

  it('maps first-factor strategies and drops enterprise_sso and passkey without WebAuthn', async () => {
    webAuthnSupported = false;
    session?.startVerification.mockResolvedValue(
      resource({
        supportedFirstFactors: [
          { strategy: 'password' },
          { strategy: 'passkey' },
          { strategy: 'email_code', emailAddressId: 'idn_1', safeIdentifier: 'a***@ex.com' },
          { strategy: 'enterprise_sso', emailAddressId: 'idn_2', enterpriseConnectionId: 'ec_1', safeIdentifier: 'sso' },
        ],
      }),
    );

    const { result } = renderHook(() => useReverificationModel(activeProps()));
    const started = await ready(result.current).start();

    expect(session?.startVerification).toHaveBeenCalledWith({ level: 'first_factor' });
    expect(started.methods.map(method => method.strategy)).toEqual(['password', 'email_code']);
    expect(started.startingMethod?.strategy).toBe('password');
    expect(started.methods.find(method => method.strategy === 'email_code')).toEqual({
      id: 'email_code:idn_1',
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

    const { result } = renderHook(() => useReverificationModel(activeProps()));
    const started = await ready(result.current).start();
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

    const { result } = renderHook(() => useReverificationModel({ ...activeProps(), level: 'second_factor' }));
    const started = await ready(result.current).start();
    expect(started.status).toBe('needs_second_factor');
    expect(started.startingMethod?.strategy).toBe('totp');
  });

  it('prepares and attempts with the Clerk param shape for the active method', async () => {
    session?.startVerification.mockResolvedValue(resource());
    session?.prepareFirstFactorVerification.mockResolvedValue(resource());
    session?.attemptFirstFactorVerification.mockResolvedValue(resource({ status: 'complete' }));

    const { result } = renderHook(() => useReverificationModel(activeProps()));
    await ready(result.current).start();
    await ready(result.current).prepare(
      {
        id: 'email_code:idn_1',
        strategy: 'email_code',
        identifier: 'a***@ex.com',
        emailAddressId: 'idn_1',
      },
      'needs_first_factor',
    );
    expect(session?.prepareFirstFactorVerification).toHaveBeenCalledWith({
      strategy: 'email_code',
      emailAddressId: 'idn_1',
    });

    await ready(result.current).attempt({ id: 'password', strategy: 'password' }, 'secret', 'needs_first_factor');
    expect(session?.attemptFirstFactorVerification).toHaveBeenCalledWith({
      strategy: 'password',
      password: 'secret',
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

    const { result } = renderHook(() => useReverificationModel({ ...activeProps(), level: 'second_factor' }));
    await ready(result.current).start();
    await ready(result.current).prepare(
      { id: 'phone_code:pn_1', strategy: 'phone_code', phoneNumberId: 'pn_1' },
      'needs_second_factor',
    );
    expect(session?.prepareSecondFactorVerification).toHaveBeenCalledWith({
      strategy: 'phone_code',
      phoneNumberId: 'pn_1',
    });

    await ready(result.current).attempt({ id: 'totp', strategy: 'totp' }, '123456', 'needs_second_factor');
    expect(session?.attemptSecondFactorVerification).toHaveBeenCalledWith({ strategy: 'totp', code: '123456' });
  });

  it('rewrites Clerk API errors to plain Error messages', async () => {
    session?.attemptFirstFactorVerification.mockRejectedValue(
      new ClerkAPIResponseError('nope', {
        data: [
          { code: 'form_password_incorrect', message: 'Incorrect password', long_message: 'That password is incorrect.' },
        ],
        status: 422,
      }),
    );

    const { result } = renderHook(() => useReverificationModel(activeProps()));
    await expect(
      ready(result.current).attempt({ id: 'password', strategy: 'password' }, 'bad', 'needs_first_factor'),
    ).rejects.toThrow(
      'That password is incorrect.',
    );
  });

  it('activates the verified session and calls complete', async () => {
    session?.startVerification.mockResolvedValue(resource({ status: 'complete' }));
    const props = activeProps();
    const { result } = renderHook(() => useReverificationModel(props));
    await ready(result.current).start();
    await ready(result.current).finish();
    expect(setActive).toHaveBeenCalledWith({ session: 'sess_1' });
    expect(props.complete).toHaveBeenCalledOnce();
  });
});
