import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import type { RevokeAPIKeyConfirmationModalProps } from '../api-keys.types';
import { useRevokeAPIKeyModel } from '../revoke-api-key.model';
import { RevokeAPIKeyConfirmationModal } from '../RevokeAPIKeyConfirmationModal';

const { createFixtures } = bindCreateFixtures('APIKeys');
const failure = () =>
  new ClerkAPIResponseError('Revoke failed', {
    status: 422,
    data: [{ code: 'revoke_failed', message: 'Revoke failed', long_message: 'Revoke failed' }],
  });
async function setup() {
  const fixture = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
  fixture.fixtures.clerk.apiKeys.revoke = vi.fn().mockResolvedValue(undefined);
  const callbacks = { onOpen: vi.fn(), onClose: vi.fn(), onRevokeSuccess: vi.fn() };
  const props: RevokeAPIKeyConfirmationModalProps = {
    isOpen: true,
    apiKeyID: 'first',
    apiKeyName: 'First',
    ...callbacks,
  };
  const view = (overrides: Partial<RevokeAPIKeyConfirmationModalProps> = {}) => (
    <CardStateProvider>
      <StrictMode>
        <RevokeAPIKeyConfirmationModal
          {...props}
          {...overrides}
        />
      </StrictMode>
    </CardStateProvider>
  );
  const rendered = render(view(), { wrapper: fixture.wrapper });
  const confirm = async () => {
    await rendered.userEvent.type(rendered.getByRole('textbox'), 'Revoke');
  };
  return { ...fixture, ...rendered, callbacks, view, confirm };
}

