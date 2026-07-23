import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationBillingAccountCreditsSectionController } from '../organization-billing-account-credits-section.controller';

type Money = { amount: number; currency: string; currencySymbol?: string; amountFormatted?: string };

let balance: Money | null;
let isLoading: boolean;
let navigate: ReturnType<typeof vi.fn>;

vi.mock('@/router', () => ({
  useRouter: () => ({ navigate }),
}));

vi.mock('@/contexts', () => ({
  useCreditBalance: () => ({ data: { balance }, isLoading }),
}));

beforeEach(() => {
  balance = { amount: 5000, currency: 'USD' };
  isLoading = false;
  navigate = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationBillingAccountCreditsSectionController();
  if (controller.status !== 'ready') {
    return <output data-testid='state'>{controller.status}</output>;
  }
  return (
    <div>
      <output data-testid='state'>ready</output>
      <output data-testid='title'>{controller.title}</output>
      <output data-testid='balance'>{controller.balanceLabel}</output>
      <output data-testid='view'>{controller.viewHistory.label}</output>
      <button onClick={controller.onViewHistory}>trigger-view</button>
    </div>
  );
}

describe('useOrganizationBillingAccountCreditsSectionController', () => {
  it('is hidden while the balance is loading', () => {
    isLoading = true;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is hidden when there is no credit balance', () => {
    balance = null;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('exposes the formatted balance and copy when a balance exists', () => {
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('ready');
    expect(screen.getByTestId('title')).toHaveTextContent('Account credits');
    expect(screen.getByTestId('balance')).toHaveTextContent('$50.00');
    expect(screen.getByTestId('view')).toHaveTextContent('View credit history');
  });

  it('navigates to credit history on view', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('trigger-view'));
    expect(navigate).toHaveBeenCalledWith('credit-history');
  });
});
