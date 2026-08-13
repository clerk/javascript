import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Snapshot } from '../../machine/types';
import { MosaicProvider } from '../../MosaicProvider';
import type { OrganizationProfileDeleteSectionContext } from '../organization-profile-delete-section.machine';
import { OrganizationProfileDeleteSectionView } from '../organization-profile-delete-section.view';

function renderView(snapshot: Snapshot<OrganizationProfileDeleteSectionContext>, send = vi.fn(), canSubmit = false) {
  render(
    <MosaicProvider>
      <OrganizationProfileDeleteSectionView
        snapshot={snapshot}
        send={send}
        canSubmit={canSubmit}
      />
    </MosaicProvider>,
  );
  return { send };
}

function snapshot(
  overrides: Partial<Snapshot<OrganizationProfileDeleteSectionContext>> = {},
): Snapshot<OrganizationProfileDeleteSectionContext> {
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

describe('OrganizationProfileDeleteSectionView', () => {
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
  // The delete request cannot be called back, so nothing may dismiss the dialog while it is in
  // flight — closing would leave it running behind a surface that is gone. Asserted on the event
  // rather than on the dialog going away: `open` is controlled from the machine, which is mocked
  // here, so the surface stays either way and only the request to close distinguishes them.
  it('does not request a close while the delete is in flight', async () => {
    const user = userEvent.setup();
    const { send } = renderView(
      snapshot({
        value: 'deleting',
        context: {
          organizationName: 'Acme Inc',
          confirmationValue: 'Acme Inc',
          destroyOrganization: async () => {},
          error: null,
        },
      }),
    );

    await user.keyboard('{Escape}');

    expect(send).not.toHaveBeenCalledWith({ type: 'CANCEL' });
  });

  it('still dismisses with Escape before the delete starts', async () => {
    const user = userEvent.setup();
    const { send } = renderView(snapshot());

    await user.keyboard('{Escape}');

    expect(send).toHaveBeenCalledWith({ type: 'CANCEL' });
  });
});
