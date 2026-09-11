import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../../components/button';
import { MosaicProvider } from '../../MosaicProvider';
import type { UserProfileEditNameViewProps } from '../user-profile-account-section/user-profile-edit-name.view';
import { UserProfileEditNameView } from '../user-profile-account-section/user-profile-edit-name.view';

function renderView(overrides: Partial<UserProfileEditNameViewProps> = {}) {
  const props: UserProfileEditNameViewProps = {
    open: true,
    onOpenChange: vi.fn(),
    firstName: 'Preston',
    lastName: 'Booth',
    onFirstNameChange: vi.fn(),
    onLastNameChange: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };
  return {
    props,
    ...render(
      <MosaicProvider>
        <UserProfileEditNameView {...props} />
      </MosaicProvider>,
    ),
  };
}

const firstNameField = () => screen.getByLabelText('First name');
const lastNameField = () => screen.getByLabelText('Last name');
const saveButton = () => screen.getByRole('button', { name: 'Save changes' });

describe('UserProfileEditNameView', () => {
  it('renders nothing until the caller opens it', () => {
    renderView({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('names the dialog and shows the values it was given', () => {
    renderView();

    expect(screen.getByRole('dialog', { name: 'Edit name' })).toBeInTheDocument();
    expect(firstNameField()).toHaveValue('Preston');
    expect(lastNameField()).toHaveValue('Booth');
  });

  it('opens on the first name rather than the corner dismiss', async () => {
    renderView();

    // `FloatingFocusManager` moves focus in an effect, hence the wait.
    await waitFor(() => expect(firstNameField()).toHaveFocus());
  });

  it('asks to open from the trigger', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderView({ open: false, onOpenChange, trigger: <Button>Edit name</Button> });

    await user.click(screen.getByRole('button', { name: 'Edit name' }));

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('reports each keystroke to its own field, holding nothing itself', async () => {
    const onFirstNameChange = vi.fn();
    const onLastNameChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onFirstNameChange, onLastNameChange });

    await user.type(firstNameField(), 'x');
    await user.type(lastNameField(), 'y');

    expect(onFirstNameChange).toHaveBeenCalledWith('Prestonx');
    expect(onLastNameChange).toHaveBeenCalledWith('Boothy');
    // Controlled: the rendered value only moves when the caller says so.
    expect(firstNameField()).toHaveValue('Preston');
  });

  it('submits from the action, without validating', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    renderView({ firstName: '', onSave });

    await user.click(saveButton());

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('renders both fields optional and enabled unless told otherwise', () => {
    renderView();

    expect(firstNameField()).not.toBeRequired();
    expect(lastNameField()).not.toBeRequired();
  });

  it('marks a field required from its attribute', () => {
    renderView({ firstNameAttribute: { required: true } });

    expect(firstNameField()).toBeRequired();
    expect(lastNameField()).not.toBeRequired();
  });

  it('holds the submit while a required field is empty', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    renderView({ firstName: '', firstNameAttribute: { required: true }, onSave });

    await user.click(saveButton());

    expect(onSave).not.toHaveBeenCalled();
  });

  it('drops a field the instance has disabled, and opens on the one that remains', async () => {
    renderView({ firstNameAttribute: { enabled: false } });

    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument();
    await waitFor(() => expect(lastNameField()).toHaveFocus());
  });

  it('asks to close from cancel', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onOpenChange });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('announces the failure in a negative banner and marks the blamed field invalid', () => {
    renderView({
      error: {
        message: 'Your name could not be updated.',
        fields: { lastName: 'Last name must be 64 characters or fewer.' },
      },
    });

    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('data-color', 'negative');
    expect(banner).toHaveTextContent('Your name could not be updated.');
    expect(screen.getByText('Last name must be 64 characters or fewer.')).toBeInTheDocument();
    expect(lastNameField()).toHaveAttribute('aria-invalid', 'true');
    expect(firstNameField()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('renders a field-scoped failure with no banner', () => {
    renderView({ error: { fields: { firstName: 'First name is required.' } } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(firstNameField()).toHaveAttribute('aria-invalid', 'true');
  });

  it('stays inert while the save runs', async () => {
    const onSave = vi.fn();
    const onFirstNameChange = vi.fn();
    const user = userEvent.setup();
    renderView({ isSaving: true, onSave, onFirstNameChange });

    await user.type(firstNameField(), 'Ada');

    expect(firstNameField()).toBeDisabled();
    expect(onFirstNameChange).not.toHaveBeenCalled();
    // Busy, not unavailable: the pending affordance is `isPending`, not a second disabled state.
    expect(saveButton()).toHaveAttribute('aria-busy', 'true');
    await user.click(saveButton());
    expect(onSave).not.toHaveBeenCalled();
  });
});
