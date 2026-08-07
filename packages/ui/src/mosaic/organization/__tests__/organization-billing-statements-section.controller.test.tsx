import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationBillingStatementsSectionController } from '../organization-billing-statements-section.controller';

type Money = { amount: number; currency: string; currencySymbol?: string; amountFormatted?: string };
type Statement = { id: string; timestamp: Date; totals: { grandTotal: Money } };

let statements: Statement[];
let isLoading: boolean;
let navigate: ReturnType<typeof vi.fn>;

vi.mock('@/router', () => ({
  useRouter: () => ({ navigate }),
}));

vi.mock('@/contexts', () => ({
  useStatements: () => ({ data: statements, isLoading, count: statements.length }),
}));

beforeEach(() => {
  statements = [
    {
      id: 'stmt_1234567890abcdef',
      timestamp: new Date('2026-03-15T00:00:00Z'),
      totals: { grandTotal: { amount: 5000, currency: 'USD' } },
    },
  ];
  isLoading = false;
  navigate = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationBillingStatementsSectionController();
  if (controller.status !== 'ready') {
    return <output data-testid='state'>{controller.status}</output>;
  }
  return (
    <div>
      <output data-testid='state'>ready</output>
      <output data-testid='header-date'>{controller.columnHeaders.date}</output>
      <output data-testid='header-amount'>{controller.columnHeaders.amount}</output>
      <output data-testid='count'>{controller.rows.length}</output>
      <output data-testid='date'>{controller.rows[0]?.dateLabel}</output>
      <output data-testid='amount'>{controller.rows[0]?.amountLabel}</output>
      <output data-testid='empty'>{controller.emptyLabel}</output>
      <button onClick={() => controller.onSelectRow('stmt_1234567890abcdef')}>trigger-select</button>
    </div>
  );
}

describe('useOrganizationBillingStatementsSectionController', () => {
  it('is loading while the first page has not resolved', () => {
    statements = [];
    isLoading = true;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is ready with an empty label when there are no statements', () => {
    statements = [];
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('ready');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('empty')).toHaveTextContent('No statements to display');
  });

  it('maps statements to formatted rows', () => {
    render(<Harness />);
    expect(screen.getByTestId('header-date')).toHaveTextContent('Date');
    expect(screen.getByTestId('header-amount')).toHaveTextContent('Amount');
    expect(screen.getByTestId('date')).toHaveTextContent('March 2026');
    expect(screen.getByTestId('amount')).toHaveTextContent('$50.00');
  });

  it('navigates to the statement detail on row select', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('trigger-select'));
    expect(navigate).toHaveBeenCalledWith('statement/stmt_1234567890abcdef');
  });
});
