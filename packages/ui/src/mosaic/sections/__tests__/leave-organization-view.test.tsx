import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { Snapshot } from '../../machine/types';
import type { LeaveOrgContext } from '../leave-organization-machine';
import { LeaveOrganizationView } from '../leave-organization-view';

function renderView(snapshot: Snapshot<LeaveOrgContext>, send = vi.fn(), canSubmit = false) {
  render(
    <MosaicProvider>
      <LeaveOrganizationView
        snapshot={snapshot}
        send={send}
        canSubmit={canSubmit}
      />
    </MosaicProvider>,
  );
  return { send };
}

function snapshot(overrides: Partial<Snapshot<LeaveOrgContext>> = {}): Snapshot<LeaveOrgContext> {
  return {
    value: 'confirming',
    status: 'active',
    context: {
      organizationName: 'Acme Inc',
      confirmationValue: '',
      leaveOrganization: async () => {},
      error: null,
    },
    ...overrides,
  };
}

describe('LeaveOrganizationView', () => {
  it('emits a typed confirmation event from the input', () => {
    const { send } = renderView(snapshot());

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Acme Inc' } });

    expect(send).toHaveBeenCalledWith({ type: 'TYPE_CONFIRMATION', value: 'Acme Inc' });
  });

  it('emits CONFIRM from the destructive submit action', () => {
    const { send } = renderView(
      snapshot({
        context: {
          organizationName: 'Acme Inc',
          confirmationValue: 'Acme Inc',
          leaveOrganization: async () => {},
          error: null,
        },
      }),
      undefined,
      true,
    );

    const form = screen.getByRole('textbox').closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(send).toHaveBeenCalledWith({ type: 'CONFIRM' });
  });

  it('keeps submit disabled when the machine says CONFIRM is unavailable', () => {
    renderView(
      snapshot({
        context: {
          organizationName: 'Acme Inc',
          confirmationValue: 'Acme Inc',
          leaveOrganization: async () => {},
          error: null,
        },
      }),
      undefined,
      false,
    );

    expect(screen.getByRole('button', { name: 'Leave organization' })).toBeDisabled();
  });

  it('shows machine errors without Clerk fixtures', () => {
    renderView(
      snapshot({
        context: {
          organizationName: 'Acme Inc',
          confirmationValue: 'Acme Inc',
          leaveOrganization: async () => {},
          error: 'Leave failed',
        },
      }),
    );

    expect(screen.getByText('Leave failed')).toBeInTheDocument();
  });
});
