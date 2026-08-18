import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { UserProfileBillingPanelView } from '../user-profile-billing-panel.view';

const subscription = {
  planName: 'Basic Plan',
  priceLabel: '$12 / Month',
  totalDueLabel: '$12.00',
  renewsAtLabel: 'Renews Aug 26',
};

const paymentMethods = [
  {
    id: 'visa',
    label: 'Visa •••• 0644',
    expiryLabel: 'Expires 02/2029',
    isDefault: true,
  },
  {
    id: 'mastercard',
    label: 'Mastercard •••• 1212',
    expiryLabel: 'Expires 02/2029',
  },
];

function renderView(overrides: Partial<React.ComponentProps<typeof UserProfileBillingPanelView>> = {}) {
  return render(
    <MosaicProvider>
      <UserProfileBillingPanelView
        paymentMethods={paymentMethods}
        subscription={subscription}
        {...overrides}
      />
    </MosaicProvider>,
  );
}

describe('UserProfileBillingPanelView', () => {
  it('composes subscription and payment methods without history', () => {
    renderView();

    expect(screen.getByRole('heading', { level: 3, name: 'Billing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Subscription' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Payment methods' })).toBeInTheDocument();
    expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    expect(screen.getByText('$12.00')).toBeInTheDocument();
    expect(screen.getByText('Visa •••• 0644')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.queryByText('History')).not.toBeInTheDocument();
  });

  it('forwards subscription and payment method actions', async () => {
    const onChangePlan = vi.fn();
    const onAdd = vi.fn();
    const onMakeDefault = vi.fn();
    const onRemove = vi.fn();
    const user = userEvent.setup();

    renderView({
      onChangePlan,
      onAddPaymentMethod: onAdd,
      onMakeDefaultPaymentMethod: onMakeDefault,
      onRemovePaymentMethod: onRemove,
    });

    await user.click(screen.getByRole('button', { name: 'Change plan' }));
    await user.click(screen.getByRole('button', { name: 'Add payment method' }));
    await user.click(screen.getByRole('button', { name: 'Manage Mastercard •••• 1212' }));
    await user.click(screen.getByRole('menuitem', { name: 'Make default' }));
    await user.click(screen.getByRole('button', { name: 'Manage Mastercard •••• 1212' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove payment method' }));

    expect(onChangePlan).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onMakeDefault).toHaveBeenCalledWith('mastercard');
    expect(onRemove).toHaveBeenCalledWith('mastercard');
  });

  it('keeps an empty payment method list actionable', () => {
    renderView({ paymentMethods: [], onAddPaymentMethod: vi.fn() });

    expect(screen.getByText('No payment methods added')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add payment method' })).toBeInTheDocument();
  });
});
