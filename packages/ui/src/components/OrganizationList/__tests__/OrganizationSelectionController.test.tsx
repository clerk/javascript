import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useOrganizationListSelectionController } from '../organization-list-selection.controller';
import { MembershipPreview, PersonalAccountPreview } from '../UserMembershipList';

const { createFixtures } = bindCreateFixtures('OrganizationList');
const CardBoundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
const organization = { id: 'org_first', name: 'First organization', slug: 'first', imageUrl: '', hasImage: false };
const denied = () =>
  new ClerkAPIResponseError('Membership unavailable', {
    status: 403,
    data: [{ code: 'not_a_member_in_organization', message: 'Membership unavailable' }],
  });

async function setup() {
  return createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['first@clerk.com'] });
  });
}

const CardStatus = () => {
  const card = useCardState();
  return (
    <>
      <span role='status'>{card.isLoading ? 'loading' : 'idle'}</span>
      {card.error && <span role='alert'>{card.error}</span>}
    </>
  );
};

const Source = ({ select }: { select: () => Promise<void> }) => {
  const onClick = useOrganizationListSelectionController(select, () => 'Organization unavailable');
  return (
    <button
      type='button'
      onClick={() => void onClick()}
    >
      Select
    </button>
  );
};

const Harness = ({ source, select }: { source: string; select: () => Promise<void> }) => (
  <CardBoundary>
    <CardStatus />
    <Source
      key={source}
      select={select}
    />
  </CardBoundary>
);

