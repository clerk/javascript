import type { APIKeyResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { fireEvent } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook } from '@/test/utils';
import { ActionContext } from '@/ui/elements/Action/ActionRoot';
import { CardStateProvider } from '@/ui/elements/contexts';

import { useAPIKeyRequestScopeModel } from '../api-key-request-scope.model';
import { useAPIKeysPageModel } from '../api-keys.model';
import { toAPIKeyRow } from '../api-keys-table.model';
import { useCopyAPIKeyController } from '../copy-api-key.controller';
import { CreateAPIKeyForm } from '../CreateAPIKeyForm';
import { useRevokeAPIKeyModel } from '../revoke-api-key.model';

const state = vi.hoisted(() => ({
  rows: [] as APIKeyResource[],
  revalidate: vi.fn(),
  fetchPage: vi.fn(),
  close: vi.fn(),
  copy: vi.fn().mockReturnValue(true),
}));

vi.mock('copy-to-clipboard', () => ({ default: state.copy }));
vi.mock('@clerk/shared/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@clerk/shared/react')>()),
  useAPIKeys: () => ({
    data: state.rows,
    isLoading: false,
    isFetching: false,
    page: 1,
    pageCount: 1,
    count: state.rows.length,
    fetchPage: state.fetchPage,
    revalidate: state.revalidate,
  }),
}));

const { createFixtures } = bindCreateFixtures('APIKeys');

