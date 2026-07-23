import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { OrganizationBillingStatementDetailViewProps } from '../organization-billing-statement-detail.view';
import { OrganizationBillingStatementDetailView } from '../organization-billing-statement-detail.view';

function renderView(overrides: Partial<OrganizationBillingStatementDetailViewProps> = {}) {
  const onBack = vi.fn();
  const onViewPayment = vi.fn();
  const props: OrganizationBillingStatementDetailViewProps = {
    title: 'March 2026',
    idLabel: 'stmt_…cdef',
    statusLabel: 'Open',
    backLabel: 'Statements',
    onBack,
    sections: [
      {
        id: 'group-1',
        dateLabel: 'March 15, 2026',
        items: [
          {
            id: 'pay_1',
            planName: 'Pro',
            planDescription: '$30.00 / Month',
            amountLabel: '$30.00',
            caption: 'Paid for Pro month plan',
            viewPaymentLabel: 'View payment',
            onViewPayment,
            adjustments: [{ id: 'a1', label: 'Prorated discount', value: '($2.00)' }],
          },
        ],
      },
    ],
    totalLabel: 'Total paid',
    totalValue: '$50.00',
    currency: 'USD',
    ...overrides,
  };
  return { onBack, onViewPayment, ...render(<OrganizationBillingStatementDetailView {...props} />) };
}

describe('OrganizationBillingStatementDetailView', () => {
  it('renders the statement header, charge, adjustment, and total', () => {
    renderView();
    expect(screen.getByText('March 2026')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('March 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('$30.00 / Month')).toBeInTheDocument();
    expect(screen.getByText('Paid for Pro month plan')).toBeInTheDocument();
    expect(screen.getByText('Prorated discount')).toBeInTheDocument();
    expect(screen.getByText('($2.00)')).toBeInTheDocument();
    expect(screen.getByText('Total paid')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('fires onBack when the back control is clicked', () => {
    const { onBack } = renderView();
    fireEvent.click(screen.getByText('Statements'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('fires onViewPayment when the view-payment control is clicked', () => {
    const { onViewPayment } = renderView();
    fireEvent.click(screen.getByText('View payment'));
    expect(onViewPayment).toHaveBeenCalledTimes(1);
  });
});
