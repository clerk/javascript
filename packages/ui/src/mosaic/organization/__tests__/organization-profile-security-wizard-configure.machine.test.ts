import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { tick } from '../../machines/__tests__/test-utils';
import type { OrganizationProfileSecurityWizardConfigureContext } from '../organization-profile-security-wizard-configure.machine';
import {
  CONFIGURE_PROVIDER_STEPS,
  organizationProfileSecurityWizardConfigureMachine,
  SAML_SUBMIT_STEP_ID,
} from '../organization-profile-security-wizard-configure.machine';

// Ordered inner SAML steps per provider (matches the controller's PROVIDER_STEPS). Okta submits at
// its terminal step; Google submits mid-flow (index 1 of 5).
const OKTA_STEPS = ['create-app', 'attribute-mapping', 'assign-users', 'identity-provider-metadata'];
const GOOGLE_STEPS = [
  'create-app',
  'identity-provider-metadata',
  'service-provider',
  'attribute-mapping',
  'configure-user-access',
];

function start(context: Partial<OrganizationProfileSecurityWizardConfigureContext> = {}) {
  const createConnection = vi.fn(() => Promise.resolve());
  const changeProvider = vi.fn(() => Promise.resolve());
  const updateConnection = vi.fn(() => Promise.resolve());
  const actor = createActor(organizationProfileSecurityWizardConfigureMachine, {
    context: { createConnection, changeProvider, updateConnection, ...context },
  });
  actor.start();
  return { actor, createConnection, changeProvider, updateConnection };
}

describe('organizationProfileSecurityWizardConfigureMachine — select provider', () => {
  it('seeds at selecting with no connection', () => {
    const { actor } = start({ hasConnection: false });
    expect(actor.getSnapshot().value).toBe('selecting');
  });

  it('creates a connection, then defers the advance until the fresh hasConnection lands', async () => {
    const { actor, createConnection } = start({ hasConnection: false, providerSteps: OKTA_STEPS, submitIndex: 3 });

    actor.send({ type: 'CREATE', provider: 'saml_okta' });
    expect(actor.getSnapshot().value).toBe('creatingConnection');
    expect(createConnection).toHaveBeenCalledWith('saml_okta');

    // createConnection resolves, but hasConnection is still stale-false: the advance parks and the
    // Continue spinner stays on (legacy middle-wizard deferral).
    await tick();
    expect(actor.getSnapshot().value).toBe('creatingConnection');

    // The controller reseats the fresh connection data and rechecks — now the advance completes.
    actor.setContext({ hasConnection: true });
    actor.recheck();

    expect(actor.getSnapshot().value).toBe('configuring');
    expect(actor.getSnapshot().context.stepIndex).toBe(0);
  });

  it('advances immediately when hasConnection is already warm at create time', async () => {
    const { actor } = start({ hasConnection: true, providerSteps: OKTA_STEPS, submitIndex: 3 });
    actor.send({ type: 'ENTER', forward: true });

    actor.send({ type: 'CREATE', provider: 'saml_okta' });
    await tick();

    expect(actor.getSnapshot().value).toBe('configuring');
  });

  it('surfaces the error and stays on select-provider when create fails', async () => {
    const createConnection = vi.fn(() => Promise.reject(new Error('Provider unavailable')));
    const { actor } = start({ hasConnection: false, createConnection });

    actor.send({ type: 'CREATE', provider: 'saml_okta' });
    await tick();

    expect(actor.getSnapshot().value).toBe('selecting');
    expect(actor.getSnapshot().context.error).toBe('Provider unavailable');
  });

  it('changes the provider and enters the SAML sub-flow', async () => {
    const { actor, changeProvider } = start({ hasConnection: true, providerSteps: OKTA_STEPS, submitIndex: 3 });

    // Force select-provider first (a resume seeds configuring).
    actor.send({ type: 'ENTER', forward: true });
    expect(actor.getSnapshot().value).toBe('selecting');

    actor.send({ type: 'CHANGE', provider: 'saml_google' });
    expect(changeProvider).toHaveBeenCalledWith('saml_google');

    await tick();

    expect(actor.getSnapshot().value).toBe('configuring');
  });

  it('defers the change advance until the fresh hasConnection lands (non-atomic delete+create swap)', async () => {
    const { actor, changeProvider } = start({ hasConnection: true, providerSteps: OKTA_STEPS, submitIndex: 3 });
    actor.send({ type: 'ENTER', forward: true });

    actor.send({ type: 'CHANGE', provider: 'saml_google' });
    expect(changeProvider).toHaveBeenCalledWith('saml_google');

    // changeProvider deletes the old connection before creating the new one, so
    // hasConnection is transiently false when it resolves — the advance parks and the
    // Continue spinner stays on, exactly like the create path's revalidation race.
    actor.setContext({ hasConnection: false });
    await tick();
    expect(actor.getSnapshot().value).toBe('changingProvider');
    expect(actor.getSnapshot().context.pendingEnter).toBe(true);

    // The revalidate lands with the new connection; recheck completes the parked advance.
    actor.setContext({ hasConnection: true });
    actor.recheck();
    expect(actor.getSnapshot().value).toBe('configuring');
    expect(actor.getSnapshot().context.pendingEnter).toBe(false);
  });

  it('skips straight into the SAML sub-flow for the same provider', () => {
    const { actor, createConnection, changeProvider } = start({ hasConnection: true });
    actor.send({ type: 'ENTER', forward: true });

    actor.send({ type: 'SKIP' });

    expect(actor.getSnapshot().value).toBe('configuring');
    expect(createConnection).not.toHaveBeenCalled();
    expect(changeProvider).not.toHaveBeenCalled();
  });
});

