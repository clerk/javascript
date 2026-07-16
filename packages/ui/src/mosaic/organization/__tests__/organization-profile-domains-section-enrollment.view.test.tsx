import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Snapshot } from '../../machine/types';
import { MosaicProvider } from '../../MosaicProvider';
import type { OrganizationProfileEnrollmentOption } from '../organization-profile-domains-section.controller';
import type { OrganizationProfileDomainsSectionEnrollmentContext } from '../organization-profile-domains-section-enrollment.machine';
import { OrganizationProfileDomainsSectionEnrollmentView } from '../organization-profile-domains-section-enrollment.view';

const OPTIONS: OrganizationProfileEnrollmentOption[] = [
  { value: 'manual_invitation', label: 'No automatic enrollment', description: 'Manual only.' },
  { value: 'automatic_invitation', label: 'Automatic invitations', description: 'Auto invited.' },
  { value: 'automatic_suggestion', label: 'Automatic suggestions', description: 'Suggested.' },
];

function snapshot(
  context: Partial<OrganizationProfileDomainsSectionEnrollmentContext> = {},
  value: Snapshot<OrganizationProfileDomainsSectionEnrollmentContext>['value'] = 'editing',
): Snapshot<OrganizationProfileDomainsSectionEnrollmentContext> {
  return {
    value,
    status: 'active',
    context: {
      domainId: 'dmn_1',
      domainName: 'clerk.com',
      committedEnrollmentMode: 'manual_invitation',
      draftEnrollmentMode: null,
      deletePending: false,
      totalPendingInvitations: 0,
      totalPendingSuggestions: 0,
      error: null,
      updateEnrollmentMode: async () => {},
      ...context,
    },
  };
}

function renderView(
  snap: Snapshot<OrganizationProfileDomainsSectionEnrollmentContext>,
  canSubmit = false,
  send = vi.fn(),
) {
  render(
    <MosaicProvider>
      <OrganizationProfileDomainsSectionEnrollmentView
        snapshot={snap}
        send={send}
        canSubmit={canSubmit}
        enrollmentOptions={OPTIONS}
      />
    </MosaicProvider>,
  );
  return { send };
}

describe('OrganizationProfileDomainsSectionEnrollmentView', () => {
  it('renders the enrollment options from settings', () => {
    renderView(snapshot());

    expect(screen.getByText('No automatic enrollment')).toBeInTheDocument();
    expect(screen.getByText('Automatic invitations')).toBeInTheDocument();
    expect(screen.getByText('Automatic suggestions')).toBeInTheDocument();
  });

  it('checks the effective (draft over committed) mode', () => {
    renderView(snapshot({ draftEnrollmentMode: 'automatic_invitation' }));

    const radios = screen.getAllByRole('radio');
    const checked = radios.filter(radio => (radio as HTMLInputElement).checked);
    expect(checked).toHaveLength(1);
    expect((checked[0] as HTMLInputElement).value).toBe('automatic_invitation');
  });

  it('emits SELECT_MODE when an option is chosen', () => {
    const { send } = renderView(snapshot());

    fireEvent.click(screen.getByRole('radio', { name: /Automatic suggestions/ }));

    expect(send).toHaveBeenCalledWith({ type: 'SELECT_MODE', value: 'automatic_suggestion' });
  });

  it('shows the delete-pending checkbox only when the effective mode is manual_invitation', () => {
    renderView(snapshot({ draftEnrollmentMode: 'manual_invitation' }));
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('hides the delete-pending checkbox for automatic modes', () => {
    renderView(snapshot({ draftEnrollmentMode: 'automatic_invitation' }));
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('emits TOGGLE_DELETE_PENDING from the checkbox', () => {
    const { send } = renderView(snapshot({ draftEnrollmentMode: 'manual_invitation' }));

    fireEvent.click(screen.getByRole('checkbox'));

    expect(send).toHaveBeenCalledWith({ type: 'TOGGLE_DELETE_PENDING', checked: true });
  });

  it('shows the pending-counts callout only when there are pending invites or suggestions', () => {
    renderView(snapshot({ totalPendingInvitations: 2, totalPendingSuggestions: 1 }));
    expect(screen.getByText('Pending invitations sent to users: 2')).toBeInTheDocument();
    expect(screen.getByText('Pending suggestions sent to users: 1')).toBeInTheDocument();
  });

  it('hides the callout when there is nothing pending', () => {
    renderView(snapshot());
    expect(screen.queryByText(/Pending invitations sent to users/)).not.toBeInTheDocument();
  });

  it('submits when allowed', () => {
    const { send } = renderView(snapshot({ draftEnrollmentMode: 'automatic_invitation' }), true);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(send).toHaveBeenCalledWith({ type: 'SUBMIT' });
  });

  it('keeps Save disabled when the machine says SUBMIT is unavailable', () => {
    renderView(snapshot(), false);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('renders machine errors', () => {
    renderView(snapshot({ error: 'Update failed' }));
    expect(screen.getByText('Update failed')).toBeInTheDocument();
  });
});
