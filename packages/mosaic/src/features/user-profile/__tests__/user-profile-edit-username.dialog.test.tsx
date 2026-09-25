import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../../../components/button';
import type { MosaicLocalization } from '../../../localization';
import { MosaicProvider } from '../../../MosaicProvider';
import { SaveError } from '../../../utils/form-error';
import { useUserProfileEditUsernameController } from '../user-profile-account-section/user-profile-edit-username.controller';
import type { UserProfileEditUsernameDialogProps } from '../user-profile-account-section/user-profile-edit-username.dialog';
import { UserProfileEditUsernameDialog } from '../user-profile-account-section/user-profile-edit-username.dialog';

type ViewProps = Omit<UserProfileEditUsernameDialogProps, 'form'> & {
  onSubmit: (username: string) => Promise<void>;
};

function View({ onSubmit, ...props }: ViewProps) {
  const { form } = useUserProfileEditUsernameController({ username: 'prestonxyz', onSubmit });
  return (
    <UserProfileEditUsernameDialog
      {...props}
      form={form}
    />
  );
}

function renderView(overrides: Partial<ViewProps> = {}, localization?: MosaicLocalization) {
  const props: ViewProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn(() => Promise.resolve()),
    ...overrides,
  };
  render(
    <MosaicProvider localization={localization}>
      <View {...props} />
    </MosaicProvider>,
  );
  return props;
}

const usernameField = () => screen.getByLabelText('Username');
const saveButton = () => screen.getByRole('button', { name: 'Save changes' });

describe('UserProfileEditUsernameDialog', () => {
  it('renders nothing until the caller opens it', () => {
    renderView({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('names the dialog and shows the saved username', () => {
    renderView();

    expect(screen.getByRole('dialog', { name: 'Edit username' })).toBeInTheDocument();
    expect(usernameField()).toHaveValue('prestonxyz');
  });

  it('opens on the field rather than the corner dismiss', async () => {
    renderView();

    await waitFor(() => expect(usernameField()).toHaveFocus());
  });

  it('asks to open from the trigger', async () => {
    const user = userEvent.setup();
    const props = renderView({ open: false, trigger: <Button>Edit username</Button> });

    await user.click(screen.getByRole('button', { name: 'Edit username' }));

    expect(props.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('withholds the save until the value moves, keeping the action reachable', async () => {
    const user = userEvent.setup();
    const props = renderView();

    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
    await user.click(saveButton());
    await user.type(usernameField(), '{Enter}');

    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('submits from the action and from enter in the field', async () => {
    const user = userEvent.setup();
    const props = renderView({ onSubmit: vi.fn(() => Promise.reject(new SaveError({ global: { message: 'no' } }))) });

    await user.type(usernameField(), 'x');
    await user.click(saveButton());
    await screen.findByRole('alert');
    await user.type(usernameField(), '{Enter}');

    await waitFor(() => expect(props.onSubmit).toHaveBeenCalledTimes(2));
    expect(props.onSubmit).toHaveBeenCalledWith('prestonxyzx');
  });

  it('asks to close from cancel', async () => {
    const user = userEvent.setup();
    const props = renderView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(props.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('announces a general failure in a negative banner', async () => {
    const user = userEvent.setup();
    renderView({
      onSubmit: () => Promise.reject(new SaveError({ global: { message: 'Your username could not be updated.' } })),
    });

    await user.type(usernameField(), 'x');
    await user.click(saveButton());

    const banner = await screen.findByRole('alert');
    expect(banner).toHaveAttribute('data-color', 'negative');
    expect(banner).toHaveTextContent('Your username could not be updated.');
    expect(usernameField()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the translation for the error code on the field, with no banner', async () => {
    const user = userEvent.setup();
    renderView(
      {
        onSubmit: () =>
          Promise.reject(
            new SaveError({
              fields: { username: { code: 'form_identifier_exists', paramName: 'username', message: 'Taken.' } },
            }),
          ),
      },
      { overrides: { 'errors.form_identifier_exists__username': 'Ese nombre de usuario ya existe.' } },
    );

    await user.type(usernameField(), 'x');
    await user.click(saveButton());

    await waitFor(() => expect(usernameField()).toHaveAccessibleDescription('Ese nombre de usuario ya existe.'));
    expect(usernameField()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('stays inert while the save runs', async () => {
    const user = userEvent.setup();
    const props = renderView({ onSubmit: vi.fn(() => new Promise<void>(() => {})) });

    await user.type(usernameField(), 'x');
    await user.click(saveButton());

    expect(usernameField()).toBeDisabled();
    expect(saveButton()).toHaveAttribute('aria-busy', 'true');
    await user.click(saveButton());
    expect(props.onSubmit).toHaveBeenCalledOnce();
  });
});
