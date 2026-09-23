import { ClerkAPIResponseError } from '@clerk/shared/error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Clerk } from '../../../clerk';
import { registerWebMcpTools } from '..';

type Tool = {
  name: string;
  inputSchema?: { properties: { method?: { enum: string[] } } };
  execute: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

const createModelContext = () => {
  const tools = new Map<string, Tool>();
  return {
    tools,
    registerTool: vi.fn((tool: Tool, options?: { signal?: AbortSignal }) => {
      tools.set(tool.name, tool);
      options?.signal?.addEventListener('abort', () => tools.delete(tool.name));
      return Promise.resolve();
    }),
  };
};

const createClerk = () => {
  let listener: ((resources: { session: unknown }) => void) | undefined;
  const signIn = {
    status: null as string | null,
    createdSessionId: null as string | null,
    supportedFirstFactors: null as unknown[] | null,
    supportedSecondFactors: null as unknown[] | null,
    firstFactorVerification: { strategy: null as string | null },
    secondFactorVerification: { strategy: null as string | null },
    create: vi.fn(),
    prepareFirstFactor: vi.fn(),
    attemptFirstFactor: vi.fn(),
    prepareSecondFactor: vi.fn(),
    attemptSecondFactor: vi.fn(),
    authenticateWithRedirect: vi.fn(),
    authenticateWithPasskey: vi.fn(),
    createEmailLinkFlow: vi.fn(),
  };
  const clerk = {
    client: { signIn },
    session: null as unknown,
    user: null as unknown,
    organization: null,
    setActive: vi.fn(({ session }: { session?: string }) => {
      if (session) {
        clerk.session = { id: session };
      }
      return Promise.resolve();
    }),
    signOut: vi.fn(),
    addListener: vi.fn((callback: typeof listener) => {
      listener = callback;
      callback?.({ session: clerk.session });
      return () => {};
    }),
    __internal_getOption: vi.fn(() => undefined),
    __internal_environment: {
      displayConfig: { applicationName: 'Acme', signInUrl: 'https://accounts.acme.com/sign-in' },
      organizationSettings: { enabled: true },
      userSettings: {
        attributes: {
          email_address: { used_for_first_factor: true, first_factors: ['email_code', 'email_link'] },
          phone_number: { used_for_first_factor: false, first_factors: ['phone_code'] },
          passkey: { enabled: true },
        },
        authenticatableSocialStrategies: ['oauth_google'],
        enterpriseSSO: { enabled: false },
        instanceIsPasswordBased: true,
      },
    },
  };

  const update = (state: Partial<typeof signIn>) => () => Promise.resolve(Object.assign(signIn, state));
  const signInAs = (user: unknown) => {
    clerk.session = { id: 'sess_1' };
    clerk.user = user;
    listener?.({ session: clerk.session });
  };

  return { clerk, signIn, update, signInAs };
};

describe('registerWebMcpTools', () => {
  let modelContext: ReturnType<typeof createModelContext>;
  let setup: ReturnType<typeof createClerk>;

  const register = async () => {
    registerWebMcpTools(setup.clerk as unknown as Clerk);
    await flush();
  };

  const call = (name: string, input: Record<string, unknown> = {}) => {
    const tool = modelContext.tools.get(name);
    if (!tool) {
      throw new Error(`${name} is not registered`);
    }
    return tool.execute(input);
  };

  beforeEach(() => {
    modelContext = createModelContext();
    setup = createClerk();
    Object.defineProperty(document, 'modelContext', { value: modelContext, configurable: true });
  });

  afterEach(() => {
    Reflect.deleteProperty(document, 'modelContext');
    Reflect.deleteProperty(navigator, 'credentials');
  });

  it('does nothing when the browser has no model context', () => {
    Reflect.deleteProperty(document, 'modelContext');

    registerWebMcpTools(setup.clerk as unknown as Clerk);

    expect(setup.clerk.addListener).not.toHaveBeenCalled();
  });

  it('registers the signed-out tools with the sign-in methods the instance accepts', async () => {
    await register();

    expect([...modelContext.tools.keys()]).toEqual(['clerk_get_auth_state', 'clerk_sign_in', 'clerk_submit_code']);
    expect(modelContext.tools.get('clerk_sign_in')?.inputSchema?.properties.method?.enum).toEqual([
      'passkey',
      'oauth_google',
      'email_code',
      'email_link',
      'password',
    ]);
    await expect(call('clerk_get_auth_state')).resolves.toEqual({
      signedIn: false,
      signInMethods: ['passkey', 'oauth_google', 'email_code', 'email_link', 'password'],
    });
  });

  it('swaps to the signed-in tools once a session exists', async () => {
    await register();

    setup.signInAs({ organizationMemberships: [] });
    await flush();

    expect([...modelContext.tools.keys()]).toEqual([
      'clerk_get_auth_state',
      'clerk_switch_organization',
      'clerk_sign_out',
    ]);
  });

  it('signs in with an email code', async () => {
    const { signIn, update } = setup;
    const factor = { strategy: 'email_code', emailAddressId: 'idn_1', safeIdentifier: 'j***@acme.com' };
    signIn.create.mockImplementation(update({ status: 'needs_first_factor', supportedFirstFactors: [factor] }));
    signIn.prepareFirstFactor.mockImplementation(update({ firstFactorVerification: { strategy: 'email_code' } }));
    signIn.attemptFirstFactor.mockImplementation(update({ status: 'complete', createdSessionId: 'sess_1' }));
    await register();

    await expect(call('clerk_sign_in', { method: 'email_code', identifier: 'jane@acme.com' })).resolves.toEqual({
      status: 'needs_code',
      sentTo: 'j***@acme.com',
      next: 'clerk_submit_code',
    });
    expect(signIn.create).toHaveBeenCalledWith({ identifier: 'jane@acme.com' });
    expect(signIn.prepareFirstFactor).toHaveBeenCalledWith(factor);

    await expect(call('clerk_submit_code', { code: '424242' })).resolves.toEqual({ status: 'signed_in' });
    expect(signIn.attemptFirstFactor).toHaveBeenCalledWith({ strategy: 'email_code', code: '424242' });
    expect(setup.clerk.setActive).toHaveBeenCalledWith({ session: 'sess_1' });
  });

  it('asks for an authenticator app code when the account has MFA', async () => {
    const { signIn, update } = setup;
    signIn.status = 'needs_first_factor';
    signIn.firstFactorVerification.strategy = 'email_code';
    signIn.attemptFirstFactor.mockImplementation(
      update({
        status: 'needs_second_factor',
        supportedSecondFactors: [{ strategy: 'phone_code', safeIdentifier: '+1***' }, { strategy: 'totp' }],
      }),
    );
    signIn.attemptSecondFactor.mockImplementation(update({ status: 'complete', createdSessionId: 'sess_1' }));
    await register();

    await expect(call('clerk_submit_code', { code: '424242' })).resolves.toEqual({
      status: 'needs_code',
      codeFrom: 'authenticator_app',
      next: 'clerk_submit_code',
    });
    expect(signIn.prepareSecondFactor).not.toHaveBeenCalled();

    await expect(call('clerk_submit_code', { code: '123456' })).resolves.toEqual({ status: 'signed_in' });
    expect(signIn.attemptSecondFactor).toHaveBeenCalledWith({ strategy: 'totp', code: '123456' });
  });

  it('sends a code when the sign-in needs a new-device check', async () => {
    const { signIn, update } = setup;
    const factor = { strategy: 'email_code', emailAddressId: 'idn_1', safeIdentifier: 'j***@acme.com' };
    signIn.authenticateWithPasskey.mockImplementation(
      update({ status: 'needs_client_trust', supportedSecondFactors: [factor] }),
    );
    await register();

    await expect(call('clerk_sign_in', { method: 'passkey' })).resolves.toEqual({
      status: 'needs_code',
      sentTo: 'j***@acme.com',
      next: 'clerk_submit_code',
    });
    expect(signIn.authenticateWithPasskey).toHaveBeenCalledWith({ flow: 'discoverable' });
    expect(signIn.prepareSecondFactor).toHaveBeenCalledWith(factor);
  });

  it('redirects to the provider for OAuth and comes back to the current page', async () => {
    await register();

    await expect(call('clerk_sign_in', { method: 'oauth_google' })).resolves.toEqual({
      status: 'redirecting',
      next: 'clerk_get_auth_state',
    });
    expect(setup.signIn.authenticateWithRedirect).toHaveBeenCalledWith({
      strategy: 'oauth_google',
      identifier: undefined,
      redirectUrl: 'https://accounts.acme.com/sign-in#/sso-callback',
      redirectUrlComplete: window.location.href,
    });
  });

  it('signs in with a saved password without returning it', async () => {
    const get = vi.fn().mockResolvedValue({ id: 'jane@acme.com', password: 'hunter2' });
    Object.defineProperty(navigator, 'credentials', { value: { get }, configurable: true });
    setup.signIn.create.mockImplementation(setup.update({ status: 'complete', createdSessionId: 'sess_1' }));
    await register();

    const result = await call('clerk_sign_in', { method: 'password' });

    expect(result).toEqual({ status: 'signed_in' });
    expect(JSON.stringify(result)).not.toContain('hunter2');
    expect(get).toHaveBeenCalledWith({ password: true, mediation: 'required' });
    expect(setup.signIn.create).toHaveBeenCalledWith({
      strategy: 'password',
      identifier: 'jane@acme.com',
      password: 'hunter2',
    });
  });

  it('rejects methods the instance has not enabled', async () => {
    await register();

    await expect(call('clerk_sign_in', { method: 'phone_code', identifier: '+15555550100' })).resolves.toMatchObject({
      status: 'error',
    });
    expect(setup.signIn.create).not.toHaveBeenCalled();
  });

  it('returns Clerk API errors to the agent', async () => {
    const { signIn } = setup;
    signIn.status = 'needs_first_factor';
    signIn.firstFactorVerification.strategy = 'email_code';
    signIn.attemptFirstFactor.mockRejectedValue(
      new ClerkAPIResponseError('Incorrect code', {
        data: [{ code: 'form_code_incorrect', message: 'is incorrect', long_message: 'Incorrect code' }],
        status: 422,
      }),
    );
    await register();

    await expect(call('clerk_submit_code', { code: '000000' })).resolves.toEqual({
      status: 'error',
      code: 'form_code_incorrect',
      message: 'Incorrect code',
    });
  });

  it('only switches to organizations the user belongs to', async () => {
    await register();
    setup.signInAs({
      organizationMemberships: [{ organization: { id: 'org_1', slug: 'acme', name: 'Acme' }, role: 'org:admin' }],
    });
    await flush();

    await expect(call('clerk_switch_organization', { organization: 'globex' })).resolves.toMatchObject({
      status: 'error',
    });
    expect(setup.clerk.setActive).not.toHaveBeenCalled();

    await call('clerk_switch_organization', { organization: 'acme' });
    expect(setup.clerk.setActive).toHaveBeenCalledWith({ organization: 'org_1' });
  });
});
