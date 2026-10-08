import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook } from '@/test/utils';

import { useProfileFormModel } from '../profile-form.model';
import { ProfileForm } from '../ProfileForm';

const { createFixtures } = bindCreateFixtures('UserProfile');
async function setup() {
  const result = await createFixtures(f => {
    f.withName();
    f.withUser({
      email_addresses: ['first@clerk.com'],
      first_name: 'First',
      last_name: 'User',
      image_url: 'https://example.com/avatar.png',
    });
  });
  return result;
}
const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });

describe('user profile form ownership', () => {
  it.each(['user', 'session', 'client'] as const)('rejects captured profile commands after %s changes', async key => {
    const { wrapper, fixtures } = await setup();
    const callbacks = { onSuccess: vi.fn(), onReset: vi.fn() };
    const { result } = renderHook(() => useProfileFormModel(callbacks), { wrapper });
    const model = result.current;
    if (model.status !== 'ready') {
      throw new Error('Expected ready profile');
    }
    const user = fixtures.clerk.user!;
    vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue({ ...fixtures.clerk[key], id: 'replacement' } as any);
    await model.updateName('Changed', 'Name');
    await model.setProfileImage(null);
    await model.complete();
    model.onReset();
    expect(user.update).not.toHaveBeenCalled();
    expect(user.setProfileImage).not.toHaveBeenCalled();
    expect(callbacks.onSuccess).not.toHaveBeenCalled();
    expect(callbacks.onReset).not.toHaveBeenCalled();
  });

  it.each(['name', 'image'] as const)('does not complete a late %s update after source closure', async kind => {
    const { wrapper, fixtures } = await setup();
    const callbacks = { onSuccess: vi.fn(), onReset: vi.fn() };
    const deferred = createDeferredPromise<any>();
    const method = kind === 'name' ? fixtures.clerk.user!.update : fixtures.clerk.user!.setProfileImage;
    method.mockReturnValue(deferred.promise);
    const { result, unmount } = renderHook(() => useProfileFormModel(callbacks), { wrapper });
    const model = result.current;
    if (model.status !== 'ready') {
      throw new Error('Expected ready profile');
    }
    const request = kind === 'name' ? model.updateName('Changed', 'Name') : model.setProfileImage(null);
    unmount();
    deferred.resolve({ id: 'old-user' });
    await request;
    expect(callbacks.onSuccess).not.toHaveBeenCalled();
  });

  it('starts one name update for two submissions before rendering', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<any>();
    fixtures.clerk.user!.update.mockReturnValue(deferred.promise);
    const callbacks = { onSuccess: vi.fn(), onReset: vi.fn() };
    const { getByLabelText, userEvent } = render(<ProfileForm {...callbacks} />, { wrapper });
    const firstName = getByLabelText(/first name/i);
    await userEvent.clear(firstName);
    await userEvent.type(firstName, 'Changed');
    const form = firstName.closest('form')!;
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    expect(fixtures.clerk.user!.update).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve(fixtures.clerk.user);
      await deferred.promise;
    });
    expect(callbacks.onSuccess).toHaveBeenCalledOnce();
  });

  it.each(['success', 'failure'] as const)(
    'resets fields and errors after an account change during an old %s',
    async outcome => {
      const { wrapper, fixtures } = await setup();
      const callbacks = { onSuccess: vi.fn(), onReset: vi.fn() };
      const deferred = createDeferredPromise<any>();
      fixtures.clerk.user!.update.mockReturnValue(deferred.promise);
      const { getByLabelText, queryByText, rerender, userEvent } = render(<ProfileForm {...callbacks} />, { wrapper });
      const firstName = getByLabelText(/first name/i);
      await userEvent.clear(firstName);
      await userEvent.type(firstName, 'Changed');
      fireEvent.submit(firstName.closest('form')!);
      const replacement = { ...fixtures.clerk.user!, id: 'replacement', firstName: 'Second' };
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(replacement);
      fixtures.clerk.__internal_lastEmittedResources = {
        ...fixtures.clerk.__internal_lastEmittedResources,
        user: replacement,
      };
      rerender(<ProfileForm {...callbacks} />);
      expect(getByLabelText(/first name/i)).toHaveValue('Second');
      await act(async () => {
        if (outcome === 'success') {
          deferred.resolve(replacement);
        } else {
          deferred.reject(failure());
        }
        await deferred.promise.catch(() => {});
      });
      expect(getByLabelText(/first name/i)).toHaveValue('Second');
      expect(queryByText('Please try again')).not.toBeInTheDocument();
      expect(callbacks.onSuccess).not.toHaveBeenCalled();
    },
  );

  it('discards SDK results and completes a current update', async () => {
    const { wrapper, fixtures } = await setup();
    const callbacks = { onSuccess: vi.fn(), onReset: vi.fn() };
    fixtures.clerk.user!.update.mockResolvedValue(fixtures.clerk.user);
    const { result } = renderHook(() => useProfileFormModel(callbacks), { wrapper });
    const model = result.current;
    if (model.status !== 'ready') {
      throw new Error('Expected ready profile');
    }
    await expect(model.updateName('Changed', 'Name')).resolves.toBeUndefined();
    expect(callbacks.onSuccess).toHaveBeenCalledOnce();
  });
});
