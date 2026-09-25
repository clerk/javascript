import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../../../components/button';
import { MosaicProvider } from '../../../MosaicProvider';
import { SaveError } from '../../../utils/form-error';
import { useUserProfileEditNameController } from '../user-profile-account-section/user-profile-edit-name.controller';
import type {
  UserProfileEditNameDialogProps,
  UserProfileEditNameValue,
} from '../user-profile-account-section/user-profile-edit-name.dialog';
import { UserProfileEditNameDialog } from '../user-profile-account-section/user-profile-edit-name.dialog';

type ViewProps = Omit<UserProfileEditNameDialogProps, 'form'> & {
  onSubmit: (value: UserProfileEditNameValue) => Promise<void>;
};

function View({ onSubmit, ...props }: ViewProps) {
  const { form } = useUserProfileEditNameController({ firstName: 'Preston', lastName: 'Booth', onSubmit });
  return (
    <UserProfileEditNameDialog
      {...props}
      form={form}
    />
  );
}

function renderView(overrides: Partial<ViewProps> = {}) {
  const props: ViewProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn(() => Promise.resolve()),
    ...overrides,
  };
  render(
    <MosaicProvider>
      <View {...props} />
    </MosaicProvider>,
  );
  return props;
}

const firstNameField = () => screen.getByLabelText('First name');
const lastNameField = () => screen.getByLabelText('Last name');
const saveButton = () => screen.getByRole('button', { name: 'Save changes' });

describe('UserProfileEditNameDialog', () => {
  it('renders nothing until the caller opens it', () => {
    renderView({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('names the dialog and shows the saved name', () => {
    renderView();

    expect(screen.getByRole('dialog', { name: 'Edit name' })).toBeInTheDocument();
    expect(firstNameField()).toHaveValue('Preston');
    expect(lastNameField()).toHaveValue('Booth');
  });

  it('opens on the first name rather than the corner dismiss', async () => {
    renderView();

    await waitFor(() => expect(firstNameField()).toHaveFocus());
  });

  it('asks to open from the trigger', async () => {
    const user = userEvent.setup();
    const props = renderView({ open: false, trigger: <Button>Edit name</Button> });

    await user.click(screen.getByRole('button', { name: 'Edit name' }));

    expect(props.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('withholds the save until the name changes, then submits what was typed', async () => {
    const user = userEvent.setup();
    const props = renderView();
    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');

    await user.type(lastNameField(), 'x');
    await user.click(saveButton());

    expect(props.onSubmit).toHaveBeenCalledExactlyOnceWith({ firstName: 'Preston', lastName: 'Boothx' });
  });

  it('renders both fields optional unless told otherwise', () => {
    renderView();

    expect(firstNameField()).not.toBeRequired();
    expect(lastNameField()).not.toBeRequired();
  });

  it('holds the submit while a required field is empty', async () => {
    const user = userEvent.setup();
    const props = renderView({ firstNameAttribute: { required: true } });
    expect(firstNameField()).toBeRequired();

    await user.clear(firstNameField());
    await user.click(saveButton());

    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('drops a field the instance has disabled, and opens on the one that remains', async () => {
    renderView({ firstNameAttribute: { enabled: false } });

    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument();
    await waitFor(() => expect(lastNameField()).toHaveFocus());
  });

  it('asks to close from cancel', async () => {
    const user = userEvent.setup();
    const props = renderView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(props.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('announces the failure in a negative banner and marks the blamed field invalid', async () => {
    const user = userEvent.setup();
    renderView({
      onSubmit: () =>
        Promise.reject(
          new SaveError({
            global: { message: 'Your name could not be updated.' },
            fields: { lastName: { message: 'Last name must be 64 characters or fewer.' } },
          }),
        ),
    });

    await user.type(lastNameField(), 'x');
    await user.click(saveButton());

    const banner = await screen.findByRole('alert');
    expect(banner).toHaveAttribute('data-color', 'negative');
    expect(banner).toHaveTextContent('Your name could not be updated.');
    expect(lastNameField()).toHaveAccessibleDescription('Last name must be 64 characters or fewer.');
    expect(lastNameField()).toHaveAttribute('aria-invalid', 'true');
    expect(firstNameField()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('stays inert while the save runs', async () => {
    const user = userEvent.setup();
    const props = renderView({ onSubmit: vi.fn(() => new Promise<void>(() => {})) });

    await user.type(firstNameField(), 'x');
    await user.click(saveButton());

    expect(firstNameField()).toBeDisabled();
    expect(saveButton()).toHaveAttribute('aria-busy', 'true');
    await user.click(saveButton());
    expect(props.onSubmit).toHaveBeenCalledOnce();
  });
});
