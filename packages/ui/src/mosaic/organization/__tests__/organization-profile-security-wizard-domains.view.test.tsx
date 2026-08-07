import type { OrganizationDomainResource } from '@clerk/shared/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Snapshot } from '../../machine/types';
import { MosaicProvider } from '../../MosaicProvider';
import type { OrganizationProfileSecurityWizardDomainsAddContext } from '../organization-profile-security-wizard-domains-add.machine';
import type { OrganizationProfileSecurityWizardDomainsPrepareContext } from '../organization-profile-security-wizard-domains-prepare.machine';
import type { OrganizationProfileSecurityWizardDomainsRemoveContext } from '../organization-profile-security-wizard-domains-remove.machine';
import type { OrganizationProfileSecurityWizardDomainsViewProps } from '../organization-profile-security-wizard-domains.view';
import { OrganizationProfileSecurityWizardDomainsView } from '../organization-profile-security-wizard-domains.view';

const buildDomain = (overrides: {
  id: string;
  name: string;
  status?: 'verified' | 'expired' | 'unverified';
  txtRecordName?: string;
  txtRecordValue?: string;
}): OrganizationDomainResource => {
  const { id, name, status = 'unverified', txtRecordName, txtRecordValue } = overrides;
  // SAFETY: the view reads only id / name / ownershipVerification.{status,txtRecordName,txtRecordValue}.
  // A full OrganizationDomainResource carries dozens of unrelated fields; a test fixture narrows to
  // what the view touches. This cast is confined to the test's fixture builder.
  return {
    id,
    name,
    ownershipVerification:
      status === 'unverified' ? { status: 'unverified', txtRecordName, txtRecordValue } : { status },
  } as unknown as OrganizationDomainResource;
};

const addSnapshot = (
  value: string,
  context: Partial<OrganizationProfileSecurityWizardDomainsAddContext> = {},
): Snapshot<OrganizationProfileSecurityWizardDomainsAddContext> => ({
  value,
  status: 'active',
  context: { draftName: '', pendingName: '', error: null, createDomain: async () => {}, ...context },
});

const prepareSnapshot = (
  value: string,
  context: Partial<OrganizationProfileSecurityWizardDomainsPrepareContext> = {},
): Snapshot<OrganizationProfileSecurityWizardDomainsPrepareContext> => ({
  value,
  status: 'active',
  context: { pendingDomainId: '', error: null, prepareVerification: async () => {}, ...context },
});

const removeSnapshot = (
  value: string,
  context: Partial<OrganizationProfileSecurityWizardDomainsRemoveContext> = {},
): Snapshot<OrganizationProfileSecurityWizardDomainsRemoveContext> => ({
  value,
  status: 'active',
  context: { domainName: '', isConnectionActive: false, removeDomain: async () => {}, error: null, ...context },
});

function renderView(overrides: Partial<OrganizationProfileSecurityWizardDomainsViewProps> = {}) {
  const addSend = vi.fn();
  const prepareSend = vi.fn();
  const removeSend = vi.fn();
  const onStepMounted = vi.fn();

  const props: OrganizationProfileSecurityWizardDomainsViewProps = {
    domains: [],
    suggestedDomain: null,
    hasConnection: false,
    isConnectionActive: false,
    add: { snapshot: addSnapshot('idle'), send: addSend },
    prepare: { snapshot: prepareSnapshot('idle'), send: prepareSend },
    remove: { snapshot: removeSnapshot('idle'), send: removeSend },
    onStepMounted,
    ...overrides,
  };

  render(
    <MosaicProvider>
      <OrganizationProfileSecurityWizardDomainsView {...props} />
    </MosaicProvider>,
  );

  return { addSend, prepareSend, removeSend, onStepMounted };
}

