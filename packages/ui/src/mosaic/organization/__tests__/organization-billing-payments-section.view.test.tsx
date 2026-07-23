import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { PaymentAttemptRow } from '../organization-billing-payments-section.view';
import { OrganizationBillingPaymentsSectionView } from '../organization-billing-payments-section.view';

const ROW: PaymentAttemptRow = {
  id: 'pay_1',
  dateLabel: 'March 15, 2026',
  idLabel: 'pay...y_1',
  amountLabel: '$50.00',
  statusLabel: 'Paid',
  statusIntent: 'success',
};

function renderView(props: Partial<Parameters<typeof OrganizationBillingPaymentsSectionView>[0]> = {}) {
  const onSelectRow = vi.fn();
  render(
    <OrganizationBillingPaymentsSectionView
      columnHeaders={{ date: 'Date', amount: 'Amount', status: 'Status' }}
      rows={[ROW]}
      emptyLabel='No payment history'
      onSelectRow={onSelectRow}
      {...props}
    />,
  );
  return { onSelectRow };
}

describe('OrganizationBillingPaymentsSectionView', () => {
  it('renders a row with its date, amount, and status', () => {
    renderView();
    expect(screen.getByText('March 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('renders the empty label when there are no rows', () => {
    renderView({ rows: [] });
    expect(screen.getByText('No payment history')).toBeInTheDocument();
  });

  it('fires onSelectRow with the row id when a row is clicked', () => {
    const { onSelectRow } = renderView();
    fireEvent.click(screen.getByText('March 15, 2026'));
    expect(onSelectRow).toHaveBeenCalledWith('pay_1');
  });
});
