import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { SubscriptionRow } from '../organization-billing-subscriptions-section.view';
import { OrganizationBillingSubscriptionsSectionView } from '../organization-billing-subscriptions-section.view';

function row(overrides: Partial<SubscriptionRow> = {}): SubscriptionRow {
  return {
    id: 'sub_1',
    planName: 'Pro',
    badge: null,
    caption: null,
    fee: '$20',
    feePeriod: 'month',
    isUpcoming: false,
    seats: null,
    ...overrides,
  };
}

function renderView(props: Partial<Parameters<typeof OrganizationBillingSubscriptionsSectionView>[0]> = {}) {
  const onSwitchOrNewPlan = vi.fn();
  const onManageSubscription = vi.fn();
  render(
    <MosaicProvider>
      <OrganizationBillingSubscriptionsSectionView
        title='Subscriptions'
        columnHeaders={{ plan: 'Plan', startDate: 'Start date' }}
        rows={[row()]}
        overview={null}
        switchOrNewPlan={{ label: 'Switch plan' }}
        manage={{ label: 'Manage subscription' }}
        onSwitchOrNewPlan={onSwitchOrNewPlan}
        onManageSubscription={onManageSubscription}
        {...props}
      />
    </MosaicProvider>,
  );
  return { onSwitchOrNewPlan, onManageSubscription };
}

describe('OrganizationBillingSubscriptionsSectionView', () => {
  it('renders the title and a plan row with fee and period', () => {
    renderView();
    expect(screen.getByText('Subscriptions')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('$20')).toBeInTheDocument();
    expect(screen.getByText('/ month')).toBeInTheDocument();
  });

  it('renders the status badge and caption when present', () => {
    renderView({ rows: [row({ badge: { label: 'Active', intent: 'active' }, caption: 'Renews soon' })] });
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Renews soon')).toBeInTheDocument();
  });

  it('renders the seats sub-row', () => {
    renderView({ rows: [row({ seats: { label: 'Seats', limitLabel: '5 seats', usageLabel: '2 paid' } })] });
    expect(screen.getByText('Seats')).toBeInTheDocument();
    expect(screen.getByText('5 seats')).toBeInTheDocument();
    expect(screen.getByText('2 paid')).toBeInTheDocument();
  });

  it('renders the overview row', () => {
    renderView({ overview: { label: 'Overview', grandTotal: '$50', renewsAt: 'Renews Jun 1' } });
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('Renews Jun 1')).toBeInTheDocument();
  });

  it('omits the table entirely when there are no rows', () => {
    renderView({ rows: [] });
    expect(screen.queryByText('Pro')).not.toBeInTheDocument();
  });

  it('hides the switch action when null', () => {
    renderView({ switchOrNewPlan: null });
    expect(screen.queryByRole('button', { name: 'Switch plan' })).not.toBeInTheDocument();
  });

  it('hides the manage action when null', () => {
    renderView({ manage: null });
    expect(screen.queryByRole('button', { name: 'Manage subscription' })).not.toBeInTheDocument();
  });

  it('fires the switch and manage callbacks on click', () => {
    const { onSwitchOrNewPlan, onManageSubscription } = renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Switch plan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Manage subscription' }));
    expect(onSwitchOrNewPlan).toHaveBeenCalledTimes(1);
    expect(onManageSubscription).toHaveBeenCalledTimes(1);
  });
});
