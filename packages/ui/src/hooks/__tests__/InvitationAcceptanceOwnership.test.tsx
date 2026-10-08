import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useInvitationAcceptanceController } from '../useInvitationAcceptanceController';

const { createFixtures } = bindCreateFixtures('OrganizationSwitcher');
const CardBoundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);

const CardStatus = () => {
  const card = useCardState();
  return (
    <>
      <span role='status'>{card.isLoading ? 'loading' : 'idle'}</span>
      {card.error && <span role='alert'>{card.error}</span>}
    </>
  );
};

const Source = ({ accept }: { accept: () => Promise<string> }) => {
  const controller = useInvitationAcceptanceController(accept);
  return (
    <button
      type='button'
      onClick={() => void controller.onAccept()}
    >
      {controller.state.status}
    </button>
  );
};

const Harness = ({ source, accept }: { source: string; accept: () => Promise<string> }) => (
  <CardBoundary>
    <CardStatus />
    <Source
      key={source}
      accept={accept}
    />
  </CardBoundary>
);

async function setup() {
  return createFixtures(f => {
    f.withUser({ email_addresses: ['first@clerk.com'] });
  });
}

describe('Invitation acceptance source ownership', () => {
  it('blocks a sibling acceptance before React renders loading state', async () => {
    const { wrapper } = await setup();
    const FixtureWrapper = wrapper;
    const wrapped = ({ children }: PropsWithChildren) => (
      <FixtureWrapper>
        <CardBoundary>{children}</CardBoundary>
      </FixtureWrapper>
    );
    const deferred = createDeferredPromise<string>();
    const first = vi.fn(() => deferred.promise);
    const second = vi.fn().mockResolvedValue('second');
    const { result } = renderHook(
      () => ({
        first: useInvitationAcceptanceController(first),
        second: useInvitationAcceptanceController(second),
      }),
      { wrapper: wrapped },
    );
    let pending: Promise<void>;
    act(() => {
      pending = result.current.first.onAccept();
      void result.current.second.onAccept();
    });
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
    expect(result.current.second.state.status).toBe('idle');
    await act(async () => {
      deferred.resolve('first');
      await pending;
    });
    await act(async () => {
      await result.current.second.onAccept();
    });
    expect(second).toHaveBeenCalledOnce();
  });

  it('uses the current acceptance callback from a retained command', async () => {
    const { wrapper } = await setup();
    const FixtureWrapper = wrapper;
    const wrapped = ({ children }: PropsWithChildren) => (
      <FixtureWrapper>
        <CardBoundary>{children}</CardBoundary>
      </FixtureWrapper>
    );
    const first = vi.fn().mockResolvedValue('first');
    const latest = vi.fn().mockResolvedValue('latest');
    const { result, rerender } = renderHook(({ accept }) => useInvitationAcceptanceController(accept), {
      wrapper: wrapped,
      initialProps: { accept: first },
    });
    const retained = result.current.onAccept;
    rerender({ accept: latest });
    await act(async () => {
      await retained();
    });
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledOnce();
    expect(result.current.state).toEqual({ status: 'accepted', value: 'latest' });
  });

  it('cannot clear loading owned by another Card action', async () => {
    const { wrapper } = await setup();
    const FixtureWrapper = wrapper;
    const wrapped = ({ children }: PropsWithChildren) => (
      <FixtureWrapper>
        <CardBoundary>{children}</CardBoundary>
      </FixtureWrapper>
    );
    const deferred = createDeferredPromise<string>();
    const accept = vi.fn(() => deferred.promise);
    const { result } = renderHook(
      () => ({
        controller: useInvitationAcceptanceController(accept),
        card: useCardState(),
      }),
      { wrapper: wrapped },
    );
    let release: (() => void) | undefined;
    act(() => {
      release = result.current.card.beginRequest();
    });
    await act(async () => {
      await result.current.controller.onAccept();
    });
    expect(accept).not.toHaveBeenCalled();
    expect(result.current.card.isLoading).toBe(true);
    expect(result.current.controller.state.status).toBe('idle');
    act(() => {
      release?.();
    });
    expect(result.current.card.isLoading).toBe(false);
  });

  it.each(['success', 'failure'] as const)('keeps the new source loading after an old %s', async outcome => {
    const { wrapper } = await setup();
    const first = createDeferredPromise<string>();
    const second = createDeferredPromise<string>();
    const firstAccept = vi.fn(() => first.promise);
    const secondAccept = vi.fn(() => second.promise);
    const { getByRole, queryByRole, userEvent, rerender } = render(
      <Harness
        source='first'
        accept={firstAccept}
      />,
      { wrapper },
    );
    await userEvent.click(getByRole('button', { name: 'idle' }));
    expect(getByRole('status')).toHaveTextContent('loading');
    rerender(
      <Harness
        source='second'
        accept={secondAccept}
      />,
    );
    await waitFor(() => expect(getByRole('status')).toHaveTextContent('idle'));
    await userEvent.click(getByRole('button', { name: 'idle' }));
    expect(secondAccept).toHaveBeenCalledOnce();
    await act(async () => {
      if (outcome === 'success') {
        first.resolve('first accepted');
      } else {
        first.reject(new Error('Old invitation failed'));
      }
      await first.promise.catch(() => {});
    });
    expect(getByRole('status')).toHaveTextContent('loading');
    expect(getByRole('button', { name: 'pending' })).toBeInTheDocument();
    expect(queryByRole('alert')).not.toBeInTheDocument();
    await act(async () => {
      second.resolve('second accepted');
      await second.promise;
    });
    await waitFor(() => expect(getByRole('status')).toHaveTextContent('idle'));
    expect(getByRole('button', { name: 'accepted' })).toBeInTheDocument();
  });

  it('rejects an acceptance command captured from an unmounted source', async () => {
    const { wrapper } = await setup();
    const FixtureWrapper = wrapper;
    const wrapped = ({ children }: PropsWithChildren) => (
      <FixtureWrapper>
        <CardBoundary>{children}</CardBoundary>
      </FixtureWrapper>
    );
    const accept = vi.fn().mockResolvedValue('accepted');
    const { result, unmount } = renderHook(() => useInvitationAcceptanceController(accept), { wrapper: wrapped });
    const onAccept = result.current.onAccept;
    unmount();
    await onAccept();
    expect(accept).not.toHaveBeenCalled();
  });
});
