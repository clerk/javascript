import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SaveError } from '../../../utils/form-error';
import { useUserProfileEditNameController } from '../user-profile-account-section/user-profile-edit-name.controller';
import type { UserProfileEditNameValue } from '../user-profile-account-section/user-profile-edit-name.dialog';

function deferred() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

function renderController(onSubmit: (value: UserProfileEditNameValue) => Promise<void> = () => Promise.resolve()) {
  const { result } = renderHook(() =>
    useUserProfileEditNameController({ firstName: 'Preston', lastName: 'Booth', onSubmit }),
  );
  act(() => result.current.onOpenChange(true));
  return result;
}

describe('useUserProfileEditNameController', () => {
  it('opens on the saved name', () => {
    const { result } = renderHook(() =>
      useUserProfileEditNameController({ firstName: 'Preston', lastName: 'Booth', onSubmit: vi.fn() }),
    );
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.onOpenChange(true));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.form.values).toEqual({ firstName: 'Preston', lastName: 'Booth' });
  });

  it('withholds the save while the name is unchanged', () => {
    const result = renderController();
    expect(result.current.form.canSubmit).toBe(false);

    act(() => result.current.form.setValue('lastName', 'Barton'));

    expect(result.current.form.canSubmit).toBe(true);
  });

  it('saves the values it is holding, stays open while saving, then closes', async () => {
    const request = deferred();
    const onSubmit = vi.fn(() => request.promise);
    const result = renderController(onSubmit);
    act(() => result.current.form.setValue('firstName', 'Ada'));

    act(() => result.current.form.submit());
    act(() => result.current.onOpenChange(false));

    expect(onSubmit).toHaveBeenCalledWith({ firstName: 'Ada', lastName: 'Booth' });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.form.isSubmitting).toBe(true);
    await act(async () => request.resolve());
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('keeps what was typed and shows why when the save fails', async () => {
    const result = renderController(() =>
      Promise.reject(
        new SaveError({
          global: { message: 'Your name could not be updated.' },
          fields: { lastName: { message: 'Last name is too long.' } },
        }),
      ),
    );
    act(() => result.current.form.setValue('lastName', 'Barton'));

    act(() => result.current.form.submit());

    await waitFor(() => expect(result.current.form.error).toBe('Your name could not be updated.'));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.form.values.lastName).toBe('Barton');
    expect(result.current.form.fields.lastName.feedback).toEqual({ type: 'error', message: 'Last name is too long.' });
  });

  it('re-seeds from the saved name and drops the error on the next open', async () => {
    const result = renderController(() => Promise.reject(new SaveError({ global: { message: 'nope' } })));
    act(() => result.current.form.setValue('firstName', 'Ada'));
    act(() => result.current.form.submit());
    await waitFor(() => expect(result.current.form.error).toBe('nope'));

    act(() => result.current.onOpenChange(false));
    act(() => result.current.onOpenChange(true));

    expect(result.current.form.values.firstName).toBe('Preston');
    expect(result.current.form.error).toBeUndefined();
  });
});
