import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../../components/button';
import { MosaicProvider } from '../../MosaicProvider';
import type { UserProfileEditUsernameViewProps } from '../user-profile-account-section/user-profile-edit-username.view';
import { UserProfileEditUsernameView } from '../user-profile-account-section/user-profile-edit-username.view';

function renderView(overrides: Partial<UserProfileEditUsernameViewProps> = {}) {
  const props: UserProfileEditUsernameViewProps = {
    open: true,
    onOpenChange: vi.fn(),
    username: 'prestonxyz',
    onUsernameChange: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
  return {
    props,
    ...render(
      <MosaicProvider>
        <UserProfileEditUsernameView {...props} />
      </MosaicProvider>,
    ),
  };
}

const usernameField = () => screen.getByLabelText('Username');
const saveButton = () => screen.getByRole('button', { name: 'Save changes' });

describe('UserProfileEditUsernameView', () => {
  it('renders nothing until the caller opens it', () => {
    renderView({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('names the dialog and shows the value it was given', () => {
    renderView();

    expect(screen.getByRole('dialog', { name: 'Edit username' })).toBeInTheDocument();
    expect(usernameField()).toHaveValue('prestonxyz');
  });

  it('opens on the field rather than the corner dismiss', async () => {
    renderView();

    // `FloatingFocusManager` moves focus in an effect, hence the wait.
    await waitFor(() => expect(usernameField()).toHaveFocus());
  });

  it('asks to open from the trigger', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderView({ open: false, onOpenChange, trigger: <Button>Edit username</Button> });

    await user.click(screen.getByRole('button', { name: 'Edit username' }));

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('reports each keystroke, holding nothing itself', async () => {
    const onUsernameChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onUsernameChange });

    await user.type(usernameField(), 'x');

    expect(onUsernameChange).toHaveBeenCalledWith('prestonxyzx');
    // Controlled: the rendered value only moves when the caller says so.
    expect(usernameField()).toHaveValue('prestonxyz');
  });

  it('submits from the action and from enter in the field', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderView({ onSubmit });

    await user.click(saveButton());
    // One field, so native implicit submission carries Enter with no submit button in the form.
    await user.type(usernameField(), '{Enter}');

    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('asks to close from cancel', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onOpenChange });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('announces the failure in a negative banner', () => {
    renderView({ error: { message: 'Your username could not be updated.' } });

    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('data-color', 'negative');
    expect(banner).toHaveTextContent('Your username could not be updated.');
    expect(usernameField()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('renders a field-scoped failure with no banner', () => {
    renderView({ error: { fields: { username: 'That username is taken.' } } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('That username is taken.')).toBeInTheDocument();
    expect(usernameField()).toHaveAttribute('aria-invalid', 'true');
  });

  it('withholds the save while the caller says the value is unacceptable', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderView({ canSave: false, onSubmit });

    // Inert but still reachable, so the reason stays discoverable by keyboard.
    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
    await user.click(saveButton());
    await user.type(usernameField(), '{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('stays inert while the save runs', async () => {
    const onSubmit = vi.fn();
    const onUsernameChange = vi.fn();
    const user = userEvent.setup();
    renderView({ isSaving: true, onSubmit, onUsernameChange });

    await user.type(usernameField(), 'ada');

    expect(usernameField()).toBeDisabled();
    expect(onUsernameChange).not.toHaveBeenCalled();
    // Busy, not unavailable: the pending affordance is `isPending`, not a second disabled state.
    expect(saveButton()).toHaveAttribute('aria-busy', 'true');
    await user.click(saveButton());
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
