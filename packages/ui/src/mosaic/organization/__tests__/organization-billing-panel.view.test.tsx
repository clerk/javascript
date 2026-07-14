import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { OrganizationBillingPanelView } from '../organization-billing-panel.view';

function renderView(props: Partial<Parameters<typeof OrganizationBillingPanelView>[0]> = {}) {
  const onTabChange = vi.fn();
  render(
    <MosaicProvider>
      <OrganizationBillingPanelView
        title='Billing'
        value='subscriptions'
        onTabChange={onTabChange}
        tabLabels={{ subscriptions: 'Subscriptions', statements: 'Statements', payments: 'Payments' }}
        subscriptions={<div>subscriptions-slot</div>}
        statements={<div>statements-slot</div>}
        payments={<div>payments-slot</div>}
        {...props}
      />
    </MosaicProvider>,
  );
  return { onTabChange };
}

describe('OrganizationBillingPanelView', () => {
  it('renders the title and the three tabs', () => {
    renderView();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Subscriptions' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Statements' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Payments' })).toBeInTheDocument();
  });

  it('renders the active tab panel slot', () => {
    renderView();
    expect(screen.getByText('subscriptions-slot')).toBeInTheDocument();
  });

  it('does not render an error alert when there is no error', () => {
    renderView();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the card error in an alert region when set', () => {
    renderView({ error: 'Something went wrong' });
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('reports tab changes to onTabChange', () => {
    // Tabs.Root defaults to automatic activation, which selects on focus.
    const { onTabChange } = renderView();
    fireEvent.focus(screen.getByRole('tab', { name: 'Statements' }));
    expect(onTabChange).toHaveBeenCalledWith('statements');
  });
});
