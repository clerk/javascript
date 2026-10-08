import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { localizationKeys } from '@/customizables';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useRemoveResourceController } from '../remove-resource.controller';
import { useRemoveResourceModel } from '../remove-resource.model';
import type { RemoveFormData, RemoveFormProps } from '../remove-resource.types';
import { RemoveResourceForm } from '../RemoveResourceForm';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

async function setup(
  deleteResource = vi.fn().mockResolvedValue(undefined),
  options: Pick<RemoveFormProps, 'scopeKey' | 'canRun'> = {},
) {
  const { wrapper: Fixture, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const props: RemoveFormData = {
    title: localizationKeys('organizationProfile.removeDomainPage.title'),
    messageLine1: localizationKeys('organizationProfile.removeDomainPage.messageLine1', { domain: 'clerk.com' }),
    onSuccess: vi.fn(),
    onReset: vi.fn(),
  };
  const hook = renderHook(
    () => {
      const model = useRemoveResourceModel(deleteResource, options);
      return { model, controller: useRemoveResourceController(model, props), card: useCardState() };
    },
    { wrapper },
  );
  return { ...hook, deleteResource, props, fixtures, wrapper, Fixture };
}

describe('Removal form ownership', () => {
  it.each([false, true])('keeps reverification private and blocks a retry after unmount=%s', async closeForm => {
    const effect = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Reverification required', {
          status: 401,
          data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
        }),
      )
      .mockResolvedValue({ delete: vi.fn() });
    const { result, fixtures, props, rerender, unmount } = await setup(effect);
    const open = vi.spyOn(fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
    rerender();
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.controller.handleSubmit();
    });
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    expect(props.onSuccess).not.toHaveBeenCalled();
    const verification = open.mock.calls[0][0];
    if (closeForm) {
      unmount();
      verification.afterVerification!();
      await expect(pending).resolves.toBeUndefined();
      expect(effect).toHaveBeenCalledOnce();
      expect(props.onSuccess).not.toHaveBeenCalled();
    } else {
      await act(async () => {
        verification.afterVerification!();
        await pending;
      });
      expect(effect).toHaveBeenCalledTimes(2);
      expect(props.onSuccess).toHaveBeenCalledOnce();
    }
  });

  it('deduplicates submissions, discards SDK results, and reports completion once', async () => {
    const completion = createDeferredPromise();
    const { result, deleteResource, props } = await setup(vi.fn().mockReturnValue(completion.promise));
    const submit = result.current.controller.handleSubmit;
    let pending!: Promise<void>;
    act(() => {
      pending = submit();
      expect(submit()).toBe(pending);
    });
    await waitFor(() => expect(deleteResource).toHaveBeenCalledOnce());
    await act(async () => {
      completion.resolve({ delete: vi.fn() });
      await pending;
    });
    expect(props.onSuccess).toHaveBeenCalledExactlyOnceWith();
    expect(result.current.card.isLoading).toBe(false);
  });

  it('keeps legacy void completion and withholds completion for an explicit no-op result', async () => {
    const { result, deleteResource, props } = await setup();
    await expect(result.current.model.deleteResource()).resolves.toBe(true);
    deleteResource.mockResolvedValue(false);
    await act(() => result.current.controller.handleSubmit());
    expect(props.onSuccess).not.toHaveBeenCalled();
  });

  it('clears errors on retry and releases ownership after a synchronous failure', async () => {
    const effect = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Removal failed', {
          status: 422,
          data: [{ code: 'removal_failed', message: 'Removal failed' }],
        }),
      )
      .mockImplementationOnce(() => {
        throw new Error('Unexpected failure');
      })
      .mockResolvedValue(undefined);
    const { result, props } = await setup(effect);
    await act(() => result.current.controller.handleSubmit());
    expect(result.current.card.error).toBe('Removal failed');
    await act(async () => {
      await expect(result.current.controller.handleSubmit()).rejects.toThrow('Unexpected failure');
    });
    expect(result.current.card.error).toBeUndefined();
    await act(() => result.current.controller.handleSubmit());
    expect(props.onSuccess).toHaveBeenCalledOnce();
  });

  it.each(['success', 'failure'])('ignores late %s and retained commands after unmount', async outcome => {
    const completion = createDeferredPromise();
    const { result, deleteResource, props, unmount } = await setup(vi.fn().mockReturnValue(completion.promise));
    const retained = result.current;
    let pending!: Promise<void>;
    act(() => {
      pending = retained.controller.handleSubmit();
    });
    await waitFor(() => expect(deleteResource).toHaveBeenCalledOnce());
    unmount();
    if (outcome === 'success') {
      completion.resolve(undefined);
    } else {
      completion.reject(new Error('Late failure'));
    }
    await expect(pending).resolves.toBeUndefined();
    await retained.controller.handleSubmit();
    await expect(retained.model.deleteResource()).resolves.toBe(false);
    expect(deleteResource).toHaveBeenCalledOnce();
    expect(props.onSuccess).not.toHaveBeenCalled();
  });

  it.each(['user', 'session', 'client'] as const)('blocks a reverification retry after the %s changes', async key => {
    const effect = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Reverification required', {
          status: 401,
          data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
        }),
      )
      .mockResolvedValue(undefined);
    const { result, fixtures, props, rerender } = await setup(effect);
    const open = vi.spyOn(fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
    rerender();
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.controller.handleSubmit();
    });
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue({ ...fixtures.clerk[key]!, id: 'changed' });
    await act(async () => {
      open.mock.calls[0][0].afterVerification!();
      await pending;
    });
    expect(effect).toHaveBeenCalledOnce();
    expect(props.onSuccess).not.toHaveBeenCalled();
  });

  it.each(['session', 'client'] as const)('ignores a late failure after the %s changes', async key => {
    const completion = createDeferredPromise();
    const { result, fixtures, deleteResource, props } = await setup(vi.fn().mockReturnValue(completion.promise));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.controller.handleSubmit();
    });
    await waitFor(() => expect(deleteResource).toHaveBeenCalledOnce());
    vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue({ ...fixtures.clerk[key]!, id: 'changed' });
    completion.reject(new Error('Old removal failed'));
    await expect(pending).resolves.toBeUndefined();
    expect(result.current.card.error).toBeUndefined();
    expect(props.onSuccess).not.toHaveBeenCalled();
  });

  it('blocks a retry when only the controller closes', async () => {
    const effect = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Reverification required', {
          status: 401,
          data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
        }),
      )
      .mockResolvedValue(undefined);
    const { fixtures, props, wrapper } = await setup();
    const open = vi.spyOn(fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
    const model = renderHook(() => useRemoveResourceModel(effect), { wrapper });
    const controller = renderHook(() => useRemoveResourceController(model.result.current, props), { wrapper });
    let pending!: Promise<void>;
    act(() => {
      pending = controller.result.current.handleSubmit();
    });
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    controller.unmount();
    expect(model.result.current.canRun()).toBe(true);
    open.mock.calls[0][0].afterVerification!();
    await expect(pending).resolves.toBeUndefined();
    expect(effect).toHaveBeenCalledOnce();
    expect(props.onSuccess).not.toHaveBeenCalled();
  });

  it.each([false, true])('cancels queued removal after unmount (Strict Mode: %s)', async strict => {
    const { props, wrapper: Wrapper } = await setup();
    const effect = vi.fn().mockResolvedValue(undefined);
    const wrapper = ({ children }: PropsWithChildren) => (
      <Wrapper>{strict ? <StrictMode>{children}</StrictMode> : children}</Wrapper>
    );
    const hook = renderHook(
      () => {
        const model = useRemoveResourceModel(effect);
        return useRemoveResourceController(model, props);
      },
      { wrapper },
    );
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.handleSubmit();
      hook.unmount();
    });
    await pending;
    expect(effect).not.toHaveBeenCalled();
  });

  it('does not release a replacement target request after an old request settles', async () => {
    const first = createDeferredPromise();
    const second = createDeferredPromise();
    const effect = vi.fn().mockReturnValueOnce(first.promise).mockReturnValue(second.promise);
    const options = { scopeKey: 'first' };
    const { result, props, rerender } = await setup(effect, options);
    let oldRequest!: Promise<void>;
    act(() => {
      oldRequest = result.current.controller.handleSubmit();
    });
    await waitFor(() => expect(effect).toHaveBeenCalledOnce());
    options.scopeKey = 'second';
    rerender();
    let newRequest!: Promise<void>;
    act(() => {
      newRequest = result.current.controller.handleSubmit();
    });
    await waitFor(() => expect(effect).toHaveBeenCalledTimes(2));
    await act(async () => {
      first.resolve(undefined);
      await oldRequest;
    });
    expect(props.onSuccess).not.toHaveBeenCalled();
    expect(result.current.controller.handleSubmit()).toBe(newRequest);
    await act(async () => {
      second.resolve(undefined);
      await newRequest;
    });
    expect(props.onSuccess).toHaveBeenCalledOnce();
  });

  it('invalidates retained commands when a target changes and returns', async () => {
    const options = { scopeKey: 'first' };
    const { result, deleteResource, rerender } = await setup(undefined, options);
    const retained = result.current.model;
    options.scopeKey = 'second';
    rerender();
    options.scopeKey = 'first';
    rerender();
    await expect(retained.deleteResource()).resolves.toBe(false);
    expect(deleteResource).not.toHaveBeenCalled();
  });

  it('lets Form.Root own removal loading and permits retry after failure', async () => {
    const completion = createDeferredPromise();
    const effect = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Removal failed', {
          status: 422,
          data: [{ code: 'removal_failed', message: 'Removal failed' }],
        }),
      )
      .mockReturnValue(completion.promise);
    const { props, Fixture } = await setup();
    const { getByRole, findByText, userEvent } = render(
      <RemoveResourceForm
        {...props}
        deleteResource={effect}
      />,
      { wrapper: Fixture },
    );
    await userEvent.click(getByRole('button', { name: 'Remove' }));
    expect(await findByText('Removal failed')).toBeInTheDocument();
    const remove = getByRole('button', { name: 'Remove' });
    const cancel = getByRole('button', { name: 'Cancel' });
    expect(remove).toBeEnabled();
    expect(cancel).toBeEnabled();
    await userEvent.click(remove);
    expect(remove).toBeDisabled();
    expect(cancel).toBeDisabled();
    fireEvent.click(cancel);
    expect(props.onReset).not.toHaveBeenCalled();
    await act(async () => {
      completion.resolve(undefined);
      await completion.promise;
    });
    await waitFor(() => expect(remove).toBeEnabled());
    expect(props.onSuccess).toHaveBeenCalledOnce();
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('keeps a new session form busy when an old reverification request completes', async () => {
    const second = createDeferredPromise();
    const effect = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Reverification required', {
          status: 401,
          data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
        }),
      )
      .mockReturnValue(second.promise);
    const { fixtures, props, Fixture } = await setup();
    const open = vi.spyOn(fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
    const view = render(
      <RemoveResourceForm
        {...props}
        deleteResource={effect}
      />,
      { wrapper: Fixture },
    );
    await view.userEvent.click(view.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    const session = { ...fixtures.clerk.session!, id: 'session_second' };
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, session };
    view.rerender(
      <RemoveResourceForm
        {...props}
        deleteResource={effect}
      />,
    );
    const remove = await waitFor(() => view.getByRole('button', { name: 'Remove' }));
    expect(remove).toBeEnabled();
    await view.userEvent.click(remove);
    await waitFor(() => expect(effect).toHaveBeenCalledTimes(2));
    await act(async () => {
      open.mock.calls[0][0].afterVerification!();
      await Promise.resolve();
    });
    expect(remove).toBeDisabled();
    expect(props.onSuccess).not.toHaveBeenCalled();
    await act(async () => {
      second.resolve(undefined);
      await second.promise;
    });
    await waitFor(() => expect(remove).toBeEnabled());
    expect(effect).toHaveBeenCalledTimes(2);
    expect(props.onSuccess).toHaveBeenCalledOnce();
  });

  it.each(['session', 'unmount', 'caller'] as const)(
    'does not open reverification for a late error after losing the %s',
    async loss => {
      const completion = createDeferredPromise();
      const effect = vi.fn().mockReturnValue(completion.promise);
      const { result, fixtures, rerender, unmount } = await setup(effect);
      const open = vi.spyOn(fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
      rerender();
      let active = true;
      const pending = result.current.model.deleteResource(() => active);
      expect(effect).toHaveBeenCalledOnce();
      if (loss === 'session') {
        vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'changed' });
      } else if (loss === 'unmount') {
        unmount();
      } else {
        active = false;
      }
      completion.reject(
        new ClerkAPIResponseError('Reverification required', {
          status: 401,
          data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
        }),
      );
      await expect(pending).resolves.toBe(false);
      expect(open).not.toHaveBeenCalled();
    },
  );
});
