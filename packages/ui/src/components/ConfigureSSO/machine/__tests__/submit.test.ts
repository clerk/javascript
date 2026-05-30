import type { EmailAddressResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import type { WizardFacts } from '../../data/deriveFacts';
import type { ConfigureSSOMutations } from '../../data/useConfigureSSOMutations';
import type { ProviderType, WizardStepId } from '../../types';
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
  it('verified email → creates the connection and returns { ok: true }', async () => {
    const mutations = makeMutations();
    const ctx = makeCtx({ facts: { ...baseFacts, isPrimaryEmailVerified: true }, mutations, provider: 'saml_okta' });

    const result = await submitSelectProvider(ctx);

    expect(ctx.setProvider).toHaveBeenCalledWith('saml_okta');
    expect(mutations.createConnection).toHaveBeenCalledWith('saml_okta', ctx.primaryEmailAddress);
    expect(result).toEqual({ ok: true });
  });

  it('unverified email → returns { ok: true } WITHOUT creating the connection', async () => {
    const mutations = makeMutations();
    const ctx = makeCtx({ facts: { ...baseFacts, isPrimaryEmailVerified: false }, mutations, provider: 'saml_custom' });

    const result = await submitSelectProvider(ctx);

    expect(ctx.setProvider).toHaveBeenCalledWith('saml_custom');
    expect(mutations.createConnection).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
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
    const ctx = makeCtx({ facts: { ...baseFacts, isPrimaryEmailVerified: true }, mutations, provider: 'saml_okta' });

    const result = await submitSelectProvider(ctx);

    expect(mutations.createConnection).toHaveBeenCalled();
    expect(result).toEqual({ ok: false, error });
  });
});

describe('submitVerifyDomain', () => {
  it('no connection yet → creates the connection (unverified-path create point) and returns { ok: true }', async () => {
    const mutations = makeMutations();
    const ctx = makeCtx({ facts: { ...baseFacts, hasConnection: false }, mutations, provider: 'saml_okta' });

    const result = await submitVerifyDomain(ctx);

    expect(mutations.createConnection).toHaveBeenCalledWith('saml_okta', ctx.primaryEmailAddress);
    expect(result).toEqual({ ok: true });
  });

  it('connection already exists → does not re-create, returns { ok: true }', async () => {
    const mutations = makeMutations();
    const ctx = makeCtx({ facts: { ...baseFacts, hasConnection: true }, mutations, provider: 'saml_okta' });

    const result = await submitVerifyDomain(ctx);

    expect(mutations.createConnection).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it('create throws → returns { ok: false, error }', async () => {
    const error = new Error('boom');
    const mutations = makeMutations({ createConnection: vi.fn().mockRejectedValue(error) });
    const ctx = makeCtx({
      facts: { ...baseFacts, hasConnection: false },
      mutations,
      provider: 'saml_okta' as ProviderType,
    });

    const result = await submitVerifyDomain(ctx);

    expect(result).toEqual({ ok: false, error });
  });
});
