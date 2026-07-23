import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { OrganizationBillingPaymentDetailViewProps } from '../organization-billing-payment-detail.view';
import { OrganizationBillingPaymentDetailView } from '../organization-billing-payment-detail.view';

function renderView(overrides: Partial<OrganizationBillingPaymentDetailViewProps> = {}) {
  const onBack = vi.fn();
  const props: OrganizationBillingPaymentDetailViewProps = {
    title: 'March 15, 2026',
    idLabel: 'pay_…cdef',
    statusLabel: 'Paid',
    statusIntent: 'success',
    backLabel: 'Payments',
    onBack,
    lineItems: [
      { id: 'plan', title: 'Pro', value: '$30.00' },
      { id: 'seats', title: 'Seats', description: '3 seats at $10.00/mo', value: '$30.00' },
      { id: 'account-credit', title: 'Account credit', value: '-$1.00' },
    ],
    totalLabel: 'Total due',
    totalValue: '$30.00',
    currency: 'USD',
    ...overrides,
  };
  return { onBack, ...render(<OrganizationBillingPaymentDetailView {...props} />) };
}

describe('OrganizationBillingPaymentDetailView', () => {
  it('renders the header, line items with descriptions, and total', () => {
    renderView();
    expect(screen.getByText('March 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Seats')).toBeInTheDocument();
    expect(screen.getByText('3 seats at $10.00/mo')).toBeInTheDocument();
    expect(screen.getByText('Account credit')).toBeInTheDocument();
    expect(screen.getByText('-$1.00')).toBeInTheDocument();
    expect(screen.getByText('Total due')).toBeInTheDocument();
  });

  it('carries the status intent as a data attribute', () => {
    renderView({ statusIntent: 'danger', statusLabel: 'Failed' });
    expect(screen.getByText('Failed')).toHaveAttribute('data-intent', 'danger');
  });

  it('fires onBack when the back control is clicked', () => {
    const { onBack } = renderView();
    fireEvent.click(screen.getByText('Payments'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