describe('OrganizationProfileSecurityWizardDomainsView — add field', () => {
  it('fires TYPE_NAME as the user types', () => {
    const { addSend } = renderView();
    fireEvent.change(screen.getByRole('textbox', { name: 'Domain' }), { target: { value: 'clerk.com' } });
    expect(addSend).toHaveBeenCalledWith({ type: 'TYPE_NAME', value: 'clerk.com' });
  });

  it('submits a valid, non-duplicate domain', () => {
    const send = vi.fn();
    renderView({ add: { snapshot: addSnapshot('idle', { draftName: 'clerk.com' }), send } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(send).toHaveBeenCalledWith({ type: 'SUBMIT', name: 'clerk.com' });
  });

  it('disables Add for an invalid domain', () => {
    renderView({ add: { snapshot: addSnapshot('idle', { draftName: 'not a domain' }), send: vi.fn() } });
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('disables Add for a duplicate domain already in the list', () => {
    renderView({
      domains: [buildDomain({ id: 'd1', name: 'clerk.com', status: 'verified' })],
      add: { snapshot: addSnapshot('idle', { draftName: 'clerk.com' }), send: vi.fn() },
    });
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });
});

describe('OrganizationProfileSecurityWizardDomainsView — suggestion + error', () => {
  it('shows the suggestion only while the list is empty and submits it', () => {
    const send = vi.fn();
    renderView({ suggestedDomain: 'clerk.com', add: { snapshot: addSnapshot('idle'), send } });
    fireEvent.click(screen.getByRole('button', { name: 'Add clerk.com' }));
    expect(send).toHaveBeenCalledWith({ type: 'SUBMIT', name: 'clerk.com' });
  });

  it('hides the suggestion once domains exist', () => {
    renderView({
      suggestedDomain: 'clerk.com',
      domains: [buildDomain({ id: 'd1', name: 'clerk.com' })],
    });
    expect(screen.queryByRole('button', { name: 'Add clerk.com' })).not.toBeInTheDocument();
  });

  it('surfaces the add error, then the prepare error, in the shared alert', () => {
    renderView({ add: { snapshot: addSnapshot('idle', { error: 'Domain already exists' }), send: vi.fn() } });
    expect(screen.getByRole('alert')).toHaveTextContent('Domain already exists');
  });

  it('shows the prepare error when there is no add error', () => {
    renderView({ prepare: { snapshot: prepareSnapshot('idle', { error: 'DNS lookup failed' }), send: vi.fn() } });
    expect(screen.getByRole('alert')).toHaveTextContent('DNS lookup failed');
  });
});

describe('OrganizationProfileSecurityWizardDomainsView — domain list', () => {
  it('renders each domain with its status', () => {
    renderView({
      domains: [
        buildDomain({ id: 'd1', name: 'verified.com', status: 'verified' }),
        buildDomain({ id: 'd2', name: 'expired.com', status: 'expired' }),
        buildDomain({ id: 'd3', name: 'pending.com', status: 'unverified', txtRecordValue: 'clerk-xyz' }),
      ],
    });
    expect(screen.getByText('verified.com')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();
    expect(screen.getByText('clerk-xyz')).toBeInTheDocument();
  });

  it('re-prepares an expired domain via PREPARE', () => {
    const send = vi.fn();
    renderView({
      domains: [buildDomain({ id: 'd2', name: 'expired.com', status: 'expired' })],
      prepare: { snapshot: prepareSnapshot('idle'), send },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Verify again' }));
    expect(send).toHaveBeenCalledWith({ type: 'PREPARE', domainId: 'd2' });
  });

  it('opens the remove dialog with the domain name and active flag', () => {
    const send = vi.fn();
    renderView({
      domains: [buildDomain({ id: 'd1', name: 'clerk.com', status: 'verified' })],
      isConnectionActive: true,
      remove: { snapshot: removeSnapshot('idle'), send },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Remove clerk.com' }));
    expect(send).toHaveBeenCalledWith({ type: 'OPEN', domainName: 'clerk.com', isConnectionActive: true });
  });

  it('locks the last verified domain from removal while a connection exists', () => {
    renderView({
      domains: [buildDomain({ id: 'd1', name: 'clerk.com', status: 'verified' })],
      hasConnection: true,
    });
    expect(screen.getByRole('button', { name: 'Remove clerk.com' })).toBeDisabled();
  });

  it('allows removing a verified domain when there is no connection', () => {
    renderView({
      domains: [buildDomain({ id: 'd1', name: 'clerk.com', status: 'verified' })],
      hasConnection: false,
    });
    expect(screen.getByRole('button', { name: 'Remove clerk.com' })).not.toBeDisabled();
  });
});

describe('OrganizationProfileSecurityWizardDomainsView — remove dialog + telemetry', () => {
  it('confirms and cancels removal', () => {
    const send = vi.fn();
    renderView({ remove: { snapshot: removeSnapshot('confirming', { domainName: 'clerk.com' }), send } });
    fireEvent.click(screen.getByRole('button', { name: 'Remove domain' }));
    expect(send).toHaveBeenCalledWith({ type: 'CONFIRM' });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(send).toHaveBeenCalledWith({ type: 'CANCEL' });
  });

  it('records the mount telemetry exactly once', () => {
    const { onStepMounted } = renderView();
    expect(onStepMounted).toHaveBeenCalledTimes(1);
  });
});