describe('organizationProfileSecurityWizardConfigureMachine — entry re-seat', () => {
  it('forces select-provider on forward entry even with a connection', () => {
    const { actor } = start({ hasConnection: true });
    actor.send({ type: 'ENTER', forward: true });
    expect(actor.getSnapshot().value).toBe('selecting');
  });

  it('resumes into the SAML sub-flow on non-forward entry with a connection', () => {
    const { actor } = start({ hasConnection: true, providerSteps: OKTA_STEPS, submitIndex: 3, stepIndex: 2 });
    actor.send({ type: 'ENTER', forward: false });
    expect(actor.getSnapshot().value).toBe('configuring');
    // Re-entry always resets the inner step to 0 (legacy remounts the SAML wizard fresh).
    expect(actor.getSnapshot().context.stepIndex).toBe(0);
  });

  it('re-seats to select-provider when the connection is deleted underneath (recheck)', () => {
    const { actor } = start({ hasConnection: true, providerSteps: OKTA_STEPS, submitIndex: 3 });
    actor.send({ type: 'SKIP' });
    expect(actor.getSnapshot().value).toBe('configuring');

    actor.setContext({ hasConnection: false });
    actor.recheck();

    expect(actor.getSnapshot().value).toBe('selecting');
  });
});

describe('organizationProfileSecurityWizardConfigureMachine — inner navigation', () => {
  it('advances and retreats within the inner SAML steps', () => {
    const { actor } = start({ hasConnection: true, providerSteps: OKTA_STEPS, submitIndex: 3 });
    actor.send({ type: 'SKIP' });

    actor.send({ type: 'NEXT_INNER' });
    expect(actor.getSnapshot().context.stepIndex).toBe(1);

    actor.send({ type: 'PREV_INNER' });
    expect(actor.getSnapshot().context.stepIndex).toBe(0);
  });

  it('backs out to select-provider from the first inner step', () => {
    const { actor } = start({ hasConnection: true, providerSteps: OKTA_STEPS, submitIndex: 3 });
    actor.send({ type: 'SKIP' });

    actor.send({ type: 'PREV_INNER' });
    expect(actor.getSnapshot().value).toBe('selecting');
  });
});

describe('organizationProfileSecurityWizardConfigureMachine — save + bubble', () => {
  it('bubbles to the parent when the terminal step saves (Okta)', async () => {
    const { actor, updateConnection } = start({
      hasConnection: true,
      providerSteps: OKTA_STEPS,
      submitIndex: 3,
    });
    actor.send({ type: 'SKIP' });
    // Walk to the terminal submit step.
    actor.send({ type: 'NEXT_INNER' });
    actor.send({ type: 'NEXT_INNER' });
    actor.send({ type: 'NEXT_INNER' });
    expect(actor.getSnapshot().context.stepIndex).toBe(3);

    actor.send({ type: 'SAVE', payload: { idpMetadataUrl: 'https://idp.example.com/metadata' } });
    expect(actor.getSnapshot().value).toBe('saving');
    expect(updateConnection).toHaveBeenCalledWith({ idpMetadataUrl: 'https://idp.example.com/metadata' });

    await tick();

    expect(actor.getSnapshot().value).toBe('bubblingNext');
  });

  it('advances to the next inner step when a mid-flow step saves (Google)', async () => {
    const { actor } = start({ hasConnection: true, providerSteps: GOOGLE_STEPS, submitIndex: 1 });
    actor.send({ type: 'SKIP' });
    actor.send({ type: 'NEXT_INNER' });
    expect(actor.getSnapshot().context.stepIndex).toBe(1);

    actor.send({ type: 'SAVE', payload: { idpMetadataUrl: 'https://idp.example.com/metadata' } });
    await tick();

    expect(actor.getSnapshot().value).toBe('configuring');
    expect(actor.getSnapshot().context.stepIndex).toBe(2);
  });

  it('returns to the step with an error when a save fails', async () => {
    const updateConnection = vi.fn(() => Promise.reject(new Error('Invalid metadata URL')));
    const { actor } = start({ hasConnection: true, providerSteps: OKTA_STEPS, submitIndex: 3, updateConnection });
    actor.send({ type: 'SKIP' });
    actor.send({ type: 'NEXT_INNER' });
    actor.send({ type: 'NEXT_INNER' });
    actor.send({ type: 'NEXT_INNER' });

    actor.send({ type: 'SAVE', payload: {} });
    await tick();

    expect(actor.getSnapshot().value).toBe('configuring');
    expect(actor.getSnapshot().context.stepIndex).toBe(3);
    expect(actor.getSnapshot().context.error).toBe('Invalid metadata URL');
  });
});

