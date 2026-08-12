import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationBillingPaymentsSectionController } from '../organization-billing-payments-section.controller';

type Money = { amount: number; currency: string; currencySymbol?: string; amountFormatted?: string };
type Payment = {
  id: string;
  amount: Money;
  paidAt: Date | null;
  failedAt: Date | null;
  updatedAt: Date;
  status: 'pending' | 'paid' | 'failed';
};

let payments: Payment[];
let isLoading: boolean;
let navigate: ReturnType<typeof vi.fn>;

vi.mock('@/router', () => ({
  useRouter: () => ({ navigate }),
}));

vi.mock('@/contexts', () => ({
  usePaymentAttempts: () => ({ data: payments, isLoading, count: payments.length }),
}));

beforeEach(() => {
  payments = [
    {
      id: 'pay_1234567890abcdef',
      amount: { amount: 5000, currency: 'USD' },
      paidAt: new Date('2026-03-15T00:00:00Z'),
      failedAt: null,
      updatedAt: new Date('2026-03-16T00:00:00Z'),
      status: 'paid',
    },
  ];
  isLoading = false;
  navigate = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationBillingPaymentsSectionController();
  if (controller.status !== 'ready') {
    return <output data-testid='state'>{controller.status}</output>;
  }
  const row = controller.rows[0];
  return (
    <div>
      <output data-testid='state'>ready</output>
      <output data-testid='count'>{controller.rows.length}</output>
      <output data-testid='date'>{row?.dateLabel}</output>
      <output data-testid='amount'>{row?.amountLabel}</output>
      <output data-testid='status'>{row?.statusLabel}</output>
      <output data-testid='intent'>{row?.statusIntent}</output>
      <output data-testid='empty'>{controller.emptyLabel}</output>
      <button onClick={() => controller.onSelectRow('pay_1234567890abcdef')}>trigger-select</button>
    </div>
  );
}

describe('useOrganizationBillingPaymentsSectionController', () => {
  it('is loading while the first page has not resolved', () => {
    payments = [];
    isLoading = true;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is ready with an empty label when there are no payments', () => {
    payments = [];
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('ready');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('empty')).toHaveTextContent('No payment history');
  });

  it('maps a paid payment to a formatted row with a success intent', () => {
    render(<Harness />);
    expect(screen.getByTestId('date')).toHaveTextContent('March 15, 2026');
    expect(screen.getByTestId('amount')).toHaveTextContent('$50.00');
    expect(screen.getByTestId('status')).toHaveTextContent('Paid');
    expect(screen.getByTestId('intent')).toHaveTextContent('success');
  });

  it('falls back to failedAt then updatedAt for the date, and maps failed → danger', () => {
    payments = [
      {
        id: 'pay_2',
        amount: { amount: 1000, currency: 'USD' },
        paidAt: null,
        failedAt: new Date('2026-02-10T00:00:00Z'),
        updatedAt: new Date('2026-02-20T00:00:00Z'),
        status: 'failed',
      },
    ];
    render(<Harness />);
    expect(screen.getByTestId('date')).toHaveTextContent('February 10, 2026');
    expect(screen.getByTestId('status')).toHaveTextContent('Failed');
    expect(screen.getByTestId('intent')).toHaveTextContent('danger');
  });

  it('navigates to the payment-attempt detail on row select', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('trigger-select'));
    expect(navigate).toHaveBeenCalledWith('payment-attempt/pay_1234567890abcdef');
  });
});
