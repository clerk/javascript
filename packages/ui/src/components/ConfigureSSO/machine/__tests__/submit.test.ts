import type { EmailAddressResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import type { WizardFacts } from '../../data/deriveFacts';
import type { ConfigureSSOMutations } from '../../data/useConfigureSSOMutations';
import type { WizardStepId } from '../../types';
import type { SubmitCtx } from '../submit';
import { submitSelectProvider, submitVerifyDomain } from '../submit';

const baseFacts: WizardFacts = {
  hasConnection: false,
  isPrimaryEmailVerified: false,
  isDomainTakenByOtherOrg: false,
  hasMinimumIdPConfig: false,
  hasSuccessfulTestRun: false,
  isConnectionActive: false,
  provider: undefined,
};

const makeMutations = (overrides: Partial<ConfigureSSOMutations> = {}): ConfigureSSOMutations => ({
  createConnection: vi.fn().mockResolvedValue(undefined),
  updateConnection: vi.fn().mockResolvedValue(undefined),
  setConnectionActive: vi.fn().mockResolvedValue(undefined),
  deleteConnection: vi.fn().mockResolvedValue(undefined),
  createTestRun: vi.fn().mockResolvedValue(undefined as any),
  ...overrides,
});

const makeCtx = (overrides: Partial<SubmitCtx> = {}): SubmitCtx => ({
  facts: baseFacts,
  mutations: makeMutations(),
  nav: { goToStep: vi.fn() as (id: WizardStepId) => void },
  provider: 'saml_okta',
  setProvider: vi.fn(),
  primaryEmailAddress: { emailAddress: 'user@acme.com' } as EmailAddressResource,
  ...overrides,
});

describe('submitSelectProvider', () => {
  it('provider selected → creates the connection and jumps to configure', async () => {
    // Under the new order verify-domain ran first, so the create is
    // unconditional once a provider is chosen. The create flips
    // `facts.hasConnection`, which disables select-provider, so the handler must
    // jump with an explicit `goTo: 'configure'` (a plain NEXT would no-op).
    const mutations = makeMutations();
    const ctx = makeCtx({ mutations, provider: 'saml_okta' });

    const result = await submitSelectProvider(ctx);

    expect(ctx.setProvider).toHaveBeenCalledWith('saml_okta');
    expect(mutations.createConnection).toHaveBeenCalledWith('saml_okta', ctx.primaryEmailAddress);
    expect(result).toEqual({ ok: true, goTo: 'configure' });
  });

  it('always creates regardless of email-verified facts (verify-domain ran first)', async () => {
    // The old isPrimaryEmailVerified branch is dead under the new order: even
    // with the fact false, the create still fires and jumps to configure.
    const mutations = makeMutations();
    const ctx = makeCtx({ facts: { ...baseFacts, isPrimaryEmailVerified: false }, mutations, provider: 'saml_custom' });

    const result = await submitSelectProvider(ctx);

    expect(ctx.setProvider).toHaveBeenCalledWith('saml_custom');
    expect(mutations.createConnection).toHaveBeenCalledWith('saml_custom', ctx.primaryEmailAddress);
    expect(result).toEqual({ ok: true, goTo: 'configure' });
  });

  it('no provider selected → returns { ok: false } without creating or setting provider', async () => {
    const mutations = makeMutations();
    const ctx = makeCtx({ provider: undefined, mutations });

    const result = await submitSelectProvider(ctx);

    expect(result).toEqual({ ok: false });
    expect(ctx.setProvider).not.toHaveBeenCalled();
    expect(mutations.createConnection).not.toHaveBeenCalled();
  });

  it('create throws → returns { ok: false, error }', async () => {
    const error = new Error('boom');
    const mutations = makeMutations({ createConnection: vi.fn().mockRejectedValue(error) });
    const ctx = makeCtx({ mutations, provider: 'saml_okta' });

    const result = await submitSelectProvider(ctx);

    expect(mutations.createConnection).toHaveBeenCalled();
    expect(result).toEqual({ ok: false, error });
  });
});

describe('submitVerifyDomain', () => {
  it('advances without creating (creation deferred to select-provider under the new order)', async () => {
    const mutations = makeMutations();
    const ctx = makeCtx({ mutations, provider: 'saml_okta' });

    const result = await submitVerifyDomain(ctx);

    expect(mutations.createConnection).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });
});
