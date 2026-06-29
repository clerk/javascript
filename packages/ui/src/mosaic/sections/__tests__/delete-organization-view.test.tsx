import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { Snapshot } from '../../machine/types';
import type { DeleteOrgContext } from '../delete-organization-machine';
import { DeleteOrganizationView } from '../delete-organization-view';

function renderView(snapshot: Snapshot<DeleteOrgContext>, send = vi.fn(), canSubmit = false) {
  render(
    <MosaicProvider>
      <DeleteOrganizationView
        snapshot={snapshot}
        send={send}
        canSubmit={canSubmit}
      />
    </MosaicProvider>,
  );
  return { send };
}

function snapshot(overrides: Partial<Snapshot<DeleteOrgContext>> = {}): Snapshot<DeleteOrgContext> {
  return {
    value: 'confirming',
    status: 'active',
    context: {
      organizationName: 'Acme Inc',
      confirmationValue: '',
      destroyOrganization: async () => {},
      error: null,
    },
    ...overrides,
  };
}

describe('DeleteOrganizationView', () => {
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
          destroyOrganization: async () => {},
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
          destroyOrganization: async () => {},
          error: null,
        },
      }),
      undefined,
      false,
    );

    expect(screen.getByRole('button', { name: 'Delete organization' })).toBeDisabled();
  });

  it('shows machine errors without Clerk fixtures', () => {
    renderView(
      snapshot({
        context: {
          organizationName: 'Acme Inc',
          confirmationValue: 'Acme Inc',
          destroyOrganization: async () => {},
          error: 'Delete failed',
        },
      }),
    );

    expect(screen.getByText('Delete failed')).toBeInTheDocument();
  });
});
