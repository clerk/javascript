import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, useState } from 'react';
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';

import { Menu } from '../menu';
import { axe } from '../test-utils/axe';
import { Table, type TableRootProps, type TableRowProps, type TableSort } from './index';

afterEach(() => cleanup());

type Log = { id: string; message: string; children?: Log[] };

const LOGS: Log[] = [
  {
    id: 'a',
    message: 'Alpha',
    children: [
      { id: 'a1', message: 'Alpha one' },
      { id: 'a2', message: 'Alpha two' },
    ],
  },
  { id: 'b', message: 'Bravo' },
  { id: 'c', message: 'Charlie' },
];

const FLAT_LOGS = LOGS.map(({ id, message }) => ({ id, message }));

const LOGS_WITH_GRANDCHILDREN: Log[] = [
  {
    id: 'a',
    message: 'Alpha',
    children: [{ id: 'a1', message: 'Alpha one', children: [{ id: 'a1x', message: 'Alpha one retry' }] }],
  },
  { id: 'b', message: 'Bravo' },
];

const toValue = (log: Log) => log.id;
const toChildren = (log: Log) => log.children;

function LogsTable({
  items = FLAT_LOGS,
  tree = false,
  rowProps,
  renderEmptyState,
  sortable = false,
  ...rootProps
}: TableRootProps & {
  items?: Log[];
  tree?: boolean;
  rowProps?: (log: Log) => TableRowProps;
  renderEmptyState?: () => ReactNode;
  sortable?: boolean;
}) {
  const selectable = (rootProps.selectionMode ?? 'none') !== 'none';
  return (
    <>
      <button type='button'>Before</button>
      <Table.Root
        aria-label='Logs'
        {...rootProps}
      >
        <Table.Header>
          {selectable ? (
            <Table.Column>
              <Table.SelectionCheckbox aria-label='Select all' />
            </Table.Column>
          ) : null}
          <Table.Column
            value='message'
            sortable={sortable}
            rowHeader
          >
            Message
          </Table.Column>
          <Table.Column>Actions</Table.Column>
        </Table.Header>
        <Table.Body
          items={items}
          itemToStringValue={toValue}
          itemToChildren={tree ? toChildren : undefined}
          renderEmptyState={renderEmptyState}
        >
          {log => (
            <Table.Row {...rowProps?.(log)}>
              {selectable ? (
                <Table.Cell>
                  <Table.SelectionCheckbox aria-label='Select' />
                </Table.Cell>
              ) : null}
              <Table.Cell>
                <Table.ExpandButton aria-label='Expand' />
                {log.message}
              </Table.Cell>
              <Table.Cell>
                <button type='button'>{`Copy ${log.message}`}</button>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
      <button type='button'>After</button>
    </>
  );
}

const row = (name: string) => {
  const tableRow = screen.getByText(name).closest('tr');
  if (!tableRow) {
    throw new Error(`No row for ${name}`);
  }
  return tableRow;
};
const firstCell = (name: string) => row(name).cells[0];
const checkbox = (name: string) => screen.getByRole('checkbox', { name: `Select ${name}` });
const focused = () => document.activeElement;

async function tabIntoTable(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Before' }));
  await user.tab();
}

describe('Table', () => {
  describe('role', () => {
    it('is a plain table with no tab stops when nothing is interactive', () => {
      render(<LogsTable />);

      expect(screen.getByRole('table', { name: 'Logs' })).not.toHaveAttribute('role');
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(row('Alpha')).not.toHaveAttribute('tabindex');
      expect(screen.getByRole('button', { name: 'Copy Alpha' })).not.toHaveAttribute('tabindex');
    });

    it('is a grid when rows can be selected', () => {
      render(<LogsTable selectionMode='multiple' />);

      expect(screen.getByRole('grid', { name: 'Logs' })).toBeInTheDocument();
    });

    it('is a grid when a row has an action', () => {
      render(<LogsTable rowProps={log => (log.id === 'b' ? { onClick: () => {} } : {})} />);

      expect(screen.getByRole('grid', { name: 'Logs' })).toBeInTheDocument();
    });

    it('is a treegrid when rows can expand', () => {
      render(
        <LogsTable
          items={LOGS}
          tree
        />,
      );

      expect(screen.getByRole('treegrid', { name: 'Logs' })).toBeInTheDocument();
    });
  });

  describe('labels', () => {
    it('labels each row by its row header cell', () => {
      render(<LogsTable selectionMode='multiple' />);

      expect(screen.getByRole('rowheader', { name: 'Bravo' })).toBe(firstCell('Bravo').nextElementSibling);
      expect(row('Bravo')).toHaveAccessibleName('Bravo');
    });

    it('names the selection checkboxes from their aria-label and the row header', () => {
      render(<LogsTable selectionMode='multiple' />);

      expect(screen.getByRole('checkbox', { name: 'Select all' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Select Bravo' })).toBeInTheDocument();
    });

    it('names the expand button from its aria-label and the row header, and reports its state', async () => {
      const user = userEvent.setup();
      render(
        <LogsTable
          items={LOGS}
          tree
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Expand Alpha' }));

      expect(screen.getByRole('button', { name: 'Expand Alpha' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('adds no text of its own to the checkbox and expand button names', () => {
      render(
        <Table.Root
          aria-label='Logs'
          selectionMode='multiple'
        >
          <Table.Header>
            <Table.Column>
              <Table.SelectionCheckbox />
            </Table.Column>
            <Table.Column rowHeader>Message</Table.Column>
          </Table.Header>
          <Table.Body
            items={LOGS}
            itemToStringValue={toValue}
            itemToChildren={toChildren}
          >
            {log => (
              <Table.Row>
                <Table.Cell>
                  <Table.SelectionCheckbox />
                </Table.Cell>
                <Table.Cell>
                  <Table.ExpandButton />
                  {log.message}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>,
      );

      const [selectAll, selectAlpha] = screen.getAllByRole('checkbox');
      expect(selectAll).toHaveAccessibleName('');
      expect(selectAlpha).toHaveAccessibleName('Alpha');
      expect(screen.getByRole('button')).toHaveAccessibleName('Alpha');
    });
  });

  describe('row actions', () => {
    it('calls onClick when the row is clicked, but not from a nested control or portaled content', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<LogsTable rowProps={() => ({ onClick })} />);

      await user.click(screen.getByRole('button', { name: 'Copy Bravo' }));
      expect(onClick).not.toHaveBeenCalled();

      await user.click(screen.getByText('Bravo'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('ignores clicks from portaled content rendered inside the row', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Table.Root aria-label='Logs'>
          <Table.Body
            items={FLAT_LOGS.slice(0, 1)}
            itemToStringValue={toValue}
          >
            {() => (
              <Table.Row onClick={onClick}>
                <Table.Cell>
                  <Menu.Root>
                    <Menu.Trigger>Actions</Menu.Trigger>
                    <Menu.Portal>
                      <Menu.Positioner>
                        <Menu.Popup>
                          <Menu.Item label='Archive'>Archive</Menu.Item>
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.Root>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>,
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      await user.click(await screen.findByRole('menuitem', { name: 'Archive' }));

      expect(onClick).not.toHaveBeenCalled();
    });

    it('runs the action with Enter on a focused row or cell', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<LogsTable rowProps={() => ({ onClick })} />);

      await tabIntoTable(user);
      expect(row('Alpha')).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);

      await user.keyboard('{ArrowRight}');
      expect(firstCell('Alpha')).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('follows href with the same modifier keys, target, rel and download', async () => {
      const user = userEvent.setup();
      const clicks: Array<{ href: string; target: string; rel: string; download: string | null; meta: boolean }> = [];
      const onDocumentClick = (event: MouseEvent) => {
        if (event.target instanceof HTMLAnchorElement) {
          event.preventDefault();
          clicks.push({
            href: event.target.getAttribute('href') ?? '',
            target: event.target.target,
            rel: event.target.rel,
            download: event.target.getAttribute('download'),
            meta: event.metaKey,
          });
        }
      };
      document.addEventListener('click', onDocumentClick);
      render(
        <LogsTable
          rowProps={log =>
            log.id === 'a'
              ? { href: '/logs/a' }
              : { href: `/logs/${log.id}`, target: '_blank', rel: 'noreferrer', download: 'log.json' }
          }
        />,
      );

      await user.click(screen.getByText('Alpha'));
      await user.keyboard('{Meta>}');
      await user.click(screen.getByText('Alpha'));
      await user.keyboard('{/Meta}');
      await user.click(screen.getByText('Bravo'));
      document.removeEventListener('click', onDocumentClick);

      expect(clicks).toEqual([
        { href: '/logs/a', target: '', rel: '', download: null, meta: false },
        { href: '/logs/a', target: '', rel: '', download: null, meta: true },
        { href: '/logs/b', target: '_blank', rel: 'noreferrer', download: 'log.json', meta: false },
      ]);
    });

    it('does not follow href when onClick prevents default', async () => {
      const user = userEvent.setup();
      const onDocumentClick = vi.fn((event: MouseEvent) => event.preventDefault());
      document.addEventListener('click', onDocumentClick);
      render(<LogsTable rowProps={() => ({ href: '/logs', onClick: event => event.preventDefault() })} />);

      await user.click(screen.getByText('Alpha'));
      document.removeEventListener('click', onDocumentClick);

      expect(onDocumentClick).toHaveBeenCalledTimes(1);
    });

    it('does not run the action of a disabled row and skips it in keyboard navigation', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<LogsTable rowProps={log => ({ onClick, disabled: log.id === 'b' })} />);

      expect(row('Bravo')).toHaveAttribute('aria-disabled', 'true');
      await user.click(screen.getByText('Bravo'));
      expect(onClick).not.toHaveBeenCalled();

      await tabIntoTable(user);
      await user.keyboard('{ArrowDown}');
      expect(row('Charlie')).toHaveFocus();
    });
  });

  describe('selection', () => {
    it('toggles selection with the checkbox', async () => {
      const user = userEvent.setup();
      render(<LogsTable selectionMode='multiple' />);

      await user.click(checkbox('Alpha'));
      expect(checkbox('Alpha')).toBeChecked();
      expect(row('Alpha')).toHaveAttribute('aria-selected', 'true');
      expect(row('Bravo')).toHaveAttribute('aria-selected', 'false');

      await user.click(checkbox('Alpha'));
      expect(row('Alpha')).toHaveAttribute('aria-selected', 'false');
    });

    it('toggles selection with Space and selects a range with Shift+Space', async () => {
      const user = userEvent.setup();
      render(<LogsTable selectionMode='multiple' />);

      await tabIntoTable(user);
      await user.keyboard(' ');
      expect(row('Alpha')).toHaveAttribute('aria-selected', 'true');

      await user.keyboard('{ArrowDown}{ArrowDown}{Shift>} {/Shift}');
      expect(row('Bravo')).toHaveAttribute('aria-selected', 'true');
      expect(row('Charlie')).toHaveAttribute('aria-selected', 'true');
    });

    it('selects a range with Shift-click on a checkbox', async () => {
      const user = userEvent.setup();
      render(<LogsTable selectionMode='multiple' />);

      await user.click(checkbox('Alpha'));
      await user.keyboard('{Shift>}');
      await user.click(checkbox('Charlie'));
      await user.keyboard('{/Shift}');

      expect(checkbox('Bravo')).toBeChecked();
    });

    it('toggles selection on row click when the row has no action', async () => {
      const user = userEvent.setup();
      render(<LogsTable selectionMode='multiple' />);

      await user.click(screen.getByText('Bravo'));

      expect(checkbox('Bravo')).toBeChecked();
    });

    it('runs the action on click until a row is selected, then toggles selection', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <LogsTable
          selectionMode='multiple'
          rowProps={() => ({ onClick })}
        />,
      );

      await user.click(screen.getByText('Alpha'));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(checkbox('Alpha')).not.toBeChecked();

      await user.click(checkbox('Alpha'));
      await user.click(screen.getByText('Bravo'));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(checkbox('Bravo')).toBeChecked();

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('does not select a disabled row, including in a range', async () => {
      const user = userEvent.setup();
      render(
        <LogsTable
          selectionMode='multiple'
          rowProps={log => ({ disabled: log.id === 'b' })}
        />,
      );

      expect(checkbox('Bravo')).toBeDisabled();
      expect(row('Bravo')).not.toHaveAttribute('aria-selected');
      await user.click(screen.getByText('Bravo'));
      expect(checkbox('Bravo')).not.toBeChecked();

      await user.click(checkbox('Alpha'));
      await user.keyboard('{Shift>}');
      await user.click(checkbox('Charlie'));
      await user.keyboard('{/Shift}');
      expect(checkbox('Charlie')).toBeChecked();
      expect(checkbox('Bravo')).not.toBeChecked();
    });

    it('drives the select-all checkbox from the selectable rows', async () => {
      const user = userEvent.setup();
      render(
        <LogsTable
          selectionMode='multiple'
          rowProps={log => ({ disabled: log.id === 'b' })}
        />,
      );
      const selectAll = screen.getByRole('checkbox', { name: 'Select all' });

      expect(selectAll).not.toBeChecked();
      await user.click(checkbox('Alpha'));
      expect(selectAll).toHaveProperty('indeterminate', true);

      await user.click(selectAll);
      expect(selectAll).toBeChecked();
      expect(selectAll).toHaveProperty('indeterminate', false);
      expect(checkbox('Charlie')).toBeChecked();
      expect(checkbox('Bravo')).not.toBeChecked();

      await user.click(selectAll);
      expect(checkbox('Alpha')).not.toBeChecked();
    });

    it('replaces the selection in single mode and hides select all', async () => {
      const user = userEvent.setup();
      render(<LogsTable selectionMode='single' />);

      expect(screen.queryByRole('checkbox', { name: 'Select all' })).not.toBeInTheDocument();
      await user.click(checkbox('Alpha'));
      await user.click(checkbox('Bravo'));

      expect(checkbox('Alpha')).not.toBeChecked();
      expect(checkbox('Bravo')).toBeChecked();
    });

    it('selects all with Ctrl+A and clears with Escape', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();
      const onDocumentKeyDown = (event: KeyboardEvent) => onKeyDown(event.key);
      document.addEventListener('keydown', onDocumentKeyDown);
      onTestFinished(() => document.removeEventListener('keydown', onDocumentKeyDown));
      render(<LogsTable selectionMode='multiple' />);

      await tabIntoTable(user);
      await user.keyboard('{Control>}a{/Control}');
      expect(screen.getAllByRole('checkbox').every(box => box instanceof HTMLInputElement && box.checked)).toBe(true);

      await user.keyboard('{Escape}');
      expect(screen.getAllByRole('checkbox').some(box => box instanceof HTMLInputElement && box.checked)).toBe(false);
      expect(onKeyDown).not.toHaveBeenCalledWith('Escape');

      await user.keyboard('{Escape}');
      expect(onKeyDown).toHaveBeenCalledWith('Escape');
    });

    it('starts from defaultSelection and reports changes', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      render(
        <LogsTable
          selectionMode='multiple'
          defaultSelection={['c']}
          onSelectionChange={onSelectionChange}
        />,
      );

      expect(checkbox('Charlie')).toBeChecked();
      await user.click(checkbox('Alpha'));

      expect(onSelectionChange).toHaveBeenLastCalledWith(['c', 'a']);
      expect(checkbox('Alpha')).toBeChecked();
    });

    it('works with a controlled selection', async () => {
      const user = userEvent.setup();
      function Controlled() {
        const [selection, setSelection] = useState(['c']);
        return (
          <>
            <LogsTable
              selectionMode='multiple'
              selection={selection}
              onSelectionChange={setSelection}
            />
            <button
              type='button'
              onClick={() => setSelection([])}
            >
              Clear
            </button>
          </>
        );
      }
      render(<Controlled />);

      expect(checkbox('Charlie')).toBeChecked();
      await user.click(checkbox('Alpha'));
      expect(checkbox('Alpha')).toBeChecked();
      expect(checkbox('Charlie')).toBeChecked();

      await user.click(screen.getByRole('button', { name: 'Clear' }));
      expect(checkbox('Alpha')).not.toBeChecked();
      expect(checkbox('Charlie')).not.toBeChecked();
    });

    it('does not change a controlled selection on its own', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      render(
        <LogsTable
          selectionMode='multiple'
          selection={[]}
          onSelectionChange={onSelectionChange}
        />,
      );

      await user.click(checkbox('Alpha'));

      expect(onSelectionChange).toHaveBeenCalledWith(['a']);
      expect(checkbox('Alpha')).not.toBeChecked();
    });
  });

  describe('tree rows', () => {
    it('describes each row in the tree and renders children only when expanded', async () => {
      const user = userEvent.setup();
      render(
        <LogsTable
          items={LOGS}
          tree
        />,
      );

      expect(row('Alpha')).toHaveAttribute('aria-expanded', 'false');
      expect(row('Alpha')).toHaveAttribute('aria-level', '1');
      expect(row('Alpha')).toHaveAttribute('aria-posinset', '1');
      expect(row('Alpha')).toHaveAttribute('aria-setsize', '3');
      expect(row('Bravo')).not.toHaveAttribute('aria-expanded');
      expect(screen.queryByText('Alpha one')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Expand Bravo' })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Expand Alpha' }));

      expect(row('Alpha')).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('button', { name: 'Expand Alpha' })).toHaveAttribute('aria-expanded', 'true');
      expect(row('Alpha two')).toHaveAttribute('aria-level', '2');
      expect(row('Alpha two')).toHaveAttribute('aria-posinset', '2');
      expect(row('Alpha two')).toHaveAttribute('aria-setsize', '2');
      expect(row('Alpha two').style.getPropertyValue('--table-row-depth')).toBe('1');
    });

    it('keeps the expand button out of the tab order and does not run the row action', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <LogsTable
          items={LOGS}
          tree
          rowProps={() => ({ onClick })}
        />,
      );

      expect(screen.getByRole('button', { name: 'Expand Alpha' })).toHaveAttribute('tabindex', '-1');
      await user.click(screen.getByRole('button', { name: 'Expand Alpha' }));

      expect(onClick).not.toHaveBeenCalled();
    });

    it('expands with the forward arrow, collapses with the back arrow and moves to the parent', async () => {
      const user = userEvent.setup();
      render(
        <LogsTable
          items={LOGS}
          tree
        />,
      );

      await tabIntoTable(user);
      await user.keyboard('{ArrowRight}');
      expect(row('Alpha')).toHaveAttribute('aria-expanded', 'true');
      expect(row('Alpha')).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(firstCell('Alpha')).toHaveFocus();
      await user.keyboard('{ArrowLeft}{ArrowDown}{ArrowDown}');
      expect(row('Alpha two')).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(row('Alpha')).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(row('Alpha')).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Alpha two')).not.toBeInTheDocument();
    });

    it('flips the arrow keys in a right-to-left table', async () => {
      const user = userEvent.setup();
      render(
        <div dir='rtl'>
          <LogsTable
            items={LOGS}
            tree
          />
        </div>,
      );

      await tabIntoTable(user);
      await user.keyboard('{ArrowLeft}');
      expect(row('Alpha')).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{ArrowLeft}');
      expect(firstCell('Alpha')).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('button', { name: 'Copy Alpha' })).toHaveFocus();
    });

    it('starts from defaultExpanded and reports changes', async () => {
      const user = userEvent.setup();
      const onExpandedChange = vi.fn();
      render(
        <LogsTable
          items={LOGS}
          tree
          defaultExpanded={['a']}
          onExpandedChange={onExpandedChange}
        />,
      );

      expect(screen.getByText('Alpha one')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Expand Alpha' }));

      expect(onExpandedChange).toHaveBeenCalledWith([]);
      expect(screen.queryByText('Alpha one')).not.toBeInTheDocument();
    });

    it('works with controlled expanded state', async () => {
      const user = userEvent.setup();
      const onExpandedChange = vi.fn();
      const { rerender } = render(
        <LogsTable
          items={LOGS}
          tree
          expanded={[]}
          onExpandedChange={onExpandedChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Expand Alpha' }));
      expect(onExpandedChange).toHaveBeenCalledWith(['a']);
      expect(screen.queryByText('Alpha one')).not.toBeInTheDocument();

      rerender(
        <LogsTable
          items={LOGS}
          tree
          expanded={['a']}
          onExpandedChange={onExpandedChange}
        />,
      );
      expect(screen.getByText('Alpha one')).toBeInTheDocument();
    });

    it('hides grandchildren with their parent and keeps their expanded state', async () => {
      const user = userEvent.setup();
      render(
        <LogsTable
          items={LOGS_WITH_GRANDCHILDREN}
          tree
          defaultExpanded={['a', 'a1']}
        />,
      );

      expect(row('Alpha one retry')).toHaveAttribute('aria-level', '3');
      await user.click(screen.getByRole('button', { name: 'Expand Alpha' }));
      expect(screen.queryByText('Alpha one')).not.toBeInTheDocument();
      expect(screen.queryByText('Alpha one retry')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Expand Alpha' }));
      expect(screen.getByText('Alpha one retry')).toBeInTheDocument();
    });

    it('lets a row without loaded children expand when it is expandable', async () => {
      const user = userEvent.setup();
      const onExpandedChange = vi.fn();
      render(
        <LogsTable
          items={LOGS}
          tree
          rowProps={log => ({ expandable: log.id === 'b' })}
          onExpandedChange={onExpandedChange}
        />,
      );

      expect(row('Bravo')).toHaveAttribute('aria-expanded', 'false');
      expect(row('Charlie')).not.toHaveAttribute('aria-expanded');
      await user.click(screen.getByRole('button', { name: 'Expand Bravo' }));

      expect(onExpandedChange).toHaveBeenCalledWith(['b']);
      expect(row('Bravo')).toHaveAttribute('aria-expanded', 'true');
    });

    it('moves focus from a child row to its parent when the parent collapses', async () => {
      const user = userEvent.setup();
      render(
        <LogsTable
          items={LOGS}
          tree
          defaultExpanded={['a']}
        />,
      );

      await tabIntoTable(user);
      await user.keyboard('{ArrowDown}{ArrowDown}');
      expect(row('Alpha two')).toHaveFocus();
      await user.click(screen.getByRole('button', { name: 'Expand Alpha' }));

      expect(row('Alpha')).toHaveFocus();
    });
  });

  describe('sorting', () => {
    const header = (name: string) => screen.getByRole('columnheader', { name });

    it('sorts ascending, then flips the direction on each click', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      render(
        <LogsTable
          sortable
          onSortChange={onSortChange}
        />,
      );

      expect(screen.getByRole('grid', { name: 'Logs' })).toBeInTheDocument();
      expect(header('Message')).toHaveAttribute('aria-sort', 'none');
      expect(header('Actions')).not.toHaveAttribute('aria-sort');

      await user.click(header('Message'));
      expect(onSortChange).toHaveBeenLastCalledWith({ column: 'message', direction: 'ascending' });
      expect(header('Message')).toHaveAttribute('aria-sort', 'ascending');
      expect(header('Message')).toHaveAttribute('data-sort-direction', 'ascending');

      await user.click(header('Message'));
      expect(onSortChange).toHaveBeenLastCalledWith({ column: 'message', direction: 'descending' });
      expect(header('Message')).toHaveAttribute('aria-sort', 'descending');

      await user.click(header('Actions'));
      expect(onSortChange).toHaveBeenCalledTimes(2);
    });

    it('starts ascending when another column was sorted', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      render(
        <LogsTable
          sortable
          defaultSort={{ column: 'status', direction: 'descending' }}
          onSortChange={onSortChange}
        />,
      );

      await user.click(header('Message'));

      expect(onSortChange).toHaveBeenCalledWith({ column: 'message', direction: 'ascending' });
    });

    it('sorts with Enter and Space on the focused column header', async () => {
      const user = userEvent.setup();
      render(<LogsTable sortable />);

      await tabIntoTable(user);
      await user.keyboard('{ArrowUp}');
      expect(header('Message')).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(header('Message')).toHaveAttribute('aria-sort', 'ascending');
      await user.keyboard(' ');
      expect(header('Message')).toHaveAttribute('aria-sort', 'descending');
    });

    it('works with a controlled sort', async () => {
      const user = userEvent.setup();
      function Controlled() {
        const [sort, setSort] = useState<TableSort | null>({ column: 'message', direction: 'descending' });
        return (
          <LogsTable
            sortable
            sort={sort}
            onSortChange={setSort}
          />
        );
      }
      render(<Controlled />);

      expect(header('Message')).toHaveAttribute('aria-sort', 'descending');
      await user.click(header('Message'));

      expect(header('Message')).toHaveAttribute('aria-sort', 'ascending');
    });
  });

  describe('empty state', () => {
    it('renders the empty content in one cell that spans every column', () => {
      render(
        <LogsTable
          items={[]}
          selectionMode='multiple'
          renderEmptyState={() => 'No logs'}
        />,
      );

      const cell = screen.getByText('No logs');
      expect(cell.tagName).toBe('TD');
      expect(cell).toHaveAttribute('colspan', '3');
      expect(screen.getByRole('checkbox', { name: 'Select all' })).toBeDisabled();
    });

    it('moves focus to the column headers when tabbing into an empty grid', async () => {
      const user = userEvent.setup();
      render(
        <LogsTable
          items={[]}
          selectionMode='multiple'
          renderEmptyState={() => 'No logs'}
        />,
      );

      await tabIntoTable(user);

      expect(screen.getByRole('checkbox', { name: 'Select all' })).not.toHaveFocus();
      expect(focused()).toBe(screen.getAllByRole('columnheader')[0]);
    });
  });

  describe('keyboard navigation', () => {
    it('has a single tab stop that starts on the first body row', async () => {
      const user = userEvent.setup();
      render(<LogsTable selectionMode='multiple' />);

      await tabIntoTable(user);
      expect(row('Alpha')).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('moves between rows and cells with the arrow keys', async () => {
      const user = userEvent.setup();
      render(<LogsTable selectionMode='multiple' />);

      await tabIntoTable(user);
      await user.keyboard('{ArrowDown}');
      expect(row('Bravo')).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(checkbox('Bravo')).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('rowheader', { name: 'Bravo' })).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: 'Copy Bravo' })).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(row('Bravo')).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('button', { name: 'Copy Bravo' })).toHaveFocus();
      await user.keyboard('{ArrowUp}{ArrowUp}');
      expect(focused()).toHaveTextContent('Actions');
    });

    it('moves from the first row to the first column header', async () => {
      const user = userEvent.setup();
      render(<LogsTable selectionMode='multiple' />);

      await tabIntoTable(user);
      await user.keyboard('{ArrowUp}');

      expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveFocus();
    });

    it('jumps with Home and End, and to the corners with Ctrl', async () => {
      const user = userEvent.setup();
      render(<LogsTable selectionMode='multiple' />);

      await tabIntoTable(user);
      await user.keyboard('{End}');
      expect(row('Charlie')).toHaveFocus();
      await user.keyboard('{Home}');
      expect(row('Alpha')).toHaveFocus();
      await user.keyboard('{ArrowRight}{End}');
      expect(screen.getByRole('button', { name: 'Copy Alpha' })).toHaveFocus();
      await user.keyboard('{Home}');
      expect(checkbox('Alpha')).toHaveFocus();
      await user.keyboard('{Control>}{End}{/Control}');
      expect(screen.getByRole('button', { name: 'Copy Charlie' })).toHaveFocus();
      await user.keyboard('{Control>}{Home}{/Control}');
      expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveFocus();
    });

    it('returns to the last focused item when tabbed back into', async () => {
      const user = userEvent.setup();
      render(<LogsTable selectionMode='multiple' />);

      await tabIntoTable(user);
      await user.keyboard('{ArrowDown}{ArrowRight}{ArrowRight}{ArrowRight}');
      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
      await user.tab({ shift: true });

      expect(screen.getByRole('button', { name: 'Copy Bravo' })).toHaveFocus();
    });

    it('enters a cell of several controls with Enter and leaves it with Escape', async () => {
      const user = userEvent.setup();
      render(
        <Table.Root
          aria-label='Logs'
          selectionMode='single'
        >
          <Table.Body
            items={FLAT_LOGS}
            itemToStringValue={toValue}
          >
            {log => (
              <Table.Row>
                <Table.Cell>
                  <button type='button'>{`Edit ${log.message}`}</button>
                  <button type='button'>{`Remove ${log.message}`}</button>
                </Table.Cell>
                <Table.Cell>
                  <input aria-label={`${log.message} note`} />
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>,
      );

      await user.tab();
      await user.keyboard('{ArrowRight}');
      const cell = focused();
      expect(cell).toContainElement(screen.getByRole('button', { name: 'Edit Alpha' }));
      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: 'Edit Alpha' })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Remove Alpha' })).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('button', { name: 'Remove Alpha' })).toHaveFocus();
      await user.keyboard('{Escape}');
      expect(cell).toHaveFocus();

      await user.keyboard('{ArrowRight}{F2}');
      const input = screen.getByRole('textbox', { name: 'Alpha note' });
      expect(input).toHaveFocus();
      await user.keyboard('hi{ArrowLeft}{ArrowDown}');
      expect(input).toHaveFocus();
      expect(input).toHaveValue('hi');
    });

    it('opens a cell menu with Enter and leaves its arrow keys alone', async () => {
      const user = userEvent.setup();
      render(
        <Table.Root
          aria-label='Logs'
          selectionMode='single'
        >
          <Table.Body
            items={FLAT_LOGS}
            itemToStringValue={toValue}
          >
            {log => (
              <Table.Row>
                <Table.Cell>
                  <Menu.Root>
                    <Menu.Trigger>{`${log.message} actions`}</Menu.Trigger>
                    <Menu.Positioner>
                      <Menu.Popup>
                        <Menu.Item label='Archive'>Archive</Menu.Item>
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Root>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>,
      );

      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: 'Alpha actions' })).toHaveFocus();
      await user.keyboard('{Enter}');
      const item = await screen.findByRole('menuitem', { name: 'Archive' });
      await waitFor(() => expect(item).toHaveFocus());
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument();
    });

    it('keeps a tab stop when the focused row is removed', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<LogsTable selectionMode='multiple' />);

      await tabIntoTable(user);
      await user.keyboard('{End}');
      rerender(
        <LogsTable
          selectionMode='multiple'
          items={FLAT_LOGS.slice(0, 2)}
        />,
      );
      await tabIntoTable(user);

      expect(row('Bravo')).toHaveFocus();
    });
  });

  describe('accessibility', () => {
    it.each([
      ['plain', {}],
      ['grid', { selectionMode: 'multiple' as const }],
      ['treegrid', { items: LOGS, tree: true, defaultExpanded: ['a'] }],
      ['sortable table', { sortable: true, defaultSort: { column: 'message', direction: 'ascending' as const } }],
      ['empty table', { items: [], renderEmptyState: () => 'No logs', selectionMode: 'multiple' as const }],
      ['grid with actions', { rowProps: () => ({ href: '/logs' }) }],
    ])('has no axe violations as a %s', async (_, props) => {
      const { container } = render(<LogsTable {...props} />);

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  it('throws when a part is rendered outside Table.Root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      render(
        <table>
          <tbody>
            <tr>
              <Table.Cell />
            </tr>
          </tbody>
        </table>,
      ),
    ).toThrow('Table compound components must be used within <Table.Root>');
  });
});
