import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { OrganizationBillingAccountCreditsSectionView } from '../organization-billing-account-credits-section.view';

function renderView(props: Partial<Parameters<typeof OrganizationBillingAccountCreditsSectionView>[0]> = {}) {
  const onViewHistory = vi.fn();
  render(
    <MosaicProvider>
      <OrganizationBillingAccountCreditsSectionView
        title='Account credits'
        balanceLabel='$50.00'
        viewHistory={{ label: 'View credit history' }}
        onViewHistory={onViewHistory}
        {...props}
      />
    </MosaicProvider>,
  );
  return { onViewHistory };
}

describe('OrganizationBillingAccountCreditsSectionView', () => {
  it('renders the heading and formatted balance', () => {
    renderView();
    expect(screen.getByRole('heading', { name: 'Account credits' })).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('fires onViewHistory when the view-history button is clicked', () => {
    const { onViewHistory } = renderView();
    fireEvent.click(screen.getByRole('button', { name: 'View credit history' }));
    expect(onViewHistory).toHaveBeenCalledTimes(1);
  });
});
