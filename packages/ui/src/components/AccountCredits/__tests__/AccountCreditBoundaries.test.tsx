import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';
import { SubscriberTypeContext } from '@/ui/contexts';

import { useAccountCreditsModel } from '../account-credits.model';
import { AccountCreditsView } from '../account-credits.view';
import { AccountCredits } from '../AccountCredits';
import { useCreditHistoryModel } from '../credit-history.model';
import { CreditHistoryView } from '../credit-history.view';
import { CreditHistoryPage } from '../CreditHistoryPage';

const { createFixtures } = bindCreateFixtures('UserProfile');
const amount = (value = 1000) => ({
  amount: value,
  amountFormatted: (value / 100).toFixed(2),
  currency: 'USD',
  currencySymbol: '$',
});
const history = (value = 1000) => ({
  data: [
    {
      id: 'credit_1',
      amount: amount(value),
      createdAt: new Date('2026-10-06T12:00:00Z'),
      sourceId: 'source_1',
      sourceType: 'manual',
    },
  ],
  total_count: 1,
});

async function createWrapper(payer: 'user' | 'organization' = 'user') {
  const { wrapper: Fixture, fixtures } = await createFixtures(f => {
    f.withUser({
      email_addresses: ['test@clerk.com'],
      organization_memberships: payer === 'organization' ? ['org_first'] : undefined,
    });
    if (payer === 'organization') {
      f.withOrganizations();
    }
    f.withBilling();
  });
  if (payer === 'organization') {
    vi.spyOn(fixtures.clerk.session!, 'checkAuthorization').mockReturnValue(true);
  }
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <SubscriberTypeContext.Provider value={payer}>{children}</SubscriberTypeContext.Provider>
    </Fixture>
  );
  return { wrapper, fixtures };
}

