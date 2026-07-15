import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationBillingStatementDetailController } from '../organization-billing-statement-detail.controller';

type Money = { amount: number; currency: string; currencySymbol?: string; amountFormatted?: string };
type Item = {
  id: string;
  amount: Money;
  chargeType: string;
  subscriptionItem: {
    plan: { name: string };
    amount?: Money;
    planPeriod: string;
    credits?: {
      proration?: { amount: Money };
      payer?: { appliedAmount: Money };
    };
  };
  totals?: { discounts?: { proration?: { amount: Money } } };
};
type Statement = {
  id: string;
  status: string;
  timestamp: Date;
  totals: { grandTotal: Money };
  groups: { timestamp: Date; items: Item[] }[];
};

let statement: Statement | null | undefined;
let isLoading: boolean;
let error: { errors: { message: string; longMessage?: string }[] } | null;
let params: Record<string, string>;
let navigate: ReturnType<typeof vi.fn>;

vi.mock('@/router', () => ({
  useRouter: () => ({ navigate, params }),
}));

vi.mock('@/contexts', () => ({
  useStatement: () => ({ data: statement, isLoading, error }),
}));

function money(amount: number): Money {
  return { amount, currency: 'USD' };
}

beforeEach(() => {
  statement = {
    id: 'stmt_1234567890abcdef',
    status: 'open',
    timestamp: new Date('2026-03-15T00:00:00Z'),
    totals: { grandTotal: money(5000) },
    groups: [
      {
        timestamp: new Date('2026-03-15T00:00:00Z'),
        items: [
          {
            id: 'pay_1',
            amount: money(3000),
            chargeType: 'recurring',
            subscriptionItem: {
              plan: { name: 'Pro' },
              amount: money(3000),
              planPeriod: 'month',
              credits: { proration: { amount: money(500) } },
            },
            totals: { discounts: { proration: { amount: money(200) } } },
          },
        ],
      },
    ],
  };
  isLoading = false;
  error = null;
  params = { statementId: 'stmt_1234567890abcdef' };
  navigate = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationBillingStatementDetailController();
  if (controller.status !== 'ready') {
    return (
      <div>
        <output data-testid='state'>{controller.status}</output>
        {controller.status === 'error' ? <output data-testid='message'>{controller.message}</output> : null}
      </div>
    );
  }
  const item = controller.sections[0]?.items[0];
  return (
    <div>
      <output data-testid='state'>ready</output>
      <output data-testid='title'>{controller.title}</output>
      <output data-testid='status'>{controller.statusLabel}</output>
      <output data-testid='back'>{controller.backLabel}</output>
      <output data-testid='section-date'>{controller.sections[0]?.dateLabel}</output>
      <output data-testid='plan'>{item?.planName}</output>
      <output data-testid='plan-desc'>{item?.planDescription}</output>
      <output data-testid='caption'>{item?.caption}</output>
      <output data-testid='item-amount'>{item?.amountLabel}</output>
      <output data-testid='adjustments'>{item?.adjustments.map(a => `${a.label}=${a.value}`).join('|')}</output>
      <output data-testid='total-label'>{controller.totalLabel}</output>
      <output data-testid='total-value'>{controller.totalValue}</output>
      <button onClick={controller.onBack}>trigger-back</button>
      <button onClick={() => item?.onViewPayment()}>trigger-view</button>
    </div>
  );
}

describe('useOrganizationBillingStatementDetailController', () => {
  it('is loading while the statement has not resolved', () => {
    statement = undefined;
    isLoading = true;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is an error with a fallback message when the statement is missing', () => {
    statement = null;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('error');
    expect(screen.getByTestId('message')).toHaveTextContent('Statement not found');
  });

  it('surfaces the API error message when the fetch fails', () => {
    statement = null;
    error = { errors: [{ message: 'Boom', longMessage: 'Something went wrong' }] };
    render(<Harness />);
    expect(screen.getByTestId('message')).toHaveTextContent('Something went wrong');
  });

  it('maps the statement into a formatted detail model', () => {
    render(<Harness />);
    expect(screen.getByTestId('title')).toHaveTextContent('March 2026');
    expect(screen.getByTestId('status')).toHaveTextContent('Open');
    expect(screen.getByTestId('back')).toHaveTextContent('Statements');
    expect(screen.getByTestId('section-date')).toHaveTextContent('March 15, 2026');
    expect(screen.getByTestId('plan')).toHaveTextContent('Pro');
    expect(screen.getByTestId('plan-desc')).toHaveTextContent('$30.00 / Month');
    expect(screen.getByTestId('caption')).toHaveTextContent('Paid for Pro month plan');
    expect(screen.getByTestId('item-amount')).toHaveTextContent('$30.00');
    expect(screen.getByTestId('total-label')).toHaveTextContent('Total paid');
    expect(screen.getByTestId('total-value')).toHaveTextContent('$50.00');
  });

  it('lists prorated discount and credit adjustments', () => {
    render(<Harness />);
    expect(screen.getByTestId('adjustments')).toHaveTextContent(
      'Prorated discount=($2.00)|Prorated credit for partial usage of previous subscription=($5.00)',
    );
  });

  it('uses the subscribed caption for non-recurring charges', () => {
    if (statement) {
      statement.groups[0].items[0].chargeType = 'checkout';
    }
    render(<Harness />);
    expect(screen.getByTestId('caption')).toHaveTextContent('Subscribed and paid for Pro month plan');
  });

  it('is ready with no sections when the statement has no groups', () => {
    if (statement) {
      statement.groups = [];
    }
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('ready');
    expect(screen.getByTestId('section-date')).toHaveTextContent('');
    expect(screen.getByTestId('total-value')).toHaveTextContent('$50.00');
  });

  it('omits the amount from the plan description when the subscription item has none', () => {
    if (statement) {
      statement.groups[0].items[0].subscriptionItem.amount = undefined;
    }
    render(<Harness />);
    const desc = screen.getByTestId('plan-desc').textContent ?? '';
    expect(desc).toContain('Month');
    expect(desc).not.toContain('$');
  });

  it('navigates back to the statements list', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('trigger-back'));
    expect(navigate).toHaveBeenCalledWith('../../', { searchParams: new URLSearchParams('tab=statements') });
  });

  it('navigates to the payment attempt behind a charge', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('trigger-view'));
    expect(navigate).toHaveBeenCalledWith('../../payment-attempt/pay_1');
  });
});
