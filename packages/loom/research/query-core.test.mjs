import { QueryClient, QueryObserver, dehydrate, hydrate } from '@tanstack/query-core';
import { expect, test, vi } from 'vitest';

test('plain JavaScript observers and prefetch share one request and fresh entry', async () => {
  expect(typeof window).toBe('undefined');
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const response = Promise.withResolvers();
  const queryFn = vi.fn(() => response.promise);
  const options = { queryKey: ['sessions', 'runtime_a', 'user_a', 'session_a'], queryFn, staleTime: 30_000 };
  const observer = new QueryObserver(client, options);
  const states = [];
  const unsubscribe = observer.subscribe(state => states.push(state.status));
  const hover = client.prefetchQuery(options);
  const focus = client.prefetchQuery(options);
  const read = client.fetchQuery(options);
  expect(queryFn).toHaveBeenCalledTimes(1);
  response.resolve([{ id: 'session_a', latestActivity: { city: 'Denver' } }]);
  await Promise.all([hover, focus, read]);
  expect(states).toEqual(['pending', 'success']);
  await client.fetchQuery(options);
  expect(queryFn).toHaveBeenCalledTimes(1);
  await observer.refetch();
  expect(queryFn).toHaveBeenCalledTimes(2);
  unsubscribe();
  expect(client.getQueryCache().getAll()[0].getObserversCount()).toBe(0);
  client.clear();
});

test('empty, background failure, prefetch failure, and recovery stay distinguishable', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const error = new Error('transport failed');
  const queryFn = vi
    .fn()
    .mockResolvedValueOnce([])
    .mockRejectedValueOnce(error)
    .mockResolvedValueOnce([{ id: 'recovered' }]);
  const options = { queryKey: ['sessions'], queryFn, staleTime: 0 };
  await client.fetchQuery(options);
  expect(client.getQueryState(options.queryKey).status).toBe('success');
  await expect(client.prefetchQuery(options)).resolves.toBeUndefined();
  expect(client.getQueryState(options.queryKey).status).toBe('error');
  expect(client.getQueryState(options.queryKey).data).toEqual([]);
  expect(client.getQueryState(options.queryKey).error).toBe(error);
  expect(await client.fetchQuery(options)).toEqual([{ id: 'recovered' }]);
  client.clear();
});

test('request-local clients isolate identical keys and hydrate serializable snapshots', async () => {
  const first = new QueryClient();
  const second = new QueryClient();
  const key = ['sessions'];
  await Promise.all([
    first.fetchQuery({ queryKey: key, queryFn: async () => [{ id: 'alice' }] }),
    second.fetchQuery({ queryKey: key, queryFn: async () => [{ id: 'bob' }] }),
  ]);
  const serialized = JSON.stringify(dehydrate(first));
  expect(serialized).not.toContain('bob');
  const browser = new QueryClient();
  hydrate(browser, JSON.parse(serialized));
  expect(browser.getQueryData(key)).toEqual([{ id: 'alice' }]);
  expect(second.getQueryData(key)).toEqual([{ id: 'bob' }]);
  first.clear();
  second.clear();
  browser.clear();
});

test('an unguarded late read can restore a session removed by a mutation', async () => {
  const client = new QueryClient();
  const key = ['sessions'];
  const stale = Promise.withResolvers();
  client.setQueryData(key, [{ id: 'revoked' }]);
  const pending = client.fetchQuery({ queryKey: key, queryFn: () => stale.promise });
  client.setQueryData(key, []);
  stale.resolve([{ id: 'revoked' }]);
  await pending;
  expect(client.getQueryData(key)).toEqual([{ id: 'revoked' }]);
  client.clear();
});