describe('OrganizationList selection controller', () => {
  it('blocks sibling commands before the loading render', async () => {
    const { wrapper } = await setup();
    const FixtureWrapper = wrapper;
    const wrapped = ({ children }: PropsWithChildren) => (
      <FixtureWrapper>
        <CardBoundary>{children}</CardBoundary>
      </FixtureWrapper>
    );
    const deferred = createDeferredPromise<void>();
    const first = vi.fn(() => deferred.promise);
    const second = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(
      () => ({
        first: useOrganizationListSelectionController(first),
        second: useOrganizationListSelectionController(second),
      }),
      { wrapper: wrapped },
    );
    let pending: Promise<void>;
    act(() => {
      pending = result.current.first();
      void result.current.second();
    });
    await waitFor(() => expect(first).toHaveBeenCalledOnce());
    expect(second).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve();
      await pending;
    });
  });

  it('cancels queued dispatch when the controller closes', async () => {
    const { wrapper } = await setup();
    const FixtureWrapper = wrapper;
    const wrapped = ({ children }: PropsWithChildren) => (
      <FixtureWrapper>
        <CardBoundary>{children}</CardBoundary>
      </FixtureWrapper>
    );
    const select = vi.fn().mockResolvedValue(undefined);
    const { result, unmount } = renderHook(() => useOrganizationListSelectionController(select), { wrapper: wrapped });
    let pending: Promise<void>;
    act(() => {
      pending = result.current();
      unmount();
    });
    await pending!;
    expect(select).not.toHaveBeenCalled();
  });

  it('keeps a request through rerender and releases only its own loading state on source change', async () => {
    const { wrapper } = await setup();
    const FixtureWrapper = wrapper;
    const wrapped = ({ children }: PropsWithChildren) => (
      <FixtureWrapper>
        <CardBoundary>{children}</CardBoundary>
      </FixtureWrapper>
    );
    const first = createDeferredPromise<void>();
    const second = createDeferredPromise<void>();
    const firstSelect = vi.fn(() => first.promise);
    const secondSelect = vi.fn(() => second.promise);
    const { result, rerender } = renderHook(
      ({ requestKey, select }) => ({
        select: useOrganizationListSelectionController(select, undefined, { requestKey, canRun: () => true }),
        card: useCardState(),
      }),
      { wrapper: wrapped, initialProps: { requestKey: 'first', select: firstSelect } },
    );
    let pending: Promise<void>;
    act(() => {
      pending = result.current.select();
    });
    await waitFor(() => expect(firstSelect).toHaveBeenCalledOnce());
    rerender({ requestKey: 'first', select: firstSelect });
    expect(result.current.select()).toBe(pending!);
    rerender({ requestKey: 'second', select: secondSelect });
    expect(result.current.card.isLoading).toBe(false);
    let replacement: Promise<void>;
    act(() => {
      replacement = result.current.select();
    });
    await waitFor(() => expect(secondSelect).toHaveBeenCalledOnce());
    await act(async () => {
      first.resolve();
      await pending;
    });
    expect(result.current.card.isLoading).toBe(true);
    await act(async () => {
      second.resolve();
      await replacement;
    });
    expect(result.current.card.isLoading).toBe(false);
  });

  it.each(['organization', 'personal'] as const)(
    'starts one %s selection for two clicks before rendering',
    async kind => {
      const { wrapper } = await setup();
      const deferred = createDeferredPromise<void>();
      const select = vi.fn(() => deferred.promise);
      const { getByRole } = render(
        <CardBoundary>
          {kind === 'organization' ? (
            <MembershipPreview
              model={{
                requestKey: 'organization',
                canRun: () => true,
                isLoaded: true,
                organizationPreview: organization,
                selectOrganization: select,
                getUnauthorizedError: () => 'Unavailable',
              }}
            />
          ) : (
            <PersonalAccountPreview
              model={{
                requestKey: 'personal',
                canRun: () => true,
                isVisible: true,
                user: { firstName: null, lastName: null, imageUrl: '' },
                selectPersonal: select,
              }}
            />
          )}
        </CardBoundary>,
        { wrapper },
      );
      const button = getByRole('button', { name: kind === 'organization' ? /First organization/ : /Personal account/ });
      act(() => {
        button.click();
        button.click();
      });
      await waitFor(() => expect(select).toHaveBeenCalledOnce());
      expect(button).toBeDisabled();
      await act(async () => {
        deferred.resolve();
        await deferred.promise;
      });
      expect(button).toBeEnabled();
    },
  );

  it.each(['success', 'failure'] as const)('does not affect a replacement source after an old %s', async outcome => {
    const { wrapper } = await setup();
    const first = createDeferredPromise<void>();
    const second = createDeferredPromise<void>();
    const firstSelect = vi.fn(() => first.promise);
    const secondSelect = vi.fn(() => second.promise);
    const { getByRole, queryByRole, rerender, userEvent } = render(
      <Harness
        source='first'
        select={firstSelect}
      />,
      { wrapper },
    );
    await userEvent.click(getByRole('button', { name: 'Select' }));
    rerender(
      <Harness
        source='second'
        select={secondSelect}
      />,
    );
    await waitFor(() => expect(getByRole('status')).toHaveTextContent('idle'));
    await userEvent.click(getByRole('button', { name: 'Select' }));
    await act(async () => {
      if (outcome === 'success') {
        first.resolve();
      } else {
        first.reject(denied());
      }
      await first.promise.catch(() => {});
    });
    expect(getByRole('status')).toHaveTextContent('loading');
    expect(queryByRole('alert')).not.toBeInTheDocument();
    await act(async () => {
      second.resolve();
      await second.promise;
    });
    expect(getByRole('status')).toHaveTextContent('idle');
  });

  it('preserves the localized membership error and permits a retry', async () => {
    const { wrapper } = await setup();
    const select = vi.fn().mockRejectedValueOnce(denied()).mockResolvedValueOnce(undefined);
    const { getByRole, findByRole, userEvent } = render(
      <Harness
        source='first'
        select={select}
      />,
      { wrapper },
    );
    await userEvent.click(getByRole('button', { name: 'Select' }));
    expect(await findByRole('alert')).toHaveTextContent('Organization unavailable');
    expect(getByRole('status')).toHaveTextContent('idle');
    await userEvent.click(getByRole('button', { name: 'Select' }));
    expect(select).toHaveBeenCalledTimes(2);
  });

  it('permits a personal-account retry after a synchronous API failure', async () => {
    const { wrapper } = await setup();
    const select = vi
      .fn()
      .mockImplementationOnce(() => {
        throw denied();
      })
      .mockResolvedValueOnce(undefined);
    const { getByRole, findByRole, userEvent } = render(
      <CardBoundary>
        <CardStatus />
        <PersonalAccountPreview
          model={{
            requestKey: 'personal',
            canRun: () => true,
            isVisible: true,
            user: { firstName: null, lastName: null, imageUrl: '' },
            selectPersonal: select,
          }}
        />
      </CardBoundary>,
      { wrapper },
    );
    const button = getByRole('button', { name: /Personal account/ });
    await userEvent.click(button);
    expect(await findByRole('alert')).toBeVisible();
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(select).toHaveBeenCalledTimes(2);
  });

  it('rejects a selection command captured before its source unmounts', async () => {
    const { wrapper } = await setup();
    const FixtureWrapper = wrapper;
    const wrapped = ({ children }: PropsWithChildren) => (
      <FixtureWrapper>
        <CardBoundary>{children}</CardBoundary>
      </FixtureWrapper>
    );
    const select = vi.fn().mockResolvedValue(undefined);
    const { result, unmount } = renderHook(() => useOrganizationListSelectionController(select), { wrapper: wrapped });
    const onClick = result.current;
    unmount();
    await onClick();
    expect(select).not.toHaveBeenCalled();
  });
  it('disables organization rows while a personal selection is pending', async () => {
    const { wrapper } = await setup();
    const deferred = createDeferredPromise<void>();
    const selectPersonal = vi.fn(() => deferred.promise);
    const selectOrganization = vi.fn().mockResolvedValue(undefined);
    const { getByRole, userEvent } = render(
      <CardBoundary>
        <PersonalAccountPreview
          model={{
            requestKey: 'personal',
            canRun: () => true,
            isVisible: true,
            user: { firstName: null, lastName: null, imageUrl: '' },
            selectPersonal,
          }}
        />
        <MembershipPreview
          model={{
            requestKey: 'organization',
            canRun: () => true,
            isLoaded: true,
            organizationPreview: organization,
            selectOrganization,
            getUnauthorizedError: () => 'Unavailable',
          }}
        />
      </CardBoundary>,
      { wrapper },
    );
    await userEvent.click(getByRole('button', { name: /Personal account/ }));
    const membership = getByRole('button', { name: /First organization/ });
    expect(membership).toBeDisabled();
    act(() => membership.click());
    expect(selectOrganization).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(membership).toBeEnabled();
  });
});
