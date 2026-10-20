import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Component, type ReactNode, Suspense } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createLoomClient } from '../client';
import { LoomProvider, QueryErrorResetBoundary, useLoom, useSessions, useSuspenseSessions } from '../react';
import type { Sessions } from '../types';

const scope = { instanceKey: 'controlled-server', userId: 'user_a', sessionId: 'sess_current' };
const sessions: Sessions = [
  {
    id: 'sess_other',
    status: 'active',
    expireAt: 1000,
    abandonAt: 1000,
    lastActiveAt: 100,
    hasActor: false,
    latestActivity: { id: 'a' },
  },
];

afterEach(cleanup);

function List() {
  const query = useSessions();
  return <output>{query.isPending ? 'Loading' : query.data?.map(item => item.id).join(',') || 'Empty'}</output>;
}

function SuspenseList() {
  const query = useSuspenseSessions();
  return (
    <>
      <output>{query.data.map(item => item.id).join(',') || 'Empty'}</output>
      {query.isFetching ? <span>Refreshing</span> : null}
      {query.error ? <span>Refresh failed</span> : null}
    </>
  );
}

function Prefetch() {
  const client = useLoom();
  return (
    <button
      type='button'
      onMouseEnter={() => void client.prefetch()}
      onFocus={() => void client.prefetch()}
    >
      Devices
    </button>
  );
}

class Boundary extends Component<{ children: ReactNode; reset: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <button
        type='button'
        onClick={() => {
          this.props.reset();
          this.setState({ failed: false });
        }}
      >
        Retry
      </button>
    ) : (
      this.props.children
    );
  }
}

describe('official React adapter', () => {
  it('keeps Suspense data visible during a shared background refresh and failure', async () => {
    const pending = Promise.withResolvers<Sessions>();
    const read = vi
      .fn<() => Promise<Sessions>>()
      .mockResolvedValueOnce(sessions)
      .mockImplementationOnce(() => pending.promise);
    const client = createLoomClient({ scope, transport: { read, revoke: () => Promise.resolve() } });
    await client.prefetch();
    render(
      <LoomProvider client={client}>
        <Suspense fallback={<p>Waiting</p>}>
          <SuspenseList />
          <List />
        </Suspense>
      </LoomProvider>,
    );
    let refresh: Promise<Sessions> | undefined;
    act(() => {
      refresh = client.refresh();
    });
    await screen.findByText('Refreshing');
    expect(screen.getAllByText('sess_other')).toHaveLength(2);
    expect(read).toHaveBeenCalledTimes(2);
    const rejected = expect(refresh).rejects.toThrow('offline');
    pending.reject(new Error('offline'));
    await rejected;
    await screen.findByText('Refresh failed');
    expect(screen.getAllByText('sess_other')).toHaveLength(2);
    expect(screen.queryByText('Waiting')).toBeNull();
    cleanup();
    client.dispose();
  });
  it('switches observers when a different owner has the same authenticated scope', async () => {
    const first = createLoomClient({
      scope,
      transport: { read: () => Promise.resolve(sessions), revoke: () => Promise.resolve() },
    });
    const read = vi.fn(() => Promise.resolve([]));
    const second = createLoomClient({ scope, transport: { read, revoke: () => Promise.resolve() } });
    const view = render(
      <LoomProvider client={first}>
        <List />
      </LoomProvider>,
    );
    expect(await screen.findByText('sess_other')).toBeDefined();
    first.dispose();
    view.rerender(
      <LoomProvider client={second}>
        <List />
      </LoomProvider>,
    );
    await screen.findByText('Empty');
    expect(second.getSnapshot()?.data).toEqual([]);
    cleanup();
    second.dispose();
  });
  it('shares hover and focus prefetch with mounted consumers and remounts', async () => {
    const read = vi.fn(() => Promise.resolve(sessions));
    const client = createLoomClient({ scope, transport: { read, revoke: () => Promise.resolve() } });
    const tree = (show: boolean) => (
      <LoomProvider client={client}>
        <Prefetch />
        {show && <List />}
      </LoomProvider>
    );
    const view = render(tree(false));
    fireEvent.mouseEnter(screen.getByText('Devices'));
    fireEvent.focus(screen.getByText('Devices'));
    await waitFor(() => expect(client.getSnapshot()?.data).toEqual(sessions));
    view.rerender(tree(true));
    expect(screen.getByText('sess_other')).toBeDefined();
    view.unmount();
    render(tree(true));
    expect(screen.getByText('sess_other')).toBeDefined();
    expect(read).toHaveBeenCalledTimes(1);
    cleanup();
    client.dispose();
  });

  it('suspends, surfaces initial errors, and recovers through QueryErrorResetBoundary', async () => {
    const pending = Promise.withResolvers<Sessions>();
    const read = vi
      .fn<() => Promise<Sessions>>()
      .mockImplementationOnce(() => pending.promise)
      .mockResolvedValueOnce(sessions);
    const client = createLoomClient({ scope, transport: { read, revoke: () => Promise.resolve() } });
    const failure = new Error('offline');
    const ignoreExpected = (event: ErrorEvent) => {
      if (event.error === failure) {
        event.preventDefault();
      }
    };
    window.addEventListener('error', ignoreExpected);
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(
        <LoomProvider client={client}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <Boundary reset={reset}>
                <Suspense fallback={<p>Waiting</p>}>
                  <SuspenseList />
                </Suspense>
              </Boundary>
            )}
          </QueryErrorResetBoundary>
        </LoomProvider>,
      );
      expect(screen.getByText('Waiting')).toBeDefined();
      act(() => {
        pending.reject(failure);
      });
      fireEvent.click(await screen.findByText('Retry'));
      expect(await screen.findByText('sess_other')).toBeDefined();
      expect(read).toHaveBeenCalledTimes(2);
    } finally {
      cleanup();
      client.dispose();
      report.mockRestore();
      window.removeEventListener('error', ignoreExpected);
    }
  });

  it('renders and hydrates controlled request-local data without refetching', async () => {
    const server = createLoomClient({
      scope,
      transport: { read: () => Promise.resolve(sessions), revoke: () => Promise.resolve() },
    });
    await server.fetch();
    const state = JSON.parse(JSON.stringify(server.dehydrate()));
    const html = renderToString(
      <LoomProvider client={server}>
        <List />
      </LoomProvider>,
    );
    server.dispose();
    const read = vi.fn(() => Promise.resolve([]));
    const browser = createLoomClient({ scope, transport: { read, revoke: () => Promise.resolve() }, hydration: state });
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);
    const onRecoverableError = vi.fn();
    const root = hydrateRoot(
      container,
      <LoomProvider client={browser}>
        <List />
      </LoomProvider>,
      { onRecoverableError },
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(container.textContent).toBe('sess_other');
    expect(read).not.toHaveBeenCalled();
    expect(onRecoverableError).not.toHaveBeenCalled();
    act(() => root.unmount());
    container.remove();
    browser.dispose();
  });
});