describe('Account credit data boundaries', () => {
  it('keeps a captured balance view independent from later SDK mutations', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const source = { balance: { ...amount(), reload: vi.fn() } };
    fixtures.clerk.billing.getCreditBalance.mockResolvedValue(source);
    const { result } = renderHook(useAccountCreditsModel, { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    const snapshot = result.current;
    if (snapshot.status !== 'ready') {
      throw new Error('Expected a ready balance');
    }
    const { getByText, getByRole, rerender, userEvent } = render(<AccountCreditsView {...snapshot} />, { wrapper });
    expect(getByText('$10.00')).toBeVisible();
    source.balance.amount = 9000;
    source.balance.amountFormatted = '90.00';
    rerender(<AccountCreditsView {...snapshot} />);
    expect(getByText('$10.00')).toBeVisible();
    expect(snapshot.balance).not.toHaveProperty('reload');
    expect(source.balance.reload).not.toHaveBeenCalled();
    await userEvent.click(getByRole('button', { name: 'View credit history' }));
    expect(fixtures.router.navigate).toHaveBeenCalledWith('credit-history');
  });

  it('updates copied amounts when existing balance data changes and the model renders again', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const source = { balance: amount() };
    fixtures.clerk.billing.getCreditBalance.mockResolvedValue(source);
    const { result, rerender } = renderHook(useAccountCreditsModel, { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    source.balance.amount = 9000;
    source.balance.amountFormatted = '90.00';
    rerender();
    if (result.current.status !== 'ready') {
      throw new Error('Expected a ready balance');
    }
    expect(result.current.balance.amountFormatted).toBe('90.00');
  });

  it('copies ledger amounts and preserves captured dates without passing Date objects to the view', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const source = history();
    const expectedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
      source.data[0].createdAt,
    );
    fixtures.clerk.billing.getCreditHistory.mockResolvedValue(source);
    const { result } = renderHook(useCreditHistoryModel, { wrapper });
    await waitFor(() => {
      expect(result.current.entries).toHaveLength(1);
    });
    const snapshot = result.current;
    const { getByText, getByRole, rerender, userEvent } = render(<CreditHistoryView {...snapshot} />, { wrapper });
    source.data[0].amount.amount = 9900;
    source.data[0].amount.amountFormatted = '99.00';
    source.data[0].createdAt.setUTCFullYear(2030);
    rerender(<CreditHistoryView {...snapshot} />);
    expect(getByText('$10.00')).toBeVisible();
    expect(getByText(expectedDate)).toBeVisible();
    expect(typeof snapshot.entries[0].createdAt).toBe('number');
    await userEvent.click(getByRole('heading', { name: 'Account credit history' }));
    expect(fixtures.router.navigate).toHaveBeenCalledWith('../');
  });

  it('shows zero balance and hides a missing balance', async () => {
    const { wrapper, fixtures } = await createWrapper();
    fixtures.clerk.billing.getCreditBalance.mockResolvedValue({ balance: amount(0) });
    const { findByText, unmount } = render(<AccountCredits />, { wrapper });
    expect(await findByText('$0.00')).toBeVisible();
    unmount();
    const { wrapper: Next, fixtures: nextFixtures } = await createWrapper();
    nextFixtures.clerk.billing.getCreditBalance.mockResolvedValue({ balance: null });
    const { result } = renderHook(useAccountCreditsModel, { wrapper: Next });
    await waitFor(() => {
      expect(nextFixtures.clerk.billing.getCreditBalance).toHaveBeenCalled();
    });
    expect(result.current.status).toBe('hidden');
  });

  it('shows an empty ledger without changing its source data', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const source = Object.freeze({ data: Object.freeze([]), total_count: 0 });
    fixtures.clerk.billing.getCreditHistory.mockResolvedValue(source);
    const { findByRole, queryByText } = render(<CreditHistoryPage />, { wrapper });
    expect(await findByRole('heading', { name: 'Account credit history' })).toBeVisible();
    expect(queryByText('$10.00')).not.toBeInTheDocument();
    expect(source.data).toHaveLength(0);
  });

  it.each(['user', 'organization'] as const)(
    'hides the previous %s balance while the next account loads',
    async payer => {
      const { wrapper, fixtures } = await createWrapper(payer);
      const deferred = createDeferredPromise();
      fixtures.clerk.billing.getCreditBalance
        .mockResolvedValueOnce({ balance: amount() })
        .mockReturnValue(deferred.promise);
      const { findByText, queryByText, rerender } = render(<AccountCredits />, { wrapper });
      expect(await findByText('$10.00')).toBeVisible();
      const nextUser = { ...fixtures.clerk.user!, id: 'user_second' };
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(nextUser);
      fixtures.clerk.__internal_lastEmittedResources = {
        ...fixtures.clerk.__internal_lastEmittedResources!,
        user: nextUser,
      };
      rerender(<AccountCredits />);
      await waitFor(() => {
        expect(queryByText('$10.00')).not.toBeInTheDocument();
      });
      await act(async () => {
        deferred.resolve({ balance: amount(2000) });
        await deferred.promise;
      });
      expect(await findByText('$20.00')).toBeVisible();
    },
  );

  it.each(['user', 'organization'] as const)(
    'hides the previous %s history while the next account loads',
    async payer => {
      const { wrapper, fixtures } = await createWrapper(payer);
      const deferred = createDeferredPromise();
      fixtures.clerk.billing.getCreditHistory.mockResolvedValueOnce(history()).mockReturnValue(deferred.promise);
      const { findByText, queryByText, rerender } = render(<CreditHistoryPage />, { wrapper });
      expect(await findByText('$10.00')).toBeVisible();
      const nextUser = { ...fixtures.clerk.user!, id: 'user_second' };
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(nextUser);
      fixtures.clerk.__internal_lastEmittedResources = {
        ...fixtures.clerk.__internal_lastEmittedResources!,
        user: nextUser,
      };
      rerender(<CreditHistoryPage />);
      await waitFor(() => {
        expect(queryByText('$10.00')).not.toBeInTheDocument();
      });
      await act(async () => {
        deferred.resolve(history(2000));
        await deferred.promise;
      });
      expect(await findByText('$20.00')).toBeVisible();
    },
  );
});
