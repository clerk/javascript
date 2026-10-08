import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useAddDomainFormController } from '../add-domain-form.controller';
import type { AddDomainFormModel, CreatedDomainData } from '../add-domain-form.types';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
async function setup() {
  const { wrapper: Fixture } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const model: AddDomainFormModel = {
    scope: 'scope',
    available: true,
    createDomain: vi.fn().mockResolvedValue({ id: 'domain_1', isVerified: false }),
    refreshDomains: vi.fn().mockResolvedValue(true),
  };
  const onSuccess = vi.fn();
  const hook = renderHook(() => ({ controller: useAddDomainFormController(model, onSuccess), card: useCardState() }), {
    wrapper,
  });
  return { ...hook, model, onSuccess };
}

describe('Add domain action ownership', () => {
  it('deduplicates creation and advances with a plain domain result', async () => {
    const { result, model } = await setup();
    const completion = createDeferredPromise<CreatedDomainData>();
    model.createDomain = vi.fn().mockReturnValue(completion.promise);
    act(() => result.current.controller.nameField.setValue('clerk.com'));
    const submit = result.current.controller.onSubmit;
    let pending!: Promise<void>;
    act(() => {
      pending = submit();
      expect(submit()).toBe(pending);
    });
    expect(model.createDomain).toHaveBeenCalledExactlyOnceWith('clerk.com');
    expect(result.current.controller.canSubmit).toBe(false);
    expect(result.current.card.isLoading).toBe(false);
    await act(async () => {
      completion.resolve({ id: 'domain_1', isVerified: true });
      await pending;
    });
    expect(result.current.controller).toMatchObject({
      domainId: 'domain_1',
      verified: true,
      wizardProps: { step: 1 },
      isPending: false,
    });
    await result.current.controller.onSubmit();
    expect(model.createDomain).toHaveBeenCalledOnce();
  });

  it('clears creation errors on retry and unlocks after a synchronous failure', async () => {
    const { result, model } = await setup();
    model.createDomain = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Create failed', {
          status: 422,
          data: [{ code: 'domain_create_failed', message: 'Create failed' }],
        }),
      )
      .mockImplementationOnce(() => {
        throw new Error('Unexpected failure');
      })
      .mockResolvedValue({ id: 'domain_1', isVerified: false });
    act(() => result.current.controller.nameField.setValue('clerk.com'));
    await act(() => result.current.controller.onSubmit());
    expect(result.current.card.error).toBe('Create failed');
    await act(async () => {
      await expect(result.current.controller.onSubmit()).rejects.toThrow('Unexpected failure');
    });
    expect(result.current.card.error).toBeUndefined();
    expect(result.current.controller.isPending).toBe(false);
    await act(() => result.current.controller.onSubmit());
    expect(result.current.controller.wizardProps.step).toBe(1);
  });

  it('deduplicates final refresh and reports completion exactly once', async () => {
    const { result, model, onSuccess } = await setup();
    act(() => result.current.controller.nameField.setValue('clerk.com'));
    await act(() => result.current.controller.onSubmit());
    const completion = createDeferredPromise<boolean>();
    model.refreshDomains = vi.fn().mockReturnValue(completion.promise);
    const finish = result.current.controller.onVerifySuccess;
    let pending!: Promise<void>;
    act(() => {
      pending = finish();
      expect(finish()).toBe(pending);
    });
    expect(model.refreshDomains).toHaveBeenCalledOnce();
    await act(async () => {
      completion.resolve(true);
      await pending;
    });
    expect(onSuccess).toHaveBeenCalledOnce();
    await finish();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(model.refreshDomains).toHaveBeenCalledOnce();
  });

  it('withholds completion for a stale refresh and permits refresh retry without another creation', async () => {
    const { result, model, onSuccess } = await setup();
    act(() => result.current.controller.nameField.setValue('clerk.com'));
    await act(() => result.current.controller.onSubmit());
    model.refreshDomains = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Refresh failed', {
          status: 422,
          data: [{ code: 'refresh_failed', message: 'Refresh failed' }],
        }),
      )
      .mockResolvedValue(true);
    await act(() => result.current.controller.onVerifySuccess());
    expect(onSuccess).not.toHaveBeenCalled();
    await act(() => result.current.controller.onVerifySuccess());
    expect(result.current.card.error).toBe('Refresh failed');
    await result.current.controller.onSubmit();
    expect(model.createDomain).toHaveBeenCalledOnce();
    await act(() => result.current.controller.onVerifySuccess());
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(result.current.card.error).toBeUndefined();
  });

  it.each([
    ['creation', 'success'],
    ['creation', 'failure'],
    ['completion', 'success'],
    ['completion', 'failure'],
  ])('ignores late %s %s and retained callbacks after unmount', async (phase, outcome) => {
    const { result, model, onSuccess, unmount } = await setup();
    act(() => result.current.controller.nameField.setValue('clerk.com'));
    const completion = createDeferredPromise();
    if (phase === 'completion') {
      await act(() => result.current.controller.onSubmit());
      model.refreshDomains = vi.fn().mockReturnValue(completion.promise);
    } else {
      model.createDomain = vi.fn().mockReturnValue(completion.promise);
    }
    const retained = result.current.controller;
    let pending!: Promise<void>;
    act(() => {
      pending = phase === 'completion' ? retained.onVerifySuccess() : retained.onSubmit();
    });
    unmount();
    if (outcome === 'success') {
      completion.resolve(phase === 'creation' ? { id: 'domain_1', isVerified: true } : true);
    } else {
      completion.reject(new Error('Late failure'));
    }
    await expect(pending).resolves.toBeUndefined();
    await retained.onSubmit();
    await retained.onVerifySuccess();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(model.createDomain).toHaveBeenCalledOnce();
    expect(model.refreshDomains).toHaveBeenCalledTimes(phase === 'completion' ? 1 : 0);
  });

  it('withholds empty submissions, stale creation and completion before a domain exists', async () => {
    const { result, model, onSuccess } = await setup();
    await result.current.controller.onSubmit();
    await result.current.controller.onVerifySuccess();
    expect(model.createDomain).not.toHaveBeenCalled();
    expect(model.refreshDomains).not.toHaveBeenCalled();
    model.createDomain = vi.fn().mockResolvedValue(undefined);
    act(() => result.current.controller.nameField.setValue('clerk.com'));
    await act(() => result.current.controller.onSubmit());
    expect(result.current.controller.domainId).toBe('');
    expect(result.current.controller.wizardProps.step).toBe(0);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
