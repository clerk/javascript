import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationBillingPaymentDetailController } from '../organization-billing-payment-detail.controller';

type Money = { amount: number; currency: string; currencySymbol?: string; amountFormatted?: string };
type Tier = { quantity: number | null; feePerBlock: Money; total: Money };
type PaymentAttempt = {
  id: string;
  amount: Money;
  paidAt: Date | null;
  failedAt: Date | null;
  updatedAt: Date;
  status: string;
  subscriptionItem: {
    plan: { name: string; fee: Money | null; annualMonthlyFee: Money | null; unitPrices?: unknown[] };
    planPeriod: string;
    seats?: unknown;
    credits?: { proration?: { amount: Money }; payer?: { appliedAmount: Money } };
  };
  totals?: {
    subtotal: Money;
    perUnitTotals?: { name: string; tiers: Tier[] }[];
    discounts?: { proration?: { amount: Money } };
  };
};

let paymentAttempt: PaymentAttempt | null | undefined;
let isLoading: boolean;
let error: { errors: { message: string; longMessage?: string }[] } | null;
let params: Record<string, string>;
let navigate: ReturnType<typeof vi.fn>;

vi.mock('@/router', () => ({
  useRouter: () => ({ navigate, params }),
}));

vi.mock('@/contexts', () => ({
  usePaymentAttempt: () => ({ data: paymentAttempt, isLoading, error }),
}));

function money(amount: number): Money {
  return { amount, currency: 'USD' };
}

beforeEach(() => {
  paymentAttempt = {
    id: 'pay_1234567890abcdef',
    amount: money(3000),
    paidAt: new Date('2026-03-15T00:00:00Z'),
    failedAt: null,
    updatedAt: new Date('2026-03-16T00:00:00Z'),
    status: 'paid',
    subscriptionItem: {
      plan: { name: 'Pro', fee: money(3000), annualMonthlyFee: money(2500) },
      planPeriod: 'month',
      seats: {},
      credits: { proration: { amount: money(500) }, payer: { appliedAmount: money(100) } },
    },
    totals: {
      subtotal: money(3000),
      perUnitTotals: [
        {
          name: 'seats',
          tiers: [
            { quantity: 2, feePerBlock: money(0), total: money(0) },
            { quantity: 3, feePerBlock: money(1000), total: money(3000) },
          ],
        },
      ],
      discounts: { proration: { amount: money(200) } },
    },
  };
  isLoading = false;
  error = null;
  params = { paymentAttemptId: 'pay_1234567890abcdef' };
  navigate = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationBillingPaymentDetailController();
  if (controller.status !== 'ready') {
    return (
      <div>
        <output data-testid='state'>{controller.status}</output>
        {controller.status === 'error' ? <output data-testid='message'>{controller.message}</output> : null}
      </div>
    );
  }
  return (
    <div>
      <output data-testid='state'>ready</output>
      <output data-testid='title'>{controller.title}</output>
      <output data-testid='status'>{controller.statusLabel}</output>
      <output data-testid='intent'>{controller.statusIntent}</output>
      <output data-testid='back'>{controller.backLabel}</output>
      <output data-testid='line-items'>
        {controller.lineItems.map(i => `${i.title}:${i.value}${i.description ? `(${i.description})` : ''}`).join('|')}
      </output>
      <output data-testid='total-label'>{controller.totalLabel}</output>
      <output data-testid='total-value'>{controller.totalValue}</output>
      <output data-testid='currency'>{controller.currency}</output>
      <button onClick={controller.onBack}>trigger-back</button>
    </div>
  );
}

describe('useOrganizationBillingPaymentDetailController', () => {
  it('is loading while the payment attempt has not resolved', () => {
    paymentAttempt = undefined;
    isLoading = true;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is an error with a fallback message when the payment attempt is missing', () => {
    paymentAttempt = null;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('error');
    expect(screen.getByTestId('message')).toHaveTextContent('Payment attempt not found');
  });

  it('surfaces the API error message when the fetch fails', () => {
    paymentAttempt = null;
    error = { errors: [{ message: 'Boom', longMessage: 'Something went wrong' }] };
    render(<Harness />);
    expect(screen.getByTestId('message')).toHaveTextContent('Something went wrong');
  });

  it('maps the header (date, status, intent, back label)', () => {
    render(<Harness />);
    expect(screen.getByTestId('title')).toHaveTextContent('March 15, 2026');
    expect(screen.getByTestId('status')).toHaveTextContent('Paid');
    expect(screen.getByTestId('intent')).toHaveTextContent('success');
    expect(screen.getByTestId('back')).toHaveTextContent('Payments');
    expect(screen.getByTestId('total-label')).toHaveTextContent('Total due');
    expect(screen.getByTestId('total-value')).toHaveTextContent('$30.00');
    expect(screen.getByTestId('currency')).toHaveTextContent('USD');
  });

  it('builds plan, seats, subtotal, and adjustment line items', () => {
    render(<Harness />);
    expect(screen.getByTestId('line-items')).toHaveTextContent(
      'Pro:$30.00|Seats:$30.00(3 seats at $10.00/mo (5 total - 2 included))|Subtotal:$30.00|Prorated discount:-$2.00|Prorated credit:-$5.00|Account credit:-$1.00',
    );
  });

  it('falls back to the failed date and danger intent for failed payments', () => {
    if (paymentAttempt) {
      paymentAttempt.status = 'failed';
      paymentAttempt.paidAt = null;
      paymentAttempt.failedAt = new Date('2026-02-10T00:00:00Z');
    }
    render(<Harness />);
    expect(screen.getByTestId('title')).toHaveTextContent('February 10, 2026');
    expect(screen.getByTestId('status')).toHaveTextContent('Failed');
    expect(screen.getByTestId('intent')).toHaveTextContent('danger');
  });

  it('uses the primary intent and the updated date for a pending payment', () => {
    if (paymentAttempt) {
      paymentAttempt.status = 'pending';
      paymentAttempt.paidAt = null;
      paymentAttempt.failedAt = null;
    }
    render(<Harness />);
    expect(screen.getByTestId('title')).toHaveTextContent('March 16, 2026');
    expect(screen.getByTestId('status')).toHaveTextContent('Pending');
    expect(screen.getByTestId('intent')).toHaveTextContent('primary');
  });

  it('omits the seats line when the subscription item has no seats', () => {
    if (paymentAttempt) {
      paymentAttempt.subscriptionItem.seats = undefined;
    }
    render(<Harness />);
    expect(screen.getByTestId('line-items')).not.toHaveTextContent('Seats:');
  });

  it('navigates back to the payments list', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('trigger-back'));
    expect(navigate).toHaveBeenCalledWith('../../', { searchParams: new URLSearchParams('tab=payments') });
  });
});
