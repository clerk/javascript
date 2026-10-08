import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useVerifiedDomainFormController } from '../verified-domain-form.controller';
import type { VerifiedDomainFormModel } from '../verified-domain-form.types';
import { VerifiedDomainFormView } from '../verified-domain-form.view';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

async function setup() {
  const { wrapper: Fixture } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const model: VerifiedDomainFormModel = {
    scope: 'user:org:domain',
    canRun: () => true,
    retry: vi.fn(),
    available: true,
    isLoading: false,
    domain: {
      id: 'domain_1',
      name: 'clerk.com',
      enrollmentMode: 'manual_invitation',
      isVerified: true,
      totalPendingInvitations: 2,
      totalPendingSuggestions: 7,
    },
    enrollmentModes: ['manual_invitation'],
    updateEnrollmentMode: vi.fn().mockResolvedValue(true),
  };
  const onSuccess = vi.fn();
  return { model, onSuccess, wrapper };
}

describe('Verified domain action ownership', () => {
  it('preserves a selected mode when the same domain refreshes', async () => {
    const { model, onSuccess, wrapper } = await setup();
    const { result, rerender } = renderHook(() => useVerifiedDomainFormController(model, onSuccess, 'edit'), {
      wrapper,
    });
    act(() => result.current.enrollmentMode.setValue('automatic_invitation'));
    model.domain = { ...model.domain!, enrollmentMode: 'automatic_suggestion' };
    rerender();
    expect(result.current.enrollmentMode.value).toBe('automatic_invitation');
    await act(() => result.current.updateEnrollmentMode());
    expect(model.updateEnrollmentMode).toHaveBeenCalledExactlyOnceWith(
      'automatic_invitation',
      false,
      expect.any(Function),
    );
  });

  it('deduplicates pending submissions and reports success once', async () => {
    const { model, onSuccess, wrapper } = await setup();
    const completion = createDeferredPromise<boolean>();
    model.updateEnrollmentMode = vi.fn().mockReturnValue(completion.promise);
    const { result } = renderHook(() => useVerifiedDomainFormController(model, onSuccess, 'edit'), { wrapper });
    const submit = result.current.updateEnrollmentMode;
    let pending!: Promise<void>;
    act(() => {
      pending = submit();
      expect(submit()).toBe(pending);
    });
    await waitFor(() =>
      expect(model.updateEnrollmentMode).toHaveBeenCalledExactlyOnceWith(
        'manual_invitation',
        false,
        expect.any(Function),
      ),
    );
    await act(async () => {
      completion.resolve(true);
      await pending;
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('clears a known error on retry and unlocks after an unexpected synchronous failure', async () => {
    const { model, onSuccess, wrapper } = await setup();
    model.updateEnrollmentMode = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Update failed', {
          status: 422,
          data: [{ code: 'domain_update_failed', message: 'Update failed' }],
        }),
      )
      .mockImplementationOnce(() => {
        throw new Error('Unexpected failure');
      })
      .mockResolvedValue(true);
    const { result } = renderHook(
      () => ({ controller: useVerifiedDomainFormController(model, onSuccess, 'edit'), card: useCardState() }),
      { wrapper },
    );
    await act(() => result.current.controller.updateEnrollmentMode());
    expect(result.current.card.error).toBe('Update failed');
    await act(async () => {
      await expect(result.current.controller.updateEnrollmentMode()).rejects.toThrow('Unexpected failure');
    });
    expect(result.current.card.error).toBeUndefined();
    await act(() => result.current.controller.updateEnrollmentMode());
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it.each(['success', 'failure'])('ignores late %s and retained submissions after unmount', async outcome => {
    const { model, onSuccess, wrapper } = await setup();
    const completion = createDeferredPromise<boolean>();
    model.updateEnrollmentMode = vi.fn().mockReturnValue(completion.promise);
    const { result, unmount } = renderHook(() => useVerifiedDomainFormController(model, onSuccess, 'edit'), {
      wrapper,
    });
    const submit = result.current.updateEnrollmentMode;
    let pending!: Promise<void>;
    act(() => {
      pending = submit();
    });
    await waitFor(() => expect(model.updateEnrollmentMode).toHaveBeenCalledOnce());
    unmount();
    if (outcome === 'success') {
      completion.resolve(true);
    } else {
      completion.reject(new Error('Late failure'));
    }
    await expect(pending).resolves.toBeUndefined();
    await submit();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(model.updateEnrollmentMode).toHaveBeenCalledOnce();
  });

  it('does not report success for a stale model result or submit while data is loading', async () => {
    const { model, onSuccess, wrapper } = await setup();
    model.updateEnrollmentMode = vi.fn().mockResolvedValue(false);
    const { result, rerender } = renderHook(() => useVerifiedDomainFormController(model, onSuccess, 'edit'), {
      wrapper,
    });
    await act(() => result.current.updateEnrollmentMode());
    expect(onSuccess).not.toHaveBeenCalled();
    model.isLoading = true;
    rerender();
    await result.current.updateEnrollmentMode();
    expect(model.updateEnrollmentMode).toHaveBeenCalledOnce();
  });

  it('renders distinct invitation and suggestion totals and submits selected values', async () => {
    const { model, onSuccess, wrapper } = await setup();
    const View = () => (
      <VerifiedDomainFormView
        controller={useVerifiedDomainFormController(model, onSuccess, 'edit')}
        onReset={vi.fn()}
      />
    );
    const { getByText, getByRole, userEvent } = render(<View />, { wrapper });
    expect(getByText('Pending invitations sent to users: 2')).toBeInTheDocument();
    expect(getByText('Pending suggestions sent to users: 7')).toBeInTheDocument();
    await userEvent.click(getByRole('checkbox'));
    await userEvent.click(getByRole('button', { name: 'Save' }));
    expect(model.updateEnrollmentMode).toHaveBeenCalledExactlyOnceWith('manual_invitation', true, expect.any(Function));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it.each([false, true])('cancels queued submissions when the form closes (Strict Mode: %s)', async strict => {
    const { model, onSuccess, wrapper: Wrapper } = await setup();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Wrapper>{strict ? <StrictMode>{children}</StrictMode> : children}</Wrapper>
    );
    const { result, unmount } = renderHook(() => useVerifiedDomainFormController(model, onSuccess, 'edit'), {
      wrapper,
    });
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.updateEnrollmentMode();
      unmount();
    });
    await pending;
    expect(model.updateEnrollmentMode).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it.each(['success', 'failure'])('ignores a late %s when the model loses its source', async outcome => {
    const { model, onSuccess, wrapper } = await setup();
    const completion = createDeferredPromise<boolean>();
    model.updateEnrollmentMode = vi.fn().mockReturnValue(completion.promise);
    const { result } = renderHook(
      () => ({ controller: useVerifiedDomainFormController(model, onSuccess, 'edit'), card: useCardState() }),
      { wrapper },
    );
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.controller.updateEnrollmentMode();
    });
    await waitFor(() => expect(model.updateEnrollmentMode).toHaveBeenCalledOnce());
    model.canRun = () => false;
    if (outcome === 'success') {
      completion.resolve(true);
    } else {
      completion.reject(new Error('Stale failure'));
    }
    await expect(pending).resolves.toBeUndefined();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.card.error).toBeUndefined();
  });

  it('does not release a new source request when an old request settles', async () => {
    const { model, onSuccess, wrapper } = await setup();
    const first = createDeferredPromise<boolean>();
    const second = createDeferredPromise<boolean>();
    model.updateEnrollmentMode = vi.fn().mockReturnValue(first.promise);
    const { result, rerender } = renderHook(
      ({ source }) => useVerifiedDomainFormController(source, onSuccess, 'edit'),
      { wrapper, initialProps: { source: model } },
    );
    let firstRequest!: Promise<void>;
    act(() => {
      firstRequest = result.current.updateEnrollmentMode();
    });
    await waitFor(() => expect(model.updateEnrollmentMode).toHaveBeenCalledOnce());
    const replacement = {
      ...model,
      scope: 'next-source',
      updateEnrollmentMode: vi.fn().mockReturnValue(second.promise),
    };
    rerender({ source: replacement });
    let secondRequest!: Promise<void>;
    act(() => {
      secondRequest = result.current.updateEnrollmentMode();
    });
    await waitFor(() => expect(replacement.updateEnrollmentMode).toHaveBeenCalledOnce());
    await act(async () => {
      first.resolve(true);
      await firstRequest;
    });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.updateEnrollmentMode()).toBe(secondRequest);
    await act(async () => {
      second.resolve(true);
      await secondRequest;
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