async function createWrapper() {
  const { wrapper: Fixture, fixtures } = await createFixtures(f => {
    f.withUser({ email_addresses: ['test@clerk.com'] });
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>
        <ActionContext.Provider value={{ value: { active: 'add-api-key', open: vi.fn(), close: state.close } }}>
          {children}
        </ActionContext.Provider>
      </CardStateProvider>
    </Fixture>
  );
  return { wrapper, fixtures };
}

beforeEach(() => {
  state.rows = [];
  state.revalidate.mockReset().mockResolvedValue({ data: [{ reload: vi.fn() }] });
  state.fetchPage.mockReset();
  state.close.mockReset();
  state.copy.mockReset().mockReturnValue(true);
});
afterEach(() => vi.useRealTimers());

describe('API key command boundaries', () => {
  it('returns copied key values and discards revocation and query resource results', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const key = { name: 'New key', secret: 'secret_123', reload: vi.fn() };
    fixtures.clerk.apiKeys.create = vi.fn().mockResolvedValue(key);
    fixtures.clerk.apiKeys.revoke = vi.fn().mockResolvedValue(key);
    const { result } = renderHook(
      () => ({
        page: useAPIKeysPageModel({ subject: 'user_123', query: '' }, useAPIKeyRequestScopeModel('user_123')),
        revoke: useRevokeAPIKeyModel(),
      }),
      { wrapper },
    );

    const created = await result.current.page.createAPIKey({ name: 'New key', secondsUntilExpiration: undefined });
    expect(created).toEqual({ name: 'New key', secret: 'secret_123' });
    expect(fixtures.clerk.apiKeys.create).toHaveBeenCalledWith({
      subject: 'user_123',
      name: 'New key',
      secondsUntilExpiration: undefined,
    });
    key.secret = 'changed';
    expect(created?.secret).toBe('secret_123');
    await expect(result.current.revoke.revoke('key_123')).resolves.toBe(true);
    await expect(result.current.page.invalidateAll()).resolves.toBeUndefined();
  });

  it('copies resource dates while preserving localization keys', () => {
    const createdAt = new Date('2027-01-01');
    const expiration = new Date('2028-01-01');
    const row = toAPIKeyRow({ id: 'key_123', name: 'Key', createdAt, expiration } as APIKeyResource);
    expect(row.createdStatus.key).toBe('apiKeys.createdAndExpirationStatus__expiresOn');
    expect(row.createdStatus.params?.createdDate).not.toBe(createdAt);
    expect(row.createdStatus.params?.expiresDate).not.toBe(expiration);
    createdAt.setUTCFullYear(2030);
    expiration.setUTCFullYear(2031);
    expect(row.createdStatus.params?.createdDate).toEqual(new Date('2027-01-01'));
    expect(row.createdStatus.params?.expiresDate).toEqual(new Date('2028-01-01'));
  });

  it('keeps the create form busy until its command completes', async () => {
    const { wrapper } = await createWrapper();
    const completion = createDeferredPromise();
    const onCreate = vi.fn(async () => {
      await completion.promise;
    });
    const { container, getByRole } = render(<CreateAPIKeyForm onCreate={onCreate} />, { wrapper });
    fireEvent.change(getByRole('textbox', { name: /name/i }), { target: { value: 'New key' } });
    const submitButton = getByRole('button', { name: /create key/i });
    act(() => {
      fireEvent.submit(container.querySelector('form')!);
    });

    expect(onCreate).toHaveBeenCalledOnce();
    expect(submitButton).toBeDisabled();
    await act(async () => {
      completion.resolve();
      await completion.promise;
    });
    expect(submitButton).not.toBeDisabled();
  });

  it.each(['unmount', 'key change'] as const)('cancels delayed form closure on %s', async change => {
    const { wrapper } = await createWrapper();
    vi.useFakeTimers();
    const onClose = vi.fn();
    const { result, unmount, rerender } = renderHook(
      ({ secret }) =>
        useCopyAPIKeyController({
          isOpen: true,
          onOpen: vi.fn(),
          onClose,
          apiKeyName: 'Key',
          apiKeySecret: secret,
        }),
      { wrapper, initialProps: { secret: 'secret_123' } },
    );
    act(() => result.current.handleSubmit());
    expect(state.copy).toHaveBeenCalledWith('secret_123', expect.any(Object));
    expect(onClose).toHaveBeenCalledOnce();
    if (change === 'unmount') {
      unmount();
    } else {
      rerender({ secret: 'secret_456' });
    }
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(state.close).not.toHaveBeenCalled();
  });

  it('closes the form after copying while the owner remains mounted', async () => {
    const { wrapper } = await createWrapper();
    vi.useFakeTimers();
    const { result } = renderHook(
      () =>
        useCopyAPIKeyController({
          isOpen: true,
          onOpen: vi.fn(),
          onClose: vi.fn(),
          apiKeyName: 'Key',
          apiKeySecret: 'secret_123',
        }),
      { wrapper },
    );
    act(() => result.current.handleSubmit());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(state.close).toHaveBeenCalledOnce();
  });

  it('refreshes the current query when creation finishes after a search change', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const deferred = createDeferredPromise<{ name: string; secret: string }>();
    fixtures.clerk.apiKeys.create = vi.fn().mockReturnValueOnce(deferred.promise);
    const oldRefresh = state.revalidate;
    const hook = renderHook(
      ({ query }) => useAPIKeysPageModel({ subject: 'user_123', query }, useAPIKeyRequestScopeModel('user_123')),
      { wrapper, initialProps: { query: 'first' } },
    );
    const pending = hook.result.current.createAPIKey({ name: 'Key', secondsUntilExpiration: undefined });
    const currentRefresh = vi.fn().mockResolvedValue(undefined);
    state.revalidate = currentRefresh;
    hook.rerender({ query: 'second' });
    deferred.resolve({ name: 'Key', secret: 'secret_123' });
    await expect(pending).resolves.toEqual({ name: 'Key', secret: 'secret_123' });
    expect(currentRefresh).toHaveBeenCalledOnce();
    expect(oldRefresh).not.toHaveBeenCalled();
  });

  it('returns a created secret if the background query refresh fails', async () => {
    const { wrapper, fixtures } = await createWrapper();
    fixtures.clerk.apiKeys.create = vi.fn().mockResolvedValue({ name: 'Key', secret: 'secret_123' });
    state.revalidate.mockRejectedValueOnce(new Error('Refresh failed'));
    const hook = renderHook(
      () => useAPIKeysPageModel({ subject: 'user_123', query: '' }, useAPIKeyRequestScopeModel('user_123')),
      { wrapper },
    );
    await expect(hook.result.current.createAPIKey({ name: 'Key', secondsUntilExpiration: undefined })).resolves.toEqual(
      { name: 'Key', secret: 'secret_123' },
    );
  });

  it('does not revive a retained account scope after changing the subject twice', async () => {
    const { wrapper } = await createWrapper();
    const hook = renderHook(({ subject }) => useAPIKeyRequestScopeModel(subject), {
      wrapper,
      initialProps: { subject: 'first' },
    });
    const retained = hook.result.current;
    hook.rerender({ subject: 'second' });
    hook.rerender({ subject: 'first' });
    expect(retained.canRun()).toBe(false);
    expect(hook.result.current.canRun()).toBe(true);
  });
});
