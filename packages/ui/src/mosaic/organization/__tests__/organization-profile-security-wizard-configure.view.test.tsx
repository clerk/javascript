import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Snapshot } from '../../machine/types';
import { MosaicProvider } from '../../MosaicProvider';
import type { OrganizationProfileSecurityWizardConfigureStep } from '../organization-profile-security-panel.controller';
import type { OrganizationProfileSecurityWizardConfigureContext } from '../organization-profile-security-wizard-configure.machine';
import { OrganizationProfileSecurityWizardConfigureView } from '../organization-profile-security-wizard-configure.view';

const OKTA_STEPS = ['create-app', 'attribute-mapping', 'assign-users', 'identity-provider-metadata'];

const snapshot = (
  value: string,
  context: Partial<OrganizationProfileSecurityWizardConfigureContext> = {},
): Snapshot<OrganizationProfileSecurityWizardConfigureContext> => ({
  value,
  status: 'active',
  context: {
    providerSteps: [],
    submitIndex: -1,
    stepIndex: 0,
    direction: 0,
    hasConnection: false,
    error: null,
    pendingEnter: false,
    pendingProvider: null,
    pendingPayload: {},
    createConnection: async () => {},
    changeProvider: async () => {},
    updateConnection: async () => {},
    ...context,
  },
});

function renderView(overrides: Partial<OrganizationProfileSecurityWizardConfigureStep> = {}) {
  const send = vi.fn();
  const onParentNext = vi.fn();
  const onParentPrev = vi.fn();

  const configure: OrganizationProfileSecurityWizardConfigureStep = {
    snapshot: snapshot('selecting'),
    send,
    provider: undefined,
    providerSteps: [],
    submitStepId: 'identity-provider-metadata',
    enteredForward: true,
    onParentNext,
    onParentPrev,
    ...overrides,
  };

  render(
    <MosaicProvider>
      <OrganizationProfileSecurityWizardConfigureView configure={configure} />
    </MosaicProvider>,
  );

  return { send, onParentNext, onParentPrev };
}

describe('OrganizationProfileSecurityWizardConfigureView — mount', () => {
  it('fires ENTER once with the entry direction', () => {
    const { send } = renderView({ enteredForward: true });
    expect(send).toHaveBeenCalledWith({ type: 'ENTER', forward: true });
    expect(send.mock.calls.filter(([event]) => event.type === 'ENTER')).toHaveLength(1);
  });
});

describe('OrganizationProfileSecurityWizardConfigureView — select provider', () => {
  it('creates a connection for a fresh selection', () => {
    const { send } = renderView({ provider: undefined });
    fireEvent.click(screen.getByRole('button', { name: 'Okta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(send).toHaveBeenCalledWith({ type: 'CREATE', provider: 'saml_okta' });
  });

  it('skips straight in when the same provider is reselected', () => {
    const { send } = renderView({ provider: 'saml_okta' });
    // saml_okta arrives pre-selected; Continue with the same provider skips.
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(send).toHaveBeenCalledWith({ type: 'SKIP' });
  });

  it('confirms a provider change through the dialog before sending CHANGE', () => {
    const { send } = renderView({ provider: 'saml_okta' });
    fireEvent.click(screen.getByRole('button', { name: 'Google' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // CHANGE is not sent until the dialog is confirmed.
    expect(send).not.toHaveBeenCalledWith({ type: 'CHANGE', provider: 'saml_google' });

    fireEvent.click(screen.getByRole('button', { name: 'Change provider' }));
    expect(send).toHaveBeenCalledWith({ type: 'CHANGE', provider: 'saml_google' });
  });

  it('forwards Back to the outer wizard', () => {
    const { onParentPrev } = renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onParentPrev).toHaveBeenCalled();
  });
});

describe('OrganizationProfileSecurityWizardConfigureView — SAML sub-flow', () => {
  it('advances a non-submit inner step with NEXT_INNER', () => {
    const { send } = renderView({
      snapshot: snapshot('configuring', {
        hasConnection: true,
        providerSteps: OKTA_STEPS,
        submitIndex: 3,
        stepIndex: 0,
      }),
      providerSteps: OKTA_STEPS,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(send).toHaveBeenCalledWith({ type: 'NEXT_INNER' });
  });

  it('submits the metadata URL on the submit step', () => {
    const { send } = renderView({
      snapshot: snapshot('configuring', {
        hasConnection: true,
        providerSteps: OKTA_STEPS,
        submitIndex: 3,
        stepIndex: 3,
      }),
      providerSteps: OKTA_STEPS,
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Identity provider metadata URL' }), {
      target: { value: 'https://idp.example.com/metadata' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(send).toHaveBeenCalledWith({
      type: 'SAVE',
      payload: { idpMetadataUrl: 'https://idp.example.com/metadata' },
    });
  });

  it('steps back within the SAML sub-flow with PREV_INNER', () => {
    const { send } = renderView({
      snapshot: snapshot('configuring', {
        hasConnection: true,
        providerSteps: OKTA_STEPS,
        submitIndex: 3,
        stepIndex: 2,
      }),
      providerSteps: OKTA_STEPS,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(send).toHaveBeenCalledWith({ type: 'PREV_INNER' });
  });

  it('bubbles to the outer wizard from a terminal non-submit step', () => {
    // Google's configure-user-access is terminal but not the submit step.
    const googleSteps = [
      'create-app',
      'identity-provider-metadata',
      'service-provider',
      'attribute-mapping',
      'configure-user-access',
    ];
    const { onParentNext, send } = renderView({
      snapshot: snapshot('configuring', {
        hasConnection: true,
        providerSteps: googleSteps,
        submitIndex: 1,
        stepIndex: 4,
      }),
      providerSteps: googleSteps,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onParentNext).toHaveBeenCalled();
    expect(send).not.toHaveBeenCalledWith({ type: 'NEXT_INNER' });
  });
});
