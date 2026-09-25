import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SaveError } from '../../../utils/form-error';
import { useUserProfileEditUsernameController } from '../user-profile-account-section/user-profile-edit-username.controller';

function deferred() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

function renderController(onSubmit: (username: string) => Promise<void> = () => Promise.resolve()) {
  const { result } = renderHook(() => useUserProfileEditUsernameController({ username: 'prestonxyz', onSubmit }));
  act(() => result.current.onOpenChange(true));
  return result;
}

describe('useUserProfileEditUsernameController', () => {
  it('opens on the saved username', () => {
    const { result } = renderHook(() =>
      useUserProfileEditUsernameController({ username: 'prestonxyz', onSubmit: vi.fn() }),
    );
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.onOpenChange(true));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.form.values.username).toBe('prestonxyz');
  });

  it('withholds the save until the value moves, and on an empty value', () => {
    const result = renderController();
    expect(result.current.form.canSubmit).toBe(false);

    act(() => result.current.form.setValue('username', ''));
    expect(result.current.form.canSubmit).toBe(false);

    act(() => result.current.form.setValue('username', 'ada'));
    expect(result.current.form.canSubmit).toBe(true);
  });

  it('saves the value it is holding, stays open while saving, then closes', async () => {
    const request = deferred();
    const onSubmit = vi.fn(() => request.promise);
    const result = renderController(onSubmit);
    act(() => result.current.form.setValue('username', 'ada'));

    act(() => result.current.form.submit());
    act(() => result.current.onOpenChange(false));

    expect(onSubmit).toHaveBeenCalledWith('ada');
    expect(result.current.isOpen).toBe(true);
    await act(async () => request.resolve());
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('keeps what was typed and shows why when the save fails', async () => {
    const result = renderController(() =>
      Promise.reject(new SaveError({ fields: { username: { message: 'That username is taken.' } } })),
    );
    act(() => result.current.form.setValue('username', 'ada'));

    act(() => result.current.form.submit());

    await waitFor(() =>
      expect(result.current.form.fields.username.feedback).toEqual({
        type: 'error',
        message: 'That username is taken.',
      }),
    );
    expect(result.current.isOpen).toBe(true);
    expect(result.current.form.values.username).toBe('ada');
  });

  it('re-seeds from the saved username and drops the error on the next open', async () => {
    const result = renderController(() => Promise.reject(new SaveError({ global: { message: 'nope' } })));
    act(() => result.current.form.setValue('username', 'ada'));
    act(() => result.current.form.submit());
    await waitFor(() => expect(result.current.form.error).toBe('nope'));

    act(() => result.current.onOpenChange(false));
    act(() => result.current.onOpenChange(true));

    expect(result.current.form.values.username).toBe('prestonxyz');
    expect(result.current.form.error).toBeUndefined();
  });
});
