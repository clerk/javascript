import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { PaymentMethodRow } from '../organization-billing-payment-methods-section.view';
import { OrganizationBillingPaymentMethodsSectionView } from '../organization-billing-payment-methods-section.view';

function makeRow(overrides: Partial<PaymentMethodRow>): PaymentMethodRow {
  return {
    id: 'pm_1',
    typeLabel: 'Visa',
    detailLabel: '⋯ 4242',
    label: 'visa ⋯ 4242',
    isDefault: false,
    isExpired: false,
    isRemovable: true,
    ...overrides,
  };
}

function baseProps() {
  return {
    title: 'Payment methods',
    rows: [makeRow({ id: 'pm_1' })],
    makeDefaultPendingId: null,
    makeDefaultError: null,
    onMakeDefault: vi.fn(),
    onRemove: vi.fn(),
    remove: {
      open: false,
      label: '',
      error: null,
      submitting: false,
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
    },
    add: {
      available: true,
      open: false,
      submitting: false,
      error: null,
      onOpen: vi.fn(),
      onCancel: vi.fn(),
      onSubmit: vi.fn(),
    },
  };
}

describe('OrganizationBillingPaymentMethodsSectionView', () => {
  it('renders the title and a method row', () => {
    render(<OrganizationBillingPaymentMethodsSectionView {...baseProps()} />);

    expect(screen.getByRole('heading', { name: 'Payment methods' })).toBeInTheDocument();
    expect(screen.getByText('Visa')).toBeInTheDocument();
    expect(screen.getByText('⋯ 4242')).toBeInTheDocument();
  });

  it('shows the Default badge and hides make-default for the default method', () => {
    render(
      <OrganizationBillingPaymentMethodsSectionView
        {...baseProps()}
        rows={[makeRow({ isDefault: true })]}
      />,
    );

    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Make default' })).not.toBeInTheDocument();
  });

  it('shows the Expired badge for an expired method', () => {
    render(
      <OrganizationBillingPaymentMethodsSectionView
        {...baseProps()}
        rows={[makeRow({ isExpired: true })]}
      />,
    );

    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('fires onMakeDefault and onRemove', () => {
    const props = baseProps();
    render(<OrganizationBillingPaymentMethodsSectionView {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Make default' }));
    expect(props.onMakeDefault).toHaveBeenCalledWith('pm_1');

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(props.onRemove).toHaveBeenCalledWith(props.rows[0]);
  });

  it('disables remove for a non-removable method', () => {
    render(
      <OrganizationBillingPaymentMethodsSectionView
        {...baseProps()}
        rows={[makeRow({ isRemovable: false })]}
      />,
    );

    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled();
  });

  it('renders the remove confirmation and fires confirm/cancel', () => {
    const props = baseProps();
    const withDialog = {
      ...props,
      remove: { ...props.remove, open: true, label: 'visa ⋯ 4242' },
    };
    render(<OrganizationBillingPaymentMethodsSectionView {...withDialog} />);

    expect(screen.getByRole('alertdialog')).toHaveTextContent('Remove visa ⋯ 4242?');

    const buttons = screen.getAllByRole('button', { name: 'Remove' });
    // The confirmation button is the last "Remove" in the tree.
    fireEvent.click(buttons[buttons.length - 1]);
    expect(withDialog.remove.onConfirm).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(withDialog.remove.onCancel).toHaveBeenCalled();
  });

  it('surfaces a make-default error', () => {
    render(
      <OrganizationBillingPaymentMethodsSectionView
        {...baseProps()}
        makeDefaultError='card declined'
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('card declined');
  });

  it('offers the add button and fires onOpen', () => {
    const props = baseProps();
    render(<OrganizationBillingPaymentMethodsSectionView {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add payment method' }));
    expect(props.add.onOpen).toHaveBeenCalled();
  });

  it('hides the add button when the add flow is unavailable', () => {
    const props = baseProps();
    render(
      <OrganizationBillingPaymentMethodsSectionView
        {...props}
        add={{ ...props.add, available: false }}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Add payment method' })).not.toBeInTheDocument();
  });

  it('renders the add placeholder and fires cancel when open', () => {
    const props = baseProps();
    const withAdd = { ...props, add: { ...props.add, open: true } };
    render(<OrganizationBillingPaymentMethodsSectionView {...withAdd} />);

    expect(screen.getByTestId('add-payment-method')).toBeInTheDocument();
    // The add entry point collapses into the open panel.
    expect(screen.queryByRole('button', { name: 'Add payment method' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(withAdd.add.onCancel).toHaveBeenCalled();
  });
});
