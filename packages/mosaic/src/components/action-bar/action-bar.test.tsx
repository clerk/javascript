import * as stylex from '@stylexjs/stylex';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Dialog } from '../dialog';
import { Menu } from '../menu';
import { ActionBar } from './action-bar';

const testStyles = stylex.create({
  positioner: {
    bottom: '20px',
  },
});

function BulkActions({ open = true, onDismiss }: { open?: boolean; onDismiss?: () => void }) {
  const tableRef = React.useRef<HTMLTableElement>(null);
  return (
    <>
      <table
        ref={tableRef}
        id='members'
      >
        <tbody>
          <tr>
            <td>
              <input
                type='checkbox'
                aria-label='Select Kyle'
              />
            </td>
          </tr>
        </tbody>
      </table>
      <ActionBar.Root
        open={open}
        anchor={tableRef}
        aria-label='Bulk actions'
        aria-controls='members'
      >
        <ActionBar.Count>3 selected</ActionBar.Count>
        <ActionBar.Separator />
        <ActionBar.Action>Change role</ActionBar.Action>
        <ActionBar.Action>Remove</ActionBar.Action>
        <ActionBar.Separator />
        <ActionBar.Dismiss onClick={onDismiss} />
      </ActionBar.Root>
      <button type='button'>After</button>
    </>
  );
}

