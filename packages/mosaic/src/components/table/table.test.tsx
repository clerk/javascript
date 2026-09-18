import * as stylex from '@stylexjs/stylex';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { EmptyState } from '../empty-state';
import { Table } from './table';
import { styles } from './table.styles';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

function renderTable(props: Partial<React.ComponentProps<typeof Table.Root>> = {}) {
  return render(
    <Table.Root {...props}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Created</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Alpha</Table.Cell>
          <Table.Cell>Today</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>,
  );
}

describe('Mosaic Table', () => {
  it('renders a table inside a scrolling shell', () => {
    renderTable();
    const table = screen.getByRole('table');
    expect(table).toHaveClass('cl-table');
    expect(table.parentElement).toHaveClass('cl-table-viewport');
    expect(table.parentElement?.parentElement).toHaveClass('cl-table-shell');
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
    expect(screen.getAllByRole('row')[0]).toHaveClass('cl-table-row');
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass('cl-table-header-cell');
    expect(screen.getByRole('cell', { name: 'Alpha' })).toHaveClass('cl-table-cell');
  });

  it('merges xstyle atoms on the table and forwards the ref', () => {
    const ref = React.createRef<HTMLTableElement>();
    renderTable({ ref, xstyle: atoms.spaced });
    expect(ref.current).toBe(screen.getByRole('table'));
    expect(ref.current).toHaveClass('cl-table', stylex.props(atoms.spaced).className ?? '');
  });

  describe('sorting', () => {
    it('renders a plain header cell without a sort handler', () => {
      renderTable();
      const cell = screen.getByRole('columnheader', { name: 'Name' });
      expect(within(cell).queryByRole('button')).toBeNull();
      expect(cell).not.toHaveAttribute('aria-sort');
    });

    it('renders a sort button and reflects the direction when sortable', async () => {
      const onSort = vi.fn();
      const { rerender } = render(
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sort='none'
                onSort={onSort}
              >
                Name
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
        </Table.Root>,
      );
      const cell = screen.getByRole('columnheader', { name: 'Name' });
      expect(cell).not.toHaveAttribute('aria-sort');
      expect(cell).toHaveAttribute('data-sortable', '');

      await userEvent.click(within(cell).getByRole('button', { name: 'Name' }));
      expect(onSort).toHaveBeenCalledTimes(1);

      rerender(
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sort='ascending'
                onSort={onSort}
              >
                Name
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
        </Table.Root>,
      );
      expect(cell).toHaveAttribute('aria-sort', 'ascending');
      expect(cell).toHaveAttribute('data-sort', 'ascending');

      rerender(
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sort='descending'
                onSort={onSort}
              >
                Name
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
        </Table.Root>,
      );
      expect(cell).toHaveAttribute('aria-sort', 'descending');
    });
  });

  describe('selection', () => {
    it('renders selection cells with checkboxes', async () => {
      const onSelectAll = vi.fn();
      const onSelectRow = vi.fn();
      render(
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.SelectAllCell
                aria-label='Select all rows'
                checked={false}
                indeterminate
                onChange={onSelectAll}
              />
              <Table.HeaderCell>Name</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row selected>
              <Table.SelectCell
                aria-label='Select Alpha'
                checked
                onChange={onSelectRow}
              />
              <Table.Cell>Alpha</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>,
      );

      const selectAll = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Select all rows' });
      expect(selectAll.indeterminate).toBe(true);
      expect(selectAll.closest('th')).toHaveClass('cl-table-select-cell');
      await userEvent.click(selectAll);
      expect(onSelectAll).toHaveBeenCalledTimes(1);

      const selectRow = screen.getByRole('checkbox', { name: 'Select Alpha' });
      expect(selectRow).toBeChecked();
      expect(selectRow.closest('td')).toHaveClass('cl-table-select-cell');
      await userEvent.click(selectRow);
      expect(onSelectRow).toHaveBeenCalledTimes(1);
    });

    it('reports whether a row toggle extends a range', async () => {
      const onToggleSelected = vi.fn();
      render(
        <Table.Root>
          <Table.Body>
            <Table.Row>
              <Table.SelectCell
                aria-label='Select Alpha'
                checked={false}
                onToggleSelected={onToggleSelected}
              />
              <Table.Cell>Alpha</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>,
      );

      const user = userEvent.setup();
      const selectRow = screen.getByRole('checkbox', { name: 'Select Alpha' });
      await user.click(selectRow);
      expect(onToggleSelected).toHaveBeenLastCalledWith({ range: false });

      await user.keyboard('{Shift>}');
      await user.click(selectRow);
      await user.keyboard('{/Shift}');
      expect(onToggleSelected).toHaveBeenLastCalledWith({ range: true });
    });

    it('reflects the selected row state', () => {
      render(
        <Table.Root>
          <Table.Body>
            <Table.Row selected>
              <Table.Cell>Alpha</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Beta</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>,
      );
      const [selected, unselected] = screen.getAllByRole('row');
      expect(selected).toHaveAttribute('aria-selected', 'true');
      expect(selected).toHaveAttribute('data-selected', '');
      expect(unselected).not.toHaveAttribute('aria-selected');
      expect(unselected).not.toHaveAttribute('data-selected');
    });
  });

  describe('empty state', () => {
    it('renders the empty state across every column', () => {
      render(
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Created</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Empty colSpan={2}>
              <EmptyState.Root>
                <EmptyState.Icon name='magnifying-glass' />
                <EmptyState.Label>No results</EmptyState.Label>
                <EmptyState.Description>Try a different search.</EmptyState.Description>
              </EmptyState.Root>
            </Table.Empty>
          </Table.Body>
        </Table.Root>,
      );
      const cell = screen.getByRole('cell');
      expect(cell).toHaveClass('cl-table-empty');
      expect(cell).toHaveAttribute('colspan', '2');
      expect(within(cell).getByText('No results')).toHaveClass('cl-empty-state-label');
      expect(within(cell).getByText('Try a different search.')).toBeInTheDocument();
    });

    it('spans every column when colSpan is omitted', () => {
      render(
        <Table.Root>
          <Table.Body>
            <Table.Empty>
              <EmptyState.Root>
                <EmptyState.Label>No results</EmptyState.Label>
              </EmptyState.Root>
            </Table.Empty>
          </Table.Body>
        </Table.Root>,
      );
      expect(screen.getByRole('cell')).toHaveAttribute('colspan', '1000');
    });
  });
});
