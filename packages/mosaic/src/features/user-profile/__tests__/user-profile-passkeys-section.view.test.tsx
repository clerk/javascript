import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfilePasskey, UserProfilePasskeysSectionViewProps } from '../user-profile-passkeys-section.view';
import { UserProfilePasskeysSectionView } from '../user-profile-passkeys-section.view';

const passkeys: UserProfilePasskey[] = [
  { id: 'laptop', name: 'MacBook' },
  { id: 'phone', name: 'iPhone' },
];

function renderView(overrides: Partial<UserProfilePasskeysSectionViewProps> = {}) {
  const props: UserProfilePasskeysSectionViewProps = {
    passkeys,
    onAdd: vi.fn(),
    onRename: vi.fn(),
    onRemove: vi.fn(),
    ...overrides,
  };
  return render(
    <MosaicProvider>
      <UserProfilePasskeysSectionView {...props} />
    </MosaicProvider>,
  );
}

describe('passkeys section', () => {
  it('hides existing passkeys and their actions when the caller hides the section', () => {
    renderView({ isVisible: false, sectionTitle: 'Authentication' });

    expect(screen.queryByRole('heading', { name: 'Authentication' })).not.toBeInTheDocument();
    expect(screen.queryByText('Passkeys')).not.toBeInTheDocument();
    expect(screen.queryByText('MacBook')).not.toBeInTheDocument();
    expect(screen.queryByText('iPhone')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('confirms the selected passkey and returns focus on cancellation', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <MosaicProvider>
        <UserProfilePasskeysSectionView
          passkeys={passkeys}
          onRemove={onRemove}
        />
      </MosaicProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Manage MacBook' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('MacBook will be removed from this account.');
    expect(onRemove).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Manage MacBook' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Manage iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleDescription('iPhone will be removed from this account.');
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('phone');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it('renames through a prefilled form, preserves the draft after failure, and retries', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn().mockRejectedValueOnce(new Error('Try again')).mockResolvedValueOnce(undefined);
    render(
      <MosaicProvider>
        <UserProfilePasskeysSectionView
          passkeys={passkeys}
          onRename={onRename}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Manage MacBook' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    const input = screen.getByRole('textbox', { name: 'Passkey name' });
    expect(input).toHaveValue('MacBook');
    await waitFor(() => expect(input).toHaveFocus());
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-disabled', 'true');
    await user.clear(input);
    await user.type(input, 'Work laptop');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Try again');
    expect(input).toHaveValue('Work laptop');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onRename).toHaveBeenLastCalledWith('laptop', 'Work laptop');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps an empty section visible when Add is unavailable', () => {
    renderView({ passkeys: [], onAdd: undefined, sectionTitle: 'Authentication' });

    expect(screen.getByRole('heading', { name: 'Authentication' })).toBeVisible();
    expect(screen.getByText('Passkeys')).toBeVisible();
    expect(screen.getByText('No passkeys added')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).not.toBeInTheDocument();
  });

  it('keeps Add available with an empty list and creation error', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderView({ passkeys: [], onAdd, addError: 'Could not create passkey' });

    expect(screen.getByRole('alert')).toHaveTextContent('Could not create passkey');
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('finishes removing the final passkey after pending work and keeps Add available', async () => {
    const user = userEvent.setup();
    let finish = () => {};
    const pending = new Promise<void>(resolve => {
      finish = resolve;
    });
    function Example() {
      const [items, setItems] = useState([passkeys[0]]);
      return (
        <MosaicProvider>
          <UserProfilePasskeysSectionView
            passkeys={items}
            onAdd={() => setItems([passkeys[0]])}
            onRemove={async () => {
              await pending;
              setItems([]);
            }}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Manage MacBook' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    await user.click(screen.getByRole('button', { name: 'Remove', exact: true }));
    expect(screen.getByRole('button', { name: 'Remove', exact: true })).toHaveAttribute('aria-busy', 'true');
    await act(async () => {
      finish();
      await pending;
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByText('MacBook')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    expect(screen.getByText('MacBook')).toBeVisible();
  });

  it('retries removal for the same passkey after a failure', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn().mockRejectedValueOnce(new Error('Removal failed')).mockResolvedValueOnce(undefined);
    render(
      <MosaicProvider>
        <UserProfilePasskeysSectionView
          passkeys={passkeys}
          onRemove={onRemove}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Manage iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    await user.click(screen.getByRole('button', { name: 'Remove', exact: true }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Removal failed');
    await user.click(screen.getByRole('button', { name: 'Remove', exact: true }));
    expect(onRemove.mock.calls).toEqual([['phone'], ['phone']]);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it('preserves literal passkey names in menu labels and removal copy', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfilePasskeysSectionView
          passkeys={[{ id: 'special', name: '$& laptop' }]}
          onRemove={vi.fn()}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Manage $& laptop' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('$& laptop will be removed from this account.');
  });

  it('keeps rename pending until saving finishes', async () => {
    const user = userEvent.setup();
    let finish = () => {};
    const onRename = vi.fn(
      () =>
        new Promise<void>(resolve => {
          finish = resolve;
        }),
    );
    render(
      <MosaicProvider>
        <UserProfilePasskeysSectionView
          passkeys={passkeys}
          onRename={onRename}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Manage MacBook' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    const input = screen.getByRole('textbox', { name: 'Passkey name' });
    await user.clear(input);
    await user.type(input, 'Work laptop');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-busy', 'true');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await act(() => finish());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onRename).toHaveBeenCalledExactlyOnceWith('laptop', 'Work laptop');
  });
});