describe('API key revocation ownership', () => {
  it('shares one pending request and runs one success callback and close action', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<void>();
    view.fixtures.clerk.apiKeys.revoke = vi.fn().mockReturnValue(deferred.promise);
    await view.confirm();
    const form = view.getByRole('textbox').closest('form')!;
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    await waitFor(() => expect(view.fixtures.clerk.apiKeys.revoke).toHaveBeenCalledOnce());
    expect(view.getByRole('button', { name: /cancel/i })).toBeDisabled();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    await waitFor(() => expect(view.callbacks.onClose).toHaveBeenCalledOnce());
    expect(view.callbacks.onRevokeSuccess).toHaveBeenCalledOnce();
  });

  it.each(['success', 'failure'] as const)(
    'ignores old %s and preserves a replacement dialog request',
    async outcome => {
      const view = await setup();
      const first = createDeferredPromise<void>();
      const second = createDeferredPromise<void>();
      view.fixtures.clerk.apiKeys.revoke = vi
        .fn()
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise);
      await view.confirm();
      fireEvent.submit(view.getByRole('textbox').closest('form')!);
      await waitFor(() => expect(view.fixtures.clerk.apiKeys.revoke).toHaveBeenCalledOnce());
      view.rerender(view.view({ apiKeyID: 'second', apiKeyName: 'Second' }));
      expect(view.getByRole('textbox')).toHaveValue('');
      await view.confirm();
      fireEvent.submit(view.getByRole('textbox').closest('form')!);
      await waitFor(() => expect(view.fixtures.clerk.apiKeys.revoke).toHaveBeenCalledTimes(2));
      await act(async () => {
        if (outcome === 'success') {
          first.resolve();
        } else {
          first.reject(failure());
        }
        await first.promise.catch(() => {});
      });
      expect(view.callbacks.onClose).not.toHaveBeenCalled();
      expect(view.callbacks.onRevokeSuccess).not.toHaveBeenCalled();
      expect(view.queryByText('Revoke failed')).not.toBeInTheDocument();
      expect(view.getByRole('button', { name: /cancel/i })).toBeDisabled();
      await act(async () => {
        second.resolve();
        await second.promise;
      });
      await waitFor(() => expect(view.callbacks.onClose).toHaveBeenCalledOnce());
      expect(view.callbacks.onRevokeSuccess).toHaveBeenCalledOnce();
      expect(view.fixtures.clerk.apiKeys.revoke).toHaveBeenNthCalledWith(2, { apiKeyID: 'second' });
    },
  );

  it('resets confirmation and ignores the old result when the same key dialog reopens', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<void>();
    view.fixtures.clerk.apiKeys.revoke = vi.fn().mockReturnValueOnce(deferred.promise);
    await view.confirm();
    fireEvent.submit(view.getByRole('textbox').closest('form')!);
    await waitFor(() => expect(view.fixtures.clerk.apiKeys.revoke).toHaveBeenCalledOnce());
    view.rerender(view.view({ isOpen: false }));
    view.rerender(view.view());
    expect(view.getByRole('textbox')).toHaveValue('');
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(view.callbacks.onClose).not.toHaveBeenCalled();
    expect(view.callbacks.onRevokeSuccess).not.toHaveBeenCalled();
    expect(view.getByRole('textbox')).toBeVisible();
  });

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks retained revoke commands after the canonical %s changes',
    async field => {
      const fixture = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
      fixture.fixtures.clerk.apiKeys.revoke = vi.fn();
      const hook = renderHook(() => useRevokeAPIKeyModel('first'), { wrapper: fixture.wrapper });
      vi.spyOn(fixture.fixtures.clerk, field, 'get').mockReturnValue({
        ...fixture.fixtures.clerk[field],
        id: 'other',
      } as never);
      await expect(hook.result.current.revoke('first')).resolves.toBe(false);
      expect(fixture.fixtures.clerk.apiKeys.revoke).not.toHaveBeenCalled();
    },
  );

  it('uses current callbacks for a request on the same key', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<void>();
    view.fixtures.clerk.apiKeys.revoke = vi.fn().mockReturnValueOnce(deferred.promise);
    await view.confirm();
    fireEvent.submit(view.getByRole('textbox').closest('form')!);
    await waitFor(() => expect(view.fixtures.clerk.apiKeys.revoke).toHaveBeenCalledOnce());
    const onClose = vi.fn();
    const onRevokeSuccess = vi.fn();
    view.rerender(view.view({ onClose, onRevokeSuccess }));
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(onRevokeSuccess).toHaveBeenCalledOnce();
    expect(view.callbacks.onClose).not.toHaveBeenCalled();
    expect(view.callbacks.onRevokeSuccess).not.toHaveBeenCalled();
  });

  it('does not close a replacement dialog after a delayed success callback', async () => {
    const view = await setup();
    const delay = createDeferredPromise<void>();
    view.callbacks.onRevokeSuccess.mockReturnValueOnce(delay.promise);
    await view.confirm();
    fireEvent.submit(view.getByRole('textbox').closest('form')!);
    await waitFor(() => expect(view.callbacks.onRevokeSuccess).toHaveBeenCalledOnce());
    view.rerender(view.view({ apiKeyID: 'second', apiKeyName: 'Second' }));
    await act(async () => {
      delay.resolve();
      await delay.promise;
    });
    expect(view.callbacks.onClose).not.toHaveBeenCalled();
    expect(view.getByRole('textbox')).toBeVisible();
  });

  it('handles a current failure and permits another submission', async () => {
    const view = await setup();
    view.fixtures.clerk.apiKeys.revoke = vi
      .fn()
      .mockImplementationOnce(() => {
        throw failure();
      })
      .mockResolvedValue(undefined);
    await view.confirm();
    fireEvent.submit(view.getByRole('textbox').closest('form')!);
    expect(await view.findByText('Revoke failed')).toBeVisible();
    await waitFor(() => expect(view.getByRole('button', { name: /cancel/i })).not.toBeDisabled());
    fireEvent.submit(view.getByRole('textbox').closest('form')!);
    await waitFor(() => expect(view.callbacks.onClose).toHaveBeenCalledOnce());
    expect(view.fixtures.clerk.apiKeys.revoke).toHaveBeenCalledTimes(2);
  });

  it('cancels queued dispatch when the modal unmounts immediately', async () => {
    const view = await setup();
    await view.confirm();
    act(() => {
      fireEvent.submit(view.getByRole('textbox').closest('form')!);
      view.unmount();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(view.fixtures.clerk.apiKeys.revoke).not.toHaveBeenCalled();
  });
});
