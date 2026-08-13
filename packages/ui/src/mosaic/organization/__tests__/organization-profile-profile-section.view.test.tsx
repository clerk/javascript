import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Snapshot } from '../../machine/types';
import { MosaicProvider } from '../../MosaicProvider';
import { OrganizationProfileProfileSectionView } from '../organization-profile-profile-section.view';
import type { OrganizationProfileProfileSectionDetailsContext } from '../organization-profile-profile-section-details.machine';

afterEach(() => cleanup());

function snapshot(
  context: Partial<OrganizationProfileProfileSectionDetailsContext> = {},
  value = 'editing',
): Snapshot<OrganizationProfileProfileSectionDetailsContext> {
  return {
    value,
    status: 'active',
    context: {
      committedName: 'Acme Inc',
      committedSlug: 'acme',
      slugEnabled: true,
      draftName: null,
      draftSlug: null,
      error: null,
      updateOrganization: async () => {},
      ...context,
    },
  } as Snapshot<OrganizationProfileProfileSectionDetailsContext>;
}

function renderView(
  snap: Snapshot<OrganizationProfileProfileSectionDetailsContext> = snapshot(),
  send = vi.fn(),
  canSubmit = true,
) {
  render(
    <MosaicProvider>
      <OrganizationProfileProfileSectionView
        snapshot={snap}
        send={send}
        canSubmit={canSubmit}
      />
    </MosaicProvider>,
  );
  return { send };
}

const edited = snapshot({ draftName: 'Acme Incorporated' });

describe('OrganizationProfileProfileSectionView — discarding edits', () => {
  it('closes without asking when nothing has been edited', async () => {
    const user = userEvent.setup();
    const { send } = renderView();

    await user.keyboard('{Escape}');

    expect(send).toHaveBeenCalledWith({ type: 'CANCEL' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('asks before discarding edits, and does not close meanwhile', async () => {
    const user = userEvent.setup();
    const { send } = renderView(edited);

    await user.keyboard('{Escape}');

    expect(screen.getByRole('alertdialog', { name: 'Discard changes?' })).toBeInTheDocument();
    expect(send).not.toHaveBeenCalledWith({ type: 'CANCEL' });
  });

  it('discards once confirmed', async () => {
    const user = userEvent.setup();
    const { send } = renderView(edited);

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Discard' }));

    await waitFor(() => expect(send).toHaveBeenCalledWith({ type: 'CANCEL' }));
  });

  it('keeps the edits when the confirmation is declined', async () => {
    const user = userEvent.setup();
    const { send } = renderView(edited);

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));

    expect(send).not.toHaveBeenCalledWith({ type: 'CANCEL' });
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Update profile' })).toBeInTheDocument());
  });

  // The Cancel button used to send `CANCEL` itself, which went around the guard entirely — the one
  // way out that discarded the edits without asking.
  it('asks when the Cancel button is pressed with edits pending', async () => {
    const user = userEvent.setup();
    const { send } = renderView(edited);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByRole('alertdialog', { name: 'Discard changes?' })).toBeInTheDocument();
    expect(send).not.toHaveBeenCalledWith({ type: 'CANCEL' });
  });

  it('asks about a slug edit as well as a name edit', async () => {
    const user = userEvent.setup();
    renderView(snapshot({ draftSlug: 'acme-inc' }));

    await user.keyboard('{Escape}');

    expect(screen.getByRole('alertdialog', { name: 'Discard changes?' })).toBeInTheDocument();
  });

  // Typing and then undoing leaves a draft that is no longer a change; the guard follows the
  // machine's own definition of an edit rather than "has been touched".
  it('does not ask when the draft matches what is committed', async () => {
    const user = userEvent.setup();
    const { send } = renderView(snapshot({ draftName: 'Acme Inc' }));

    await user.keyboard('{Escape}');

    expect(send).toHaveBeenCalledWith({ type: 'CANCEL' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  // `CANCEL` is not a transition `saving` accepts, so the dialog stays open regardless: a question
  // whose answer changes nothing is worse than no question.
  it('does not ask while saving', async () => {
    const user = userEvent.setup();
    renderView(snapshot({ draftName: 'Acme Incorporated' }, 'saving'));

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
