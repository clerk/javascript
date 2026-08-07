import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StatementRow } from '../organization-billing-statements-section.view';
import { OrganizationBillingStatementsSectionView } from '../organization-billing-statements-section.view';

const ROW: StatementRow = {
  id: 'stmt_1',
  dateLabel: 'March 2026',
  idLabel: 'stmt...t_1',
  amountLabel: '$50.00',
};

function renderView(props: Partial<Parameters<typeof OrganizationBillingStatementsSectionView>[0]> = {}) {
  const onSelectRow = vi.fn();
  render(
    <OrganizationBillingStatementsSectionView
      columnHeaders={{ date: 'Date', amount: 'Amount' }}
      rows={[ROW]}
      emptyLabel='No statements to display'
      onSelectRow={onSelectRow}
      {...props}
    />,
  );
  return { onSelectRow };
}

describe('OrganizationBillingStatementsSectionView', () => {
  it('renders a row with its date and amount', () => {
    renderView();
    expect(screen.getByText('March 2026')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('renders the empty label when there are no rows', () => {
    renderView({ rows: [] });
    expect(screen.getByText('No statements to display')).toBeInTheDocument();
  });

  it('fires onSelectRow with the row id when a row is clicked', () => {
    const { onSelectRow } = renderView();
    fireEvent.click(screen.getByText('March 2026'));
    expect(onSelectRow).toHaveBeenCalledWith('stmt_1');
  });
});