function useAnchor() {
  return React.useRef<HTMLDivElement>(null);
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 40));
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024);
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Mosaic ActionBar', () => {
  it('renders a labelled toolbar tied to its table and described by its count', () => {
    render(<BulkActions />);
    const bar = screen.getByRole('toolbar', { name: 'Bulk actions' });
    expect(bar).toHaveClass('cl-action-bar');
    expect(bar).toHaveAttribute('data-open', 'true');
    expect(bar).toHaveAttribute('aria-controls', 'members');
    expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(bar).toHaveAccessibleDescription('3 selected');
    expect(screen.getByText('3 selected')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getAllByRole('separator')).toHaveLength(2);
  });

  it('marks the bar inert while closed', () => {
    render(<BulkActions open={false} />);
    const bar = screen.getByRole('toolbar', { name: 'Bulk actions', hidden: true });
    expect(bar).toHaveAttribute('data-open', 'false');
    expect(bar.inert).toBe(true);
  });

  it('styles the positioner independently from the bar', () => {
    function Positioned() {
      return (
        <ActionBar.Root
          open
          anchor={useAnchor()}
          aria-label='Bulk actions'
          positionerXstyle={testStyles.positioner}
        />
      );
    }
    render(<Positioned />);
    expect(screen.getByRole('toolbar', { name: 'Bulk actions' }).parentElement).toHaveClass(
      ...(stylex.props(testStyles.positioner).className as string).split(' '),
    );
  });

  it('is a single tab stop', async () => {
    const user = userEvent.setup();
    render(<BulkActions />);
    await user.click(screen.getByRole('checkbox', { name: 'Select Kyle' }));
    await user.tab();
    expect(screen.getByRole('button', { name: 'Change role' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('moves between controls with the arrow keys, Home, and End', async () => {
    const user = userEvent.setup();
    render(<BulkActions />);
    await user.click(screen.getByRole('checkbox', { name: 'Select Kyle' }));
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Remove' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Clear selection' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Change role' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Clear selection' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Change role' })).toHaveFocus();
  });

  it('returns to the last focused control when tabbed back into', async () => {
    const user = userEvent.setup();
    render(<BulkActions />);
    await user.click(screen.getByRole('checkbox', { name: 'Select Kyle' }));
    await user.tab();
    await user.keyboard('{ArrowRight}');
    await user.tab({ shift: true });
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remove' })).toHaveFocus();
  });

  it('leaves arrow keys inside a portalled menu to the menu', async () => {
    const user = userEvent.setup();
    function WithMenu() {
      return (
        <ActionBar.Root
          open
          anchor={useAnchor()}
          aria-label='Bulk actions'
        >
          <Menu.Root>
            <Menu.Trigger render={<ActionBar.Action />}>Change role</Menu.Trigger>
            <Menu.Popup>
              <Menu.Item label='Admin'>
                <Menu.Label>Admin</Menu.Label>
              </Menu.Item>
            </Menu.Popup>
          </Menu.Root>
          <ActionBar.Action>Remove</ActionBar.Action>
        </ActionBar.Root>
      );
    }
    render(<WithMenu />);
    await user.click(screen.getByRole('button', { name: 'Change role' }));
    const item = await screen.findByRole('menuitem', { name: 'Admin' });
    item.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Remove' })).not.toHaveFocus();
  });

  it('returns focus to where it came from when the bar closes around it', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [open, setOpen] = React.useState(true);
      return (
        <BulkActions
          open={open}
          onDismiss={() => setOpen(false)}
        />
      );
    }
    render(<Harness />);
    const checkbox = screen.getByRole('checkbox', { name: 'Select Kyle' });
    await user.click(checkbox);
    await user.tab();
    await user.keyboard('{End}{Enter}');
    expect(checkbox).toHaveFocus();
  });

  it('dismisses with a labelled button', async () => {
    const onDismiss = vi.fn();
    render(<BulkActions onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
  describe('with a menu', () => {
    function ChangeRole() {
      const [selected, setSelected] = React.useState(true);
      const selectAllRef = React.useRef<HTMLInputElement>(null);
      return (
        <>
          <input
            ref={selectAllRef}
            type='checkbox'
            aria-label='Select all'
          />
          <ActionBar.Root
            open={selected}
            anchor={selectAllRef}
            aria-label='Bulk actions'
            returnFocus={selectAllRef}
          >
            <Menu.Root>
              <Menu.Trigger render={<ActionBar.Action />}>Change role</Menu.Trigger>
              <Menu.Popup>
                <Menu.Item
                  label='Admin'
                  onClick={() => setSelected(false)}
                >
                  <Menu.Label>Admin</Menu.Label>
                </Menu.Item>
              </Menu.Popup>
            </Menu.Root>
            <ActionBar.Action>Remove</ActionBar.Action>
          </ActionBar.Root>
          <button type='button'>After</button>
        </>
      );
    }

    it('sends focus to returnFocus when a menu item closes the bar', async () => {
      const user = userEvent.setup();
      render(<ChangeRole />);
      await user.click(screen.getByRole('checkbox', { name: 'Select all' }));
      await user.tab();
      await user.keyboard('{Enter}');
      await screen.findByRole('menuitem', { name: 'Admin' });
      await user.keyboard('{Enter}');
      await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveFocus());
      expect(screen.getByRole('toolbar', { hidden: true }).inert).toBe(true);
    });

    it('lets Tab leave an open menu and Shift+Tab come back to the bar', async () => {
      const user = userEvent.setup();
      render(<ChangeRole />);
      await user.click(screen.getByRole('checkbox', { name: 'Select all' }));
      await user.tab();
      await user.keyboard('{Enter}');
      await screen.findByRole('menuitem', { name: 'Admin' });
      await user.tab();
      await waitFor(() => expect(screen.getByRole('button', { name: 'After' })).toHaveFocus());
      await user.tab({ shift: true });
      expect(screen.getByRole('button', { name: 'Change role' })).toHaveFocus();
    });
  });

  describe('with a confirmation dialog', () => {
    function ConfirmRemove() {
      const [selected, setSelected] = React.useState(true);
      const [confirming, setConfirming] = React.useState(false);
      const selectRef = React.useRef<HTMLInputElement>(null);
      return (
        <>
          <input
            ref={selectRef}
            type='checkbox'
            aria-label='Select Kyle'
          />
          <ActionBar.Root
            open={selected}
            anchor={selectRef}
            aria-label='Bulk actions'
            returnFocus={selectRef}
          >
            <Dialog.Root
              open={confirming}
              onOpenChange={setConfirming}
              role='alertdialog'
            >
              <Dialog.Trigger render={<ActionBar.Action color='negative' />}>Remove</Dialog.Trigger>
              <Dialog.Popup>
                <Dialog.Close>Cancel</Dialog.Close>
                <button
                  type='button'
                  onClick={() => {
                    setSelected(false);
                    setConfirming(false);
                  }}
                >
                  Confirm
                </button>
              </Dialog.Popup>
            </Dialog.Root>
          </ActionBar.Root>
        </>
      );
    }

    it('returns focus to the bar when the dialog is cancelled', async () => {
      const user = userEvent.setup();
      render(<ConfirmRemove />);
      await user.click(screen.getByRole('checkbox', { name: 'Select Kyle' }));
      await user.tab();
      await user.keyboard('{Enter}');
      await user.click(await screen.findByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.getByRole('button', { name: 'Remove' })).toHaveFocus());
    });

    it('sends focus to returnFocus when the dialog confirms', async () => {
      const user = userEvent.setup();
      render(<ConfirmRemove />);
      await user.click(screen.getByRole('checkbox', { name: 'Select Kyle' }));
      await user.tab();
      await user.keyboard('{Enter}');
      await user.click(await screen.findByRole('button', { name: 'Confirm' }));
      await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Select Kyle' })).toHaveFocus());
    });
  });
});
