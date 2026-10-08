import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render } from '@/test/utils';

import { PaymentAttemptPage } from '../../PaymentAttempts/PaymentAttemptPage';
import { PaymentAttemptsList } from '../../PaymentAttempts/PaymentAttemptsList';
import { StatementPage } from '../../Statements/StatementPage';
import { StatementsList } from '../../Statements/StatementsList';

const { createFixtures } = bindCreateFixtures('UserProfile');
const money = (amount = 1000) => ({
  amount,
  amountFormatted: (amount / 100).toFixed(2),
  currency: 'USD',
  currencySymbol: '$',
});
const timestamp = new Date('2026-10-06T12:00:00Z');
const plan = {
  id: 'plan_first',
  name: 'Test Plan',
  fee: money(),
  annualMonthlyFee: money(),
  annualFee: money(12000),
  isDefault: false,
};
const payment = () => ({
  id: 'payment_first',
  status: 'paid',
  amount: money(),
  paidAt: timestamp,
  failedAt: null,
  updatedAt: timestamp,
  subscriptionItem: { id: 'item_first', plan, planPeriod: 'month', amount: money() },
  totals: { subtotal: money(), grandTotal: money() },
});
const statement = () => ({
  id: 'statement_first',
  status: 'closed',
  timestamp,
  totals: { grandTotal: money() },
  groups: [{ timestamp, items: [{ ...payment(), chargeType: 'recurring' }] }],
});

async function setup() {
  const setup = await createFixtures(f => {
    f.withUser({ email_addresses: ['test@clerk.com'] });
    f.withBilling();
  });
  setup.fixtures.router.params = { statementId: 'statement_first', paymentAttemptId: 'payment_first' };
  return setup;
}

describe('Billing read flows', () => {
  it('renders statement rows and navigates with the displayed snapshot ID', async () => {
    const { wrapper, fixtures } = await setup();
    const source = statement();
    fixtures.clerk.billing.getStatements.mockResolvedValue({ data: [source], total_count: 1 });
    const { findByText, userEvent } = render(<StatementsList />, { wrapper });
    const id = await findByText('statement_first');
    source.id = 'statement_changed';
    await userEvent.click(id);
    expect(fixtures.router.navigate).toHaveBeenCalledExactlyOnceWith('statement/statement_first');
  });

  it('renders payment rows and navigates with the displayed snapshot ID', async () => {
    const { wrapper, fixtures } = await setup();
    const source = payment();
    fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue({ data: [source], total_count: 1 });
    const { findByText, getByText, userEvent } = render(<PaymentAttemptsList />, { wrapper });
    const id = await findByText('payment_first');
    expect(getByText('paid')).toBeVisible();
    source.id = 'payment_changed';
    await userEvent.click(id);
    expect(fixtures.router.navigate).toHaveBeenCalledExactlyOnceWith('payment-attempt/payment_first');
  });

  it('renders a statement and preserves payment and back navigation', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.billing.getStatement.mockResolvedValue(statement());
    const { findByText, getByRole, userEvent } = render(<StatementPage />, { wrapper });
    expect(await findByText('Test Plan')).toBeVisible();
    await userEvent.click(getByRole('button', { name: 'View payment' }));
    expect(fixtures.router.navigate).toHaveBeenCalledWith('../../payment-attempt/payment_first');
    await userEvent.click(getByRole('heading', { name: 'Statements' }));
    const call = fixtures.router.navigate.mock.lastCall!;
    expect(call[0]).toBe('../../');
    expect(call[1].searchParams.toString()).toBe('tab=statements');
  });

  it('renders a payment and preserves back navigation', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.billing.getPaymentAttempt.mockResolvedValue(payment());
    const { findByText, getByRole, userEvent } = render(<PaymentAttemptPage />, { wrapper });
    expect(await findByText('Test Plan')).toBeVisible();
    await userEvent.click(getByRole('heading', { name: 'Payments' }));
    const call = fixtures.router.navigate.mock.lastCall!;
    expect(call[0]).toBe('../../');
    expect(call[1].searchParams.toString()).toBe('tab=payments');
  });

  it.each(['statement', 'payment'] as const)('keeps the %s loading surface until its query completes', async type => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise();
    if (type === 'statement') {
      fixtures.clerk.billing.getStatement.mockReturnValue(deferred.promise);
    } else {
      fixtures.clerk.billing.getPaymentAttempt.mockReturnValue(deferred.promise);
    }
    const { container, findByText, queryByText } = render(
      type === 'statement' ? <StatementPage /> : <PaymentAttemptPage />,
      { wrapper },
    );
    expect(container.querySelector('span[aria-live="polite"]')).toBeVisible();
    expect(queryByText('Test Plan')).not.toBeInTheDocument();
    await act(async () => {
      deferred.resolve(type === 'statement' ? statement() : payment());
      await deferred.promise;
    });
    expect(await findByText('Test Plan')).toBeVisible();
  });
  it.each(['statement', 'payment'] as const)('preserves the empty %s list message', async type => {
    const { wrapper, fixtures } = await setup();
    const empty = { data: [], total_count: 0 };
    if (type === 'statement') {
      fixtures.clerk.billing.getStatements.mockResolvedValue(empty);
    } else {
      fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue(empty);
    }
    const { findByText } = render(type === 'statement' ? <StatementsList /> : <PaymentAttemptsList />, { wrapper });
    expect(await findByText(type === 'statement' ? 'No statements to display' : 'No payment history')).toBeVisible();
  });

  it.each(['statement', 'payment'] as const)('preserves the missing %s page message', async type => {
    const { wrapper, fixtures } = await setup();
    if (type === 'statement') {
      fixtures.clerk.billing.getStatement.mockResolvedValue(null);
    } else {
      fixtures.clerk.billing.getPaymentAttempt.mockResolvedValue(null);
    }
    const { findByText } = render(type === 'statement' ? <StatementPage /> : <PaymentAttemptPage />, { wrapper });
    expect(await findByText(type === 'statement' ? 'Statement not found' : 'Payment attempt not found')).toBeVisible();
  });
});
