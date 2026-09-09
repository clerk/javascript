import { act, cleanup, render } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loaded: true,
  owner: { loaded: true, publishableKey: 'pk_test_one' },
  options: undefined as unknown,
  connections: [] as { owner: unknown; disposed: boolean; close(): void }[],
  connect: vi.fn(),
  failures: 0,
}));
vi.mock('../../polyfills', () => ({}));
vi.mock('@clerk/react', () => ({ useAuth: () => ({ isLoaded: mocks.loaded }) }));
vi.mock('@clerk/react/internal', () => ({
  InternalClerkProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('react-native', () => ({ AppState: { addEventListener: () => ({ remove() {} }) } }));
vi.mock('../../specs/NativeClerkModule', () => ({ default: {} }));
vi.mock('../../utils/runtime', () => ({ isNative: () => true, isWeb: () => false }));
vi.mock('../singleton', () => ({
  getClerkInstance: (options: unknown) => {
    mocks.options = options;
    return mocks.owner;
  },
}));
vi.mock('../nativeResourceConnection', () => ({ connectNativeResources: mocks.connect }));
import { ClerkProvider } from '../ClerkProvider';

beforeEach(() => {
  mocks.loaded = true;
  mocks.owner = { loaded: true, publishableKey: 'pk_test_one' };
  mocks.connections = [];
  mocks.failures = 0;
  mocks.connect.mockReset().mockImplementation((owner: unknown) => {
    let close!: () => void;
    const closed = new Promise<void>(resolve => {
      close = resolve;
    });
    const state = { owner, disposed: false, close };
    mocks.connections.push(state);
    return {
      closed,
      ready: mocks.failures-- > 0 ? Promise.reject(new Error('temporary native failure')) : Promise.resolve(),
      dispose() {
        state.disposed = true;
        close();
      },
    };
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('ClerkProvider native owner projection', () => {
  test('preserves the explicit native opt-out and passes the original token cache to its sole owner', () => {
    const tokenCache = { getToken: async () => 'existing', saveToken: async () => {} };
    render(
      <ClerkProvider
        publishableKey='pk_test_one'
        tokenCache={tokenCache}
        __experimental_disableNativeClientSync
      />,
    );
    expect(mocks.connections).toEqual([]);
    expect(mocks.options).toMatchObject({ tokenCache });
  });

  test('waits for the JavaScript owner to load before attaching native views', async () => {
    mocks.loaded = false;
    mocks.owner.loaded = false;
    const view = render(<ClerkProvider publishableKey='pk_test_one' />);
    expect(mocks.connections).toEqual([]);
    mocks.loaded = true;
    mocks.owner.loaded = true;
    await act(async () => view.rerender(<ClerkProvider publishableKey='pk_test_one' />));
    expect(mocks.connections.map(value => value.owner)).toEqual([mocks.owner]);
  });

  test('StrictMode and unmount dispose projections while retaining the same JavaScript owner', async () => {
    const owner = mocks.owner;
    const view = render(
      <React.StrictMode>
        <ClerkProvider publishableKey='pk_test_one' />
      </React.StrictMode>,
    );
    await act(async () => {});
    expect(mocks.connections.filter(value => !value.disposed)).toHaveLength(1);
    expect(mocks.connections.every(value => value.owner === owner)).toBe(true);
    view.unmount();
    expect(mocks.connections.every(value => value.disposed)).toBe(true);
    expect(mocks.owner).toBe(owner);
  });

  test('switching publishable keys detaches the previous projection', async () => {
    const view = render(<ClerkProvider publishableKey='pk_test_one' />);
    const previous = mocks.connections[0];
    mocks.owner = { loaded: true, publishableKey: 'pk_test_two' };
    await act(async () => view.rerender(<ClerkProvider publishableKey='pk_test_two' />));
    expect(previous.disposed).toBe(true);
    expect(mocks.connections.at(-1)?.owner).toBe(mocks.owner);
  });

  test('retries a transient native connection failure without replacing Clerk', async () => {
    vi.useFakeTimers();
    mocks.failures = 1;
    render(<ClerkProvider publishableKey='pk_test_one' />);
    await act(async () => {});
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(mocks.connections).toHaveLength(2);
    expect(mocks.connections.every(value => value.owner === mocks.owner)).toBe(true);
  });

  test('a native disconnect reconnects the projection to the same owner', async () => {
    vi.useFakeTimers();
    render(<ClerkProvider publishableKey='pk_test_one' />);
    await act(async () => {});
    mocks.connections[0].close();
    await act(async () => {});
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(mocks.connections).toHaveLength(2);
    expect(mocks.connections.at(-1)?.owner).toBe(mocks.owner);
  });
});
