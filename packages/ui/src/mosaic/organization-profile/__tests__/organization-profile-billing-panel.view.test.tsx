import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { OrganizationProfileBillingPanelView } from '../organization-profile-billing-panel.view';

function renderView(overrides: Partial<React.ComponentProps<typeof OrganizationProfileBillingPanelView>> = {}) {
  const props = {
    subscription: {
      subscription: {
        planName: 'Pro',
        statusLabel: 'Active',
        priceLabel: '$200 per month, billed monthly',
        seatsUsed: 6,
        seatsTotal: 10,
        seatLineItems: [
          { id: 'included', label: '5 seats included with Pro', amountLabel: '$0.00' },
          { id: 'additional', label: '1 additional seat', amountLabel: '$19.00' },
        ],
      },
      onChangePlan: vi.fn(),
      onManagePlan: vi.fn(),
      onManageSeats: vi.fn(),
    },
    paymentMethods: {
      paymentMethods: [
        { id: 'visa', label: 'Visa •••• 0644', expiryLabel: 'Expires 02/2029', isDefault: true },
        { id: 'mastercard', label: 'Mastercard •••• 1212', expiryLabel: 'Expires 02/2029' },
      ],
      onAdd: vi.fn(),
      onManage: vi.fn(),
    },
    invoices: {
      invoices: [
        {
          id: 'invoice',
          dateLabel: 'May 26, 2026',
          invoiceLabel: 'stmt_202605_0s64a',
          amountLabel: '$25.00',
          statusLabel: 'Paid',
        },
      ],
      pagination: { page: 1, pageCount: 2, pageSize: 10, pageSizeOptions: [10, 25] },
      onDownloadAll: vi.fn(),
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
      onView: vi.fn(),
    },
    ...overrides,
  };

  return {
    ...render(
      <MosaicProvider>
        <OrganizationProfileBillingPanelView {...props} />
      </MosaicProvider>,
    ),
    props,
  };
}

describe('OrganizationProfileBillingPanelView', () => {
  it('composes subscription, payment, and invoice sections', () => {
    renderView();

    expect(screen.getByRole('heading', { level: 3, name: 'Billing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Subscription' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Payment' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Invoices' })).toBeInTheDocument();
    expect(screen.getByText('$200 per month, billed monthly')).toBeInTheDocument();
    expect(screen.getByText('6 of 10 seats used')).toBeInTheDocument();
    expect(screen.getByText('Visa •••• 0644')).toBeInTheDocument();
    expect(screen.getByText('stmt_202605_0s64a')).toBeInTheDocument();
  });

  it('forwards subscription and payment actions', async () => {
    const user = userEvent.setup();
    const { props } = renderView();

    await user.click(screen.getByRole('button', { name: 'Change plan' }));
    await user.click(screen.getByRole('button', { name: 'Manage subscription' }));
    await user.click(screen.getByRole('button', { name: 'Manage seats' }));
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: 'Manage Visa •••• 0644' }));

    expect(props.subscription.onChangePlan).toHaveBeenCalledOnce();
    expect(props.subscription.onManagePlan).toHaveBeenCalledOnce();
    expect(props.subscription.onManageSeats).toHaveBeenCalledOnce();
    expect(props.paymentMethods.onAdd).toHaveBeenCalledOnce();
    expect(props.paymentMethods.onManage).toHaveBeenCalledWith('visa');
  });

  it('forwards invoice actions and pagination changes', async () => {
    const user = userEvent.setup();
    const { props } = renderView();

    await user.click(screen.getByRole('button', { name: 'Download all' }));
    await user.click(screen.getByRole('button', { name: 'View' }));
    await user.click(screen.getByRole('button', { name: 'Next invoice page' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Results per page' }), '25');

    expect(props.invoices.onDownloadAll).toHaveBeenCalledOnce();
    expect(props.invoices.onView).toHaveBeenCalledWith('invoice');
    expect(props.invoices.onPageChange).toHaveBeenCalledWith(2);
    expect(props.invoices.onPageSizeChange).toHaveBeenCalledWith(25);
  });

  it('renders empty payment and invoice states', () => {
    renderView({
      paymentMethods: { paymentMethods: [] },
      invoices: { invoices: [] },
    });

    expect(screen.getByText('No payment methods added')).toBeInTheDocument();
    expect(screen.getByText('No invoices yet')).toBeInTheDocument();
  });
});
