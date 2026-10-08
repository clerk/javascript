import { ClerkWebAuthnError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@/test/utils';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useAddPasskeyModel, usePasskeyModel, usePasskeySectionModel } from '../passkey-section.model';
import { PasskeySection } from '../PasskeySection';
import { RemovePasskeyForm } from '../RemoveResourceForm';
import { UpdatePasskeyForm } from '../UpdatePasskeyForm';

const { createFixtures } = bindCreateFixtures('UserProfile');
const CardBoundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
async function setup() {
  return createFixtures(f => {
    f.withPasskey();
    f.withUser({
      passkeys: ['first', 'second'].map(id => ({
        object: 'passkey',
        id,
        name: id,
        created_at: Date.now(),
        updated_at: Date.now(),
        last_used_at: null,
        verification: null,
      })),
    });
  });
}

describe('Profile passkey boundaries and ownership', () => {
  it('returns plain passkey rows without SDK methods', async () => {
    const { wrapper } = await setup();
    const { result } = renderHook(() => usePasskeySectionModel(), { wrapper });
    expect(result.current.passkeys.map(row => row.id)).toEqual(['first', 'second']);
    expect(Object.keys(result.current.passkeys[0]).sort()).toEqual(['createdAt', 'id', 'lastUsedAt', 'name']);
  });

  it.each(['user', 'session', 'client'] as const)(
    'rejects retained commands after the canonical %s changes',
    async field => {
      const { wrapper, fixtures } = await setup();
      const first = fixtures.clerk.user!.passkeys[0];
      const create = vi.spyOn(fixtures.clerk.user!, 'createPasskey');
      const update = vi.spyOn(first, 'update');
      const remove = vi.spyOn(first, 'delete');
      const { result } = renderHook(() => ({ add: useAddPasskeyModel(), item: usePasskeyModel('first') }), { wrapper });
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
      await act(async () => {
        expect(await result.current.add.createPasskey()).toBe(false);
        expect(await result.current.item.updateName('renamed')).toBe(false);
        expect(await result.current.item.deleteResource()).toBe(false);
      });
      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
    },
  );

  it('does not mutate a passkey that was removed before rendering', async () => {
    const { wrapper, fixtures } = await setup();
    const passkey = fixtures.clerk.user!.passkeys[0];
    const update = vi.spyOn(passkey, 'update');
    const remove = vi.spyOn(passkey, 'delete');
    const { result } = renderHook(() => usePasskeyModel('first'), { wrapper });
    fixtures.clerk.user!.passkeys.splice(0, 1);
    await expect(result.current.updateName('renamed')).resolves.toBe(false);
    await expect(result.current.deleteResource()).resolves.toBe(false);
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('does not mutate a legacy resource when mounted without a user', async () => {
    const { wrapper, fixtures } = await setup();
    const passkey = fixtures.clerk.user!.passkeys[0];
    const update = vi.spyOn(passkey, 'update');
    const remove = vi.spyOn(passkey, 'delete');
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(null);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      user: null,
    };
    const { result } = renderHook(() => usePasskeyModel(passkey), { wrapper });
    await expect(result.current.updateName('renamed')).resolves.toBe(false);
    await expect(result.current.deleteResource()).resolves.toBe(false);
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('does not reuse a legacy resource prop for another account', async () => {
    const { wrapper, fixtures } = await setup();
    const passkey = fixtures.clerk.user!.passkeys[0];
    const update = vi.spyOn(passkey, 'update');
    const remove = vi.spyOn(passkey, 'delete');
    const { result, rerender } = renderHook(() => usePasskeyModel(passkey), { wrapper });
    const replacement = { ...fixtures.clerk.user!, id: 'replacement', passkeys: [] };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(replacement);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      user: replacement,
    };
    rerender();
    expect(result.current.name).toBe('');
    await expect(result.current.updateName('renamed')).resolves.toBe(false);
    await expect(result.current.deleteResource()).resolves.toBe(false);
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('starts registration once for two clicks in the same event batch', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<any>();
    fixtures.clerk.user!.createPasskey.mockReturnValueOnce(deferred.promise);
    render(
      <CardBoundary>
        <PasskeySection />
      </CardBoundary>,
      { wrapper },
    );
    const button = screen.getByRole('button', { name: 'Add a passkey' });
    act(() => {
      fireEvent.click(button);
      fireEvent.click(button);
    });
    expect(fixtures.clerk.user!.createPasskey).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve({});
      await deferred.promise;
    });
    expect(button).not.toBeDisabled();
  });

  it('does not replace a current error after registration unmounts', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<any>();
    fixtures.clerk.user!.createPasskey.mockReturnValueOnce(deferred.promise);
    let card!: ReturnType<typeof useCardState>;
    const Boundary = withCardStateProvider(({ visible }: { visible: boolean }) => {
      card = useCardState();
      return visible ? <PasskeySection /> : null;
    });
    const view = render(<Boundary visible />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Add a passkey' }));
    view.rerender(<Boundary visible={false} />);
    act(() => {
      card.setError('New error');
    });
    await act(async () => {
      deferred.reject(new ClerkWebAuthnError('Cancelled', { code: 'passkey_registration_cancelled' }));
      await deferred.promise.catch(() => undefined);
    });
    expect(card.error).toBe('New error');
  });

  it.each(['id', 'resource'] as const)(
    'supports the rename form with a passkey %s and reports no SDK resource',
    async target => {
      const { wrapper, fixtures } = await setup();
      const passkey = fixtures.clerk.user!.passkeys[0];
      vi.spyOn(passkey, 'update').mockResolvedValueOnce(passkey);
      const onSuccess = vi.fn();
      render(
        <UpdatePasskeyForm
          {...(target === 'id' ? { passkeyId: 'first' } : { passkey })}
          onSuccess={onSuccess}
          onReset={vi.fn()}
        />,
        { wrapper },
      );
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'renamed' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => expect(onSuccess).toHaveBeenCalledExactlyOnceWith());
      expect(passkey.update).toHaveBeenCalledWith({ name: 'renamed' });
    },
  );

  it.each(['id', 'resource'] as const)('supports the removal form with a passkey %s', async target => {
    const { wrapper, fixtures } = await setup();
    const passkey = fixtures.clerk.user!.passkeys[0];
    const remove = vi.spyOn(passkey, 'delete').mockResolvedValueOnce(undefined);
    const onSuccess = vi.fn();
    render(
      <RemovePasskeyForm
        {...(target === 'id' ? { passkeyId: 'first' } : { passkey })}
        onSuccess={onSuccess}
        onReset={vi.fn()}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledExactlyOnceWith());
    expect(remove).toHaveBeenCalledOnce();
  });

  it('keeps a new rename request pending when an old target finishes', async () => {
    const { wrapper, fixtures } = await setup();
    const first = fixtures.clerk.user!.passkeys[0];
    const second = fixtures.clerk.user!.passkeys[1];
    const old = createDeferredPromise<any>();
    const current = createDeferredPromise<any>();
    vi.spyOn(first, 'update').mockReturnValueOnce(old.promise);
    vi.spyOn(second, 'update').mockReturnValueOnce(current.promise);
    const onSuccess = vi.fn();
    const onReset = vi.fn();
    const view = render(
      <UpdatePasskeyForm
        passkeyId='first'
        onSuccess={onSuccess}
        onReset={onReset}
      />,
      { wrapper },
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'first renamed' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    view.rerender(
      <UpdatePasskeyForm
        passkeyId='second'
        onSuccess={onSuccess}
        onReset={onReset}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('second');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'second renamed' } });
    const save = screen.getByRole('button', { name: /save/i });
    fireEvent.click(save);
    await act(async () => {
      old.resolve(first);
      await old.promise;
    });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(save).toBeDisabled();
    expect(second.update).toHaveBeenCalledOnce();
    await act(async () => {
      current.resolve(second);
      await current.promise;
    });
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith();
  });
});
