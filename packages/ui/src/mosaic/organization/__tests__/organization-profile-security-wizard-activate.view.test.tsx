import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Snapshot } from '../../machine/types';
import { MosaicProvider } from '../../MosaicProvider';
import type { OrganizationProfileSecurityWizardActivateStep } from '../organization-profile-security-panel.controller';
import type { OrganizationProfileSecurityWizardActivateContext } from '../organization-profile-security-wizard-activate.machine';
import { OrganizationProfileSecurityWizardActivateView } from '../organization-profile-security-wizard-activate.view';

const snapshot = (
  value: string,
  context: Partial<OrganizationProfileSecurityWizardActivateContext> = {},
): Snapshot<OrganizationProfileSecurityWizardActivateContext> => ({
  value,
  status: 'active',
  context: {
    isActive: false,
    error: null,
    activateConnection: async () => {},
    ...context,
  },
});

function renderView(overrides: Partial<OrganizationProfileSecurityWizardActivateStep> = {}) {
  const send = vi.fn();
  const onExit = vi.fn();

  const activate: OrganizationProfileSecurityWizardActivateStep = {
    snapshot: snapshot('idle'),
    send,
    isActive: false,
    domain: 'acme.com',
    onExit,
    ...overrides,
  };

  render(
    <MosaicProvider>
      <OrganizationProfileSecurityWizardActivateView activate={activate} />
    </MosaicProvider>,
  );

  return { send, onExit };
}

describe('OrganizationProfileSecurityWizardActivateView', () => {
  it('fires ENTER once on mount', () => {
    const { send } = renderView();
    expect(send).toHaveBeenCalledWith({ type: 'ENTER' });
    expect(send.mock.calls.filter(([event]) => event.type === 'ENTER')).toHaveLength(1);
  });

  it('activates the connection from the Activate button', () => {
    const { send } = renderView({ isActive: false });
    fireEvent.click(screen.getByRole('button', { name: 'Activate SSO' }));
    expect(send).toHaveBeenCalledWith({ type: 'ACTIVATE' });
  });

  it('skips out of the wizard without activating', () => {
    const { send, onExit } = renderView({ isActive: false });
    fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }));
    expect(onExit).toHaveBeenCalled();
    expect(send).not.toHaveBeenCalledWith({ type: 'ACTIVATE' });
  });

  it('shows the active copy and a Done exit when the connection is already active', () => {
    const { onExit } = renderView({ isActive: true });
    expect(screen.getByText('SSO connection is active')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activate SSO' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onExit).toHaveBeenCalled();
  });

  it('shows the activation error', () => {
    renderView({ snapshot: snapshot('idle', { error: 'Activation failed' }) });
    expect(screen.getByRole('alert')).toHaveTextContent('Activation failed');
  });
});
