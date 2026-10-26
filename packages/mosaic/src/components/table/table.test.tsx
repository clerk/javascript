import * as stylex from '@stylexjs/stylex';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Table } from './table';
import { stickySides, styles } from './table.styles';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

interface Key {
  id: string;
  name: string;
  created: string;
  children?: Key[];
}

const keys: Key[] = [
  { id: 'alpha', name: 'Alpha', created: 'Today' },
  { id: 'beta', name: 'Beta', created: 'Yesterday' },
];

function renderTable(props: Partial<React.ComponentProps<typeof Table.Root>> = {}) {
  return render(
    <Table.Root
      aria-label='Keys'
      {...props}
    >
      <Table.Header>
        <Table.Column>Name</Table.Column>
        <Table.Column>Created</Table.Column>
      </Table.Header>
      <Table.Body
        items={keys}
        itemToStringValue={key => key.id}
      >
        {key => (
          <Table.Row>
            <Table.Cell>{key.name}</Table.Cell>
            <Table.Cell>{key.created}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>,
  );
}

function renderSelectableTable() {
  return render(
    <Table.Root
      aria-label='Keys'
      selectionMode='multiple'
    >
      <Table.Header>
        <Table.SelectionColumn aria-label='Select all keys' />
        <Table.Column rowHeader>Name</Table.Column>
      </Table.Header>
      <Table.Body
        items={keys}
        itemToStringValue={key => key.id}
      >
        {key => (
          <Table.Row>
            <Table.SelectionCell aria-label='Select' />
            <Table.Cell>{key.name}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>,
  );
}

describe('Mosaic Table', () => {
  it('reports search changes and returns focus to the input when cleared', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<HTMLInputElement>();
    const onValueChange = vi.fn();
    function Example() {
      const [value, setValue] = React.useState('');
      return (
        <Table.Toolbar>
          <Table.Search
            ref={ref}
            label='Search members'
            clearLabel='Clear member search'
            value={value}
            onValueChange={next => {
              onValueChange(next);
              setValue(next);
            }}
          />
        </Table.Toolbar>
      );
    }
    render(<Example />);
    const input = screen.getByRole('searchbox', { name: 'Search members' });
    expect(ref.current).toBe(input);
    expect(screen.queryByRole('button', { name: 'Clear member search' })).not.toBeInTheDocument();
    await user.type(input, 'Ada');
    expect(onValueChange).toHaveBeenLastCalledWith('Ada');
    await user.click(screen.getByRole('button', { name: 'Clear member search' }));
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Clear member search' })).not.toBeInTheDocument();
  });

  it('renders a table inside a scrolling shell', () => {
    renderTable();
    const table = screen.getByRole('table');
    expect(table).toHaveClass('cl-table');
    expect(table.parentElement).toHaveClass('cl-table-viewport');
    expect(table.parentElement?.parentElement).toHaveClass('cl-table-shell');
  });

  it('opts cells into no-wrap styling without changing neighboring cells', () => {
    render(
      <Table.Root>
        <Table.Body
          items={keys.slice(0, 1)}
          itemToStringValue={key => key.id}
        >
          {() => (
            <Table.Row>
              <Table.Cell noWrap>September 23, 2026</Table.Cell>
              <Table.Cell>A longer description can wrap</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>,
    );
    const date = screen.getByRole('cell', { name: 'September 23, 2026' });
    const description = screen.getByRole('cell', { name: 'A longer description can wrap' });
    expect(date).toHaveAttribute('data-no-wrap', '');
    expect(date).toHaveClass(stylex.props(styles.noWrap).className ?? '');
    expect(description).not.toHaveAttribute('data-no-wrap');
    expect(description).not.toHaveClass(stylex.props(styles.noWrap).className ?? '');
  });

  it.each(['start', 'end'] as const)('pins columns and cells to the %s edge', side => {
    render(
      <Table.Root>
        <Table.Header>
          <Table.Column>Name</Table.Column>
          <Table.Column sticky={side}>Actions</Table.Column>
        </Table.Header>
        <Table.Body
          items={keys.slice(0, 1)}
          itemToStringValue={key => key.id}
        >
          {() => (
            <Table.Row>
              <Table.Cell>Alpha</Table.Cell>
              <Table.Cell sticky={side}>Edit</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>,
    );
    const stickyClass = stylex.props(styles.sticky, stickySides[side]).className ?? '';
    for (const cell of [
      screen.getByRole('columnheader', { name: 'Actions' }),
      screen.getByRole('cell', { name: 'Edit' }),
    ]) {
      expect(cell).toHaveAttribute('data-sticky', side);
      expect(cell).toHaveClass(...stickyClass.split(' '));
    }
    for (const cell of [
      screen.getByRole('columnheader', { name: 'Name' }),
      screen.getByRole('cell', { name: 'Alpha' }),
    ]) {
      expect(cell).not.toHaveAttribute('data-sticky');
      expect(cell).not.toHaveClass(stylex.props(styles.sticky).className ?? '');
    }
  });

  it('lets the keyboard reach the scrolling viewport', () => {
    renderTable();
    expect(screen.getByRole('table').parentElement).toHaveAttribute('tabindex', '0');
  });

  it('stops the viewport from rubber banding past its edges', () => {
    renderTable();
    expect(screen.getByRole('table').parentElement).toHaveClass(stylex.props(styles.viewport).className ?? '');
  });

  it('applies slot classes to every part', () => {
    renderTable();
    const [header, body] = screen.getAllByRole('rowgroup');
    expect(header).toHaveClass('cl-table-header');
    expect(body).toHaveClass('cl-table-body');
    expect(screen.getByRole('row', { name: /Alpha/ })).toHaveClass('cl-table-row');
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass('cl-table-column');
    expect(screen.getByRole('cell', { name: 'Alpha' })).toHaveClass('cl-table-cell');
  });

  it('merges xstyle atoms on the table and forwards the ref', () => {
    const ref = React.createRef<HTMLTableElement>();
    renderTable({ ref, xstyle: atoms.spaced });
    expect(ref.current).toBe(screen.getByRole('table'));
    expect(ref.current).toHaveClass('cl-table', stylex.props(atoms.spaced).className ?? '');
  });

  it('renders row header cells with cell styling', () => {
    render(
      <Table.Root>
        <Table.Header>
          <Table.Column rowHeader>Name</Table.Column>
        </Table.Header>
        <Table.Body
          items={keys.slice(0, 1)}
          itemToStringValue={key => key.id}
        >
          {key => (
            <Table.Row>
              <Table.Cell>{key.name}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>,
    );
    const cell = screen.getByRole('rowheader', { name: 'Alpha' });
    expect(cell).toHaveClass('cl-table-cell', ...(stylex.props(styles.cell).className ?? '').split(' '));
  });

  describe('sorting', () => {
    it('leaves a column without sortable as plain text', () => {
      renderTable();
      const column = screen.getByRole('columnheader', { name: 'Name' });
      expect(column).not.toHaveAttribute('aria-sort');
      expect(column).not.toHaveAttribute('data-sortable');
    });

    it('reports the sort and reflects its direction', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      function Example({ direction }: { direction: 'ascending' | 'descending' | null }) {
        return (
          <Table.Root
            sort={direction ? { column: 'name', direction } : null}
            onSortChange={onSortChange}
          >
            <Table.Header>
              <Table.Column
                value='name'
                sortable
              >
                Name
              </Table.Column>
              <Table.Column
                value='created'
                sortable
              >
                Created
              </Table.Column>
            </Table.Header>
          </Table.Root>
        );
      }
      const { rerender } = render(<Example direction={null} />);
      const name = screen.getByRole('columnheader', { name: 'Name' });
      expect(name).toHaveAttribute('aria-sort', 'none');
      expect(name).toHaveAttribute('data-sortable', '');

      await user.click(name);
      expect(onSortChange).toHaveBeenLastCalledWith({ column: 'name', direction: 'ascending' });

      rerender(<Example direction='ascending' />);
      expect(name).toHaveAttribute('aria-sort', 'ascending');
      expect(name).toHaveAttribute('data-sort-direction', 'ascending');
      expect(screen.getByRole('columnheader', { name: 'Created' })).toHaveAttribute('aria-sort', 'none');

      await user.click(name);
      expect(onSortChange).toHaveBeenLastCalledWith({ column: 'name', direction: 'descending' });
    });
  });

  describe('selection', () => {
    it('renders Mosaic checkboxes named by their labels and the row header', () => {
      renderSelectableTable();
      const selectAll = screen.getByRole('checkbox', { name: 'Select all keys' });
      expect(selectAll).toHaveClass('cl-checkbox-input');
      expect(selectAll.closest('th')).toHaveClass('cl-table-select-cell');
      const selectRow = screen.getByRole('checkbox', { name: 'Select Alpha' });
      expect(selectRow).toHaveClass('cl-checkbox-input');
      expect(selectRow.closest('td')).toHaveClass('cl-table-select-cell');
    });

    it('selects rows and reflects partial and full selection on the header checkbox', async () => {
      const user = userEvent.setup();
      renderSelectableTable();
      const selectAll = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Select all keys' });

      await user.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
      expect(screen.getByRole('row', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('row', { name: 'Alpha' })).toHaveAttribute('data-selected', '');
      expect(selectAll.indeterminate).toBe(true);

      await user.click(selectAll);
      expect(screen.getByRole('checkbox', { name: 'Select Beta' })).toBeChecked();
      expect(selectAll).toBeChecked();
      expect(selectAll.indeterminate).toBe(false);
    });
  });

  it('marks rows with an action as actionable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Table.Root>
        <Table.Header>
          <Table.Column rowHeader>Name</Table.Column>
        </Table.Header>
        <Table.Body
          items={keys}
          itemToStringValue={key => key.id}
        >
          {key => (
            <Table.Row onClick={key.id === 'alpha' ? onClick : undefined}>
              <Table.Cell>{key.name}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>,
    );
    expect(screen.getByRole('row', { name: 'Alpha' })).toHaveAttribute('data-actionable', '');
    expect(screen.getByRole('row', { name: 'Beta' })).not.toHaveAttribute('data-actionable');
    await user.click(screen.getByText('Alpha'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the empty state across every column', () => {
    render(
      <Table.Root>
        <Table.Header>
          <Table.Column>Name</Table.Column>
          <Table.Column>Created</Table.Column>
        </Table.Header>
        <Table.Body
          items={[]}
          itemToStringValue={(key: Key) => key.id}
          renderEmptyState={() => 'No results'}
        >
          {key => (
            <Table.Row>
              <Table.Cell>{key.name}</Table.Cell>
              <Table.Cell>{key.created}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>,
    );
    const cell = screen.getByRole('cell');
    expect(cell).toHaveAttribute('colspan', '2');
    expect(within(cell).getByText('No results')).toHaveClass('cl-table-empty');
  });

  it('expands tree rows from a button named by its label and the row header', async () => {
    const user = userEvent.setup();
    render(
      <Table.Root aria-label='Keys'>
        <Table.Header>
          <Table.Column rowHeader>Name</Table.Column>
        </Table.Header>
        <Table.Body
          items={[{ ...keys[0], children: [keys[1]] }]}
          itemToStringValue={key => key.id}
          itemToChildren={key => key.children}
        >
          {key => (
            <Table.Row>
              <Table.Cell>
                <Table.ExpandButton aria-label='Expand' />
                {key.name}
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>,
    );
    const expand = screen.getByRole('button', { name: 'Expand Alpha' });
    expect(expand).toHaveClass('cl-table-expand-button');
    expect(screen.queryByRole('row', { name: 'Beta' })).toBeNull();
    await user.click(expand);
    expect(expand).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('row', { name: 'Beta' })).toBeInTheDocument();
  });
});
