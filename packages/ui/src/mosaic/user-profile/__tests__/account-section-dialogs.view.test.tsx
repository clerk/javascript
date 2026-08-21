import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { AccountSectionFlows } from '../dialogs/flow.types';
import type { UserProfileAccountSectionViewProps } from '../user-profile-account-section.view';
import { UserProfileAccountSectionView } from '../user-profile-account-section.view';

const rows: UserProfileAccountSectionViewProps = {
  name: 'Preston Booth',
  username: 'prestonxyz',
  emails: [{ id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true }],
  phones: [{ id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true }],
};

function renderSection(flows: AccountSectionFlows = {}) {
  return render(
    <MosaicProvider>
      <UserProfileAccountSectionView
        {...rows}
        {...flows}
      />
    </MosaicProvider>,
  );
}

const addContactActions = {
  onCancel: vi.fn(),
  onCodeChange: vi.fn(),
  onOpenSsoPopup: vi.fn(),
  onResend: vi.fn(),
  onSubmitCode: vi.fn(),
  onSubmitIdentifier: vi.fn(),
  onValueChange: vi.fn(),
};

const editActions = {
  onNameChange: vi.fn(),
  onUsernameChange: vi.fn(),
  onSelectAvatarFile: vi.fn(),
  onRemoveAvatar: vi.fn(),
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
};

describe('UserProfileAccountSectionView flows', () => {
  it('renders rows only when no flow is supplied, so existing callers are unaffected', () => {
    renderSection();

    expect(screen.getByText('item1@clerk.dev')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('renders the add-contact dialog from the section itself', () => {
    renderSection({
      addContact: {
        kind: 'email',
        state: { step: 'identifier', value: '', isSubmitting: false, errors: {} },
        ...addContactActions,
      },
    });

    expect(screen.getByRole('heading', { name: 'Add email address' })).toBeInTheDocument();
  });

  it('renders a removal as an alertdialog, not a dialog', () => {
    renderSection({
      confirmContact: {
        action: 'remove',
        kind: 'email',
        isVerified: true,
        state: { identifier: 'item1@clerk.dev', isSubmitting: false, errors: {} },
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
      },
    });

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/no longer be able to sign in/)).toBeInTheDocument();
  });

  it('stacks the reverification challenge over the flow it interrupted', () => {
    renderSection({
      addContact: {
        kind: 'email',
        state: { step: 'identifier', value: 'new@clerk.dev', isSubmitting: true, errors: {} },
        ...addContactActions,
      },
      reverification: {
        state: {
          strategy: 'password',
          value: '',
          status: 'idle',
          errors: {},
          resend: { isResending: false, secondsRemaining: 0 },
        },
        onValueChange: vi.fn(),
        onSubmit: vi.fn(),
        onResend: vi.fn(),
        onCancel: vi.fn(),
      },
    });

    // The challenge is what the user can reach.
    expect(screen.getByRole('heading', { name: /Verify it/ })).toBeInTheDocument();

    // The interrupted flow stays MOUNTED underneath so it resumes where it was — but a modal
    // hides everything beneath it from the accessibility tree, so it is only reachable with
    // `hidden`. That it is inert rather than merely obscured is the point of `isInterrupted`.
    expect(screen.getByRole('heading', { name: 'Add email address', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email address', hidden: true })).toBeDisabled();
  });

  it('asks before discarding an edited profile field, and cancelling the question keeps it open', async () => {
    const onCancel = vi.fn();
    renderSection({
      editProfile: {
        field: 'username',
        // Differs from the saved `username`, so the form is dirty.
        state: { value: 'someone-else', hasUsername: true, isSubmitting: false, errors: {} },
        ...editActions,
        onCancel,
      },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByRole('alertdialog', { name: 'Discard changes?' })).toBeInTheDocument();
    expect(onCancel).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Update username' })).toBeInTheDocument();
  });

  it('closes without asking when the field matches what is saved', async () => {
    const onCancel = vi.fn();
    renderSection({
      editProfile: {
        field: 'username',
        state: { value: 'prestonxyz', hasUsername: true, isSubmitting: false, errors: {} },
        ...editActions,
        onCancel,
      },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
