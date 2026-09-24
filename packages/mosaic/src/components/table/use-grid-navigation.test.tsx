import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Menu } from '../menu';
import { Table } from './table';

const people = ['Kyle', 'Austin', 'Colin'];

function Grid({ rows = people }: { rows?: string[] }) {
  return (
    <>
      <button type='button'>Before</button>
      <Table.Root
        grid
        aria-label='Members'
      >
        <Table.Header>
          <Table.Row>
            <Table.SelectAllCell aria-label='Select all' />
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Role</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
            <Table.HeaderCell>Note</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map(name => (
            <Table.Row key={name}>
              <Table.SelectCell aria-label={`Select ${name}`} />
              <Table.Cell>{name}</Table.Cell>
              <Table.Cell>
                <Menu.Root>
                  <Menu.Trigger>{`${name} role`}</Menu.Trigger>
                  <Menu.Popup>
                    <Menu.Item label='Admin'>
                      <Menu.Label>Admin</Menu.Label>
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Root>
              </Table.Cell>
              <Table.Cell>
                <button type='button'>{`Edit ${name}`}</button>
                <button type='button'>{`Remove ${name}`}</button>
              </Table.Cell>
              <Table.Cell>
                <input aria-label={`${name} note`} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <button type='button'>After</button>
    </>
  );
}

const focused = () => document.activeElement as HTMLElement;

describe('Table grid navigation', () => {
  it('is a grid with a single tab stop', async () => {
    const user = userEvent.setup();
    render(<Grid />);
    expect(screen.getByRole('grid', { name: 'Members' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('moves between cells with the arrow keys, focusing a lone control or the cell', async () => {
    const user = userEvent.setup();
    render(<Grid />);
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('checkbox', { name: 'Select Kyle' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(focused().tagName).toBe('TD');
    expect(focused()).toHaveTextContent('Kyle');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Kyle role' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Austin role' })).toHaveFocus();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(focused()).toHaveTextContent('Role');
  });

  it('jumps along a row with Home and End, and to the corners with Ctrl', async () => {
    const user = userEvent.setup();
    render(<Grid />);
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    await user.keyboard('{ArrowDown}{End}');
    expect(focused()).toContainElement(screen.getByRole('textbox', { name: 'Kyle note' }));
    await user.keyboard('{Home}');
    expect(screen.getByRole('checkbox', { name: 'Select Kyle' })).toHaveFocus();
    await user.keyboard('{Control>}{End}{/Control}');
    expect(focused()).toContainElement(screen.getByRole('textbox', { name: 'Colin note' }));
    await user.keyboard('{Control>}{Home}{/Control}');
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveFocus();
  });

  it('returns to the last focused cell when tabbed back into', async () => {
    const user = userEvent.setup();
    render(<Grid />);
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}{ArrowRight}');
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Austin role' })).toHaveFocus();
  });

  it('enters a cell of several controls with Enter and leaves it with Escape', async () => {
    const user = userEvent.setup();
    render(<Grid />);
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowRight}{ArrowRight}{ArrowRight}');
    const cell = focused();
    expect(cell).toContainElement(screen.getByRole('button', { name: 'Edit Kyle' }));
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Edit Kyle' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remove Kyle' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Remove Kyle' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(cell).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(focused()).toContainElement(screen.getByRole('button', { name: 'Edit Austin' }));
  });

  it('leaves the arrow keys to a text field once entered', async () => {
    const user = userEvent.setup();
    render(<Grid />);
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    await user.keyboard('{ArrowDown}{End}{F2}');
    const input = screen.getByRole('textbox', { name: 'Kyle note' });
    expect(input).toHaveFocus();
    await user.keyboard('hi{ArrowLeft}{ArrowDown}');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('hi');
  });

  it('opens a cell menu with Enter and keeps its arrow keys', async () => {
    const user = userEvent.setup();
    render(<Grid />);
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowRight}{ArrowRight}{Enter}');
    const item = await screen.findByRole('menuitem', { name: 'Admin' });
    await waitFor(() => expect(item).toHaveFocus());
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('menuitem', { name: 'Admin' })).toBeInTheDocument();
  });

  it('keeps a tab stop when the focused row is removed', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Grid />);
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    await user.keyboard('{Control>}{End}{/Control}');
    rerender(<Grid rows={['Kyle', 'Austin']} />);
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(focused()).toContainElement(screen.getByRole('textbox', { name: 'Austin note' }));
  });

  it('leaves a plain table alone', () => {
    render(
      <Table.Root aria-label='Plain'>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <button type='button'>Inside</button>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    );
    const table = screen.getByRole('table', { name: 'Plain' });
    expect(table).not.toHaveAttribute('role');
    expect(screen.getByRole('button', { name: 'Inside' })).not.toHaveAttribute('tabindex');
  });
});