describe('organizationProfileSecurityWizardConfigureMachine — per-provider save terminal (all 4 providers, 1:1 with legacy STEPS_BY_PROVIDER)', () => {
  // Transcribed verbatim from the legacy per-provider step arrays; the submit step is always
  // `identity-provider-metadata` — terminal for Okta/Custom/Microsoft, mid-flow (index 1 of 5) for Google:
  //   SamlOktaConfigureSteps.tsx:39-44, SamlCustomConfigureSteps.tsx:38-43,
  //   SamlMicrosoftConfigureSteps.tsx:47-52, SamlGoogleConfigureSteps.tsx:26-32.
  const PROVIDERS = [
    { name: 'okta', steps: CONFIGURE_PROVIDER_STEPS.saml_okta, terminal: true },
    { name: 'custom', steps: CONFIGURE_PROVIDER_STEPS.saml_custom, terminal: true },
    { name: 'microsoft', steps: CONFIGURE_PROVIDER_STEPS.saml_microsoft, terminal: true },
    { name: 'google', steps: CONFIGURE_PROVIDER_STEPS.saml_google, terminal: false },
  ] as const;

  it.each(PROVIDERS)(
    '$name: saving at its submit step bubbles (terminal) or advances one inner slot (mid-flow) exactly as legacy',
    async ({ steps, terminal }) => {
      const submitIndex = steps.indexOf(SAML_SUBMIT_STEP_ID);
      const { actor, updateConnection } = start({ hasConnection: true, providerSteps: [...steps], submitIndex });
      actor.send({ type: 'SKIP' });

      // Walk the inner SAML steps up to the submit step.
      for (let i = 0; i < submitIndex; i++) {
        actor.send({ type: 'NEXT_INNER' });
      }
      expect(actor.getSnapshot().context.stepIndex).toBe(submitIndex);

      actor.send({ type: 'SAVE', payload: { idpMetadataUrl: 'https://idp.example.com/metadata' } });
      await tick();
      expect(updateConnection).toHaveBeenCalledTimes(1);

      if (terminal) {
        // Advancing off the end IS the bubble to the outer wizard's `test` step.
        expect(actor.getSnapshot().value).toBe('bubblingNext');
      } else {
        // Google submits mid-flow: advance to the next inner step; the later terminal
        // step's plain Continue is the view-forwarded bubble.
        expect(actor.getSnapshot().value).toBe('configuring');
        expect(actor.getSnapshot().context.stepIndex).toBe(submitIndex + 1);
      }
    },
  );

  it('the ported CONFIGURE_PROVIDER_STEPS + submit step match the legacy per-provider arrays 1:1', () => {
    expect(CONFIGURE_PROVIDER_STEPS.saml_okta).toEqual([
      'create-app',
      'attribute-mapping',
      'assign-users',
      'identity-provider-metadata',
    ]);
    expect(CONFIGURE_PROVIDER_STEPS.saml_custom).toEqual([
      'create-app',
      'attribute-mapping',
      'assign-users',
      'identity-provider-metadata',
    ]);
    expect(CONFIGURE_PROVIDER_STEPS.saml_microsoft).toEqual([
      'create-app',
      'service-provider',
      'attribute-mapping',
      'identity-provider-metadata',
    ]);
    expect(CONFIGURE_PROVIDER_STEPS.saml_google).toEqual([
      'create-app',
      'identity-provider-metadata',
      'service-provider',
      'attribute-mapping',
      'configure-user-access',
    ]);
    // Terminal submit for all but Google (index 1 of 5).
    expect(CONFIGURE_PROVIDER_STEPS.saml_okta.indexOf(SAML_SUBMIT_STEP_ID)).toBe(3);
    expect(CONFIGURE_PROVIDER_STEPS.saml_custom.indexOf(SAML_SUBMIT_STEP_ID)).toBe(3);
    expect(CONFIGURE_PROVIDER_STEPS.saml_microsoft.indexOf(SAML_SUBMIT_STEP_ID)).toBe(3);
    expect(CONFIGURE_PROVIDER_STEPS.saml_google.indexOf(SAML_SUBMIT_STEP_ID)).toBe(1);
  });
});
