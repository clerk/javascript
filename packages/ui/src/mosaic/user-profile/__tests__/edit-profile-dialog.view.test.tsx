import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from '../../components/dialog';
import { MosaicProvider } from '../../MosaicProvider';
import { EditAvatarDialogView, EditNameDialogView, EditUsernameDialogView } from '../dialogs/edit-profile-dialog.view';
import type { EditAvatarState, EditNameState, EditUsernameState } from '../dialogs/flow.types';

function renderDialog(children: React.ReactNode) {
  render(
    <MosaicProvider>
      <Dialog defaultOpen>{children}</Dialog>
    </MosaicProvider>,
  );
}

const NAME: EditNameState = {
  firstName: 'Preston',
  lastName: 'Booth',
  isSubmitting: false,
  isReadOnly: false,
  errors: {},
};

function nameHandlers() {
  return {
    onFirstNameChange: vi.fn(),
    onLastNameChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };
}

describe('EditNameDialogView', () => {
  it('submits both names', async () => {
    const handlers = nameHandlers();
    renderDialog(
      <EditNameDialogView
        state={NAME}
        {...handlers}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(handlers.onSubmit).toHaveBeenCalledOnce();
  });

  it('reports a per-field error against the field it belongs to', () => {
    renderDialog(
      <EditNameDialogView
        state={{ ...NAME, firstName: '', errors: { firstName: 'Enter a first name.' } }}
        {...nameHandlers()}
      />,
    );

    expect(screen.getByText('Enter a first name.')).toBeInTheDocument();
  });

  it('locks the fields and drops Save entirely when the account is enterprise-managed', () => {
    renderDialog(
      <EditNameDialogView
        state={{ ...NAME, isReadOnly: true }}
        {...nameHandlers()}
      />,
    );

    expect(screen.getByLabelText('First name')).toBeDisabled();
    expect(screen.getByLabelText('Last name')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByText(/managed by your organization/)).toBeInTheDocument();
  });

  it('shows progress while saving', () => {
    renderDialog(
      <EditNameDialogView
        state={{ ...NAME, isSubmitting: true }}
        {...nameHandlers()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-busy', 'true');
  });
});

const USERNAME: EditUsernameState = { value: 'prestonxyz', hasUsername: true, isSubmitting: false, errors: {} };

function usernameHandlers() {
  return { onValueChange: vi.fn(), onSubmit: vi.fn(), onCancel: vi.fn() };
}

describe('EditUsernameDialogView', () => {
  it('titles itself for setting versus updating', () => {
    const { unmount } = render(
      <MosaicProvider>
        <Dialog defaultOpen>
          <EditUsernameDialogView
            state={{ ...USERNAME, value: '', hasUsername: false }}
            {...usernameHandlers()}
          />
        </Dialog>
      </MosaicProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Set username' })).toBeInTheDocument();
    unmount();

    renderDialog(
      <EditUsernameDialogView
        state={USERNAME}
        {...usernameHandlers()}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Update username' })).toBeInTheDocument();
  });

  it('reports a taken username in the field', () => {
    renderDialog(
      <EditUsernameDialogView
        state={{ ...USERNAME, errors: { field: 'That username is taken. Please try another.' } }}
        {...usernameHandlers()}
      />,
    );

    expect(screen.getByText('That username is taken. Please try another.')).toBeInTheDocument();
  });

  it('goes inert behind a stacked reverification challenge', () => {
    renderDialog(
      <EditUsernameDialogView
        isInterrupted
        state={USERNAME}
        {...usernameHandlers()}
      />,
    );

    expect(screen.getByLabelText('Username')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});

const AVATAR: EditAvatarState = { canRemove: false, status: 'idle', errors: {} };

function avatarHandlers() {
  return { onSelectFile: vi.fn(), onSubmit: vi.fn(), onRemove: vi.fn(), onCancel: vi.fn() };
}

describe('EditAvatarDialogView', () => {
  it('keeps Upload disabled until a file is staged', () => {
    renderDialog(
      <EditAvatarDialogView
        fallback='PB'
        state={AVATAR}
        {...avatarHandlers()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('names the staged file and enables Upload', async () => {
    const handlers = avatarHandlers();
    renderDialog(
      <EditAvatarDialogView
        fallback='PB'
        state={{ ...AVATAR, fileName: 'headshot.png' }}
        {...handlers}
      />,
    );

    expect(screen.getByText('headshot.png')).toBeInTheDocument();
    const upload = screen.getByRole('button', { name: 'Upload' });
    expect(upload).toBeEnabled();
    expect(upload).not.toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(upload);
    expect(handlers.onSubmit).toHaveBeenCalledOnce();
  });

  it('stays focusable while the upload runs, rather than dropping out of the tab order', () => {
    renderDialog(
      <EditAvatarDialogView
        fallback='PB'
        state={{ ...AVATAR, fileName: 'headshot.png', status: 'uploading' }}
        {...avatarHandlers()}
      />,
    );

    const upload = screen.getByRole('button', { name: /Upload/ });
    expect(upload).toBeEnabled();
    expect(upload).toHaveAttribute('aria-disabled', 'true');
    expect(upload).toHaveAttribute('aria-busy', 'true');
  });

  it('passes a chosen file up rather than validating it itself', async () => {
    const handlers = avatarHandlers();
    renderDialog(
      <EditAvatarDialogView
        fallback='PB'
        state={AVATAR}
        {...handlers}
      />,
    );

    const file = new File(['x'], 'headshot.png', { type: 'image/png' });
    await userEvent.upload(screen.getByLabelText('Image file'), file);

    expect(handlers.onSelectFile).toHaveBeenCalledWith(file);
  });

  it('offers Remove only when there is an image to remove', () => {
    const { unmount } = render(
      <MosaicProvider>
        <Dialog defaultOpen>
          <EditAvatarDialogView
            fallback='PB'
            state={AVATAR}
            {...avatarHandlers()}
          />
        </Dialog>
      </MosaicProvider>,
    );
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    unmount();

    renderDialog(
      <EditAvatarDialogView
        fallback='PB'
        state={{ ...AVATAR, canRemove: true }}
        {...avatarHandlers()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('reports a locally rejected file in the field', () => {
    renderDialog(
      <EditAvatarDialogView
        fallback='PB'
        state={{ ...AVATAR, errors: { field: 'That image is larger than 10MB.' } }}
        {...avatarHandlers()}
      />,
    );

    expect(screen.getByText('That image is larger than 10MB.')).toBeInTheDocument();
  });

  it.each([
    ['uploading', 'Uploading…'],
    ['removing', 'Removing…'],
  ] as const)('shows progress while %s', (status, label) => {
    renderDialog(
      <EditAvatarDialogView
        fallback='PB'
        state={{ ...AVATAR, fileName: 'headshot.png', canRemove: true, status }}
        {...avatarHandlers()}
      />,
    );

    if (status === 'uploading') {
      expect(screen.getByRole('button', { name: 'Upload' })).toHaveAttribute('aria-busy', 'true');
    } else {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByLabelText('Image file')).toBeDisabled();
  });
});
