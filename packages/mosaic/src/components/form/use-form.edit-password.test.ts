import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { FieldFeedback } from './form-submit-error';
import { FormSubmitError } from './form-submit-error';
import { useForm } from './use-form';

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

interface EditPasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

async function checkStrength(password: string): Promise<FieldFeedback | undefined> {
  await Promise.resolve();
  if (password.length < 8) {
    return { type: 'error', message: 'Your password must contain 8 or more characters.' };
  }
  if (!/[0-9]/.test(password)) {
    return { type: 'warning', message: 'Your password works, but could be stronger.' };
  }
  return { type: 'success', message: 'Your password meets all the necessary requirements.' };
}

function useEditPasswordForm(onSubmit: (values: EditPasswordValues) => Promise<void>) {
  return useForm({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    fields: {
      newPassword: { validateAsync: checkStrength },
      confirmPassword: {
        validate: (value, values) => {
          if (value === '') {
            return undefined;
          }
          return value === values.newPassword
            ? { type: 'success', message: 'Passwords match.' }
            : { type: 'error', message: 'Passwords do not match.' };
        },
      },
    },
    onSubmit,
  });
}

describe('useForm: edit password', () => {
  it('walks a user from a weak password to a saved one', async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useEditPasswordForm(onSubmit));

    act(() => result.current.setValue('currentPassword', 'old-secret'));
    act(() => result.current.setValue('newPassword', 'short'));
    await act(flush);
    expect(result.current.fields.newPassword.feedback).toBeUndefined();
    expect(result.current.canSubmit).toBe(false);

    act(() => result.current.touch('newPassword'));
    expect(result.current.fields.newPassword.feedback).toEqual({
      type: 'error',
      message: 'Your password must contain 8 or more characters.',
    });

    act(() => result.current.setValue('newPassword', 'longenough'));
    expect(result.current.fields.newPassword.isValidating).toBe(true);
    await act(flush);
    expect(result.current.fields.newPassword.feedback).toEqual({
      type: 'warning',
      message: 'Your password works, but could be stronger.',
    });

    act(() => result.current.setValue('newPassword', 'longenough1'));
    await act(flush);
    expect(result.current.fields.newPassword.feedback).toEqual({
      type: 'success',
      message: 'Your password meets all the necessary requirements.',
    });

    act(() => result.current.setValue('confirmPassword', 'longenough'));
    expect(result.current.fields.confirmPassword.feedback).toBeUndefined();
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.setValue('confirmPassword', 'longenough1'));
    expect(result.current.fields.confirmPassword.feedback).toEqual({ type: 'success', message: 'Passwords match.' });
    expect(result.current.canSubmit).toBe(true);

    act(() => result.current.submit());
    expect(onSubmit).toHaveBeenCalledWith({
      currentPassword: 'old-secret',
      newPassword: 'longenough1',
      confirmPassword: 'longenough1',
    });
  });

  it('surfaces every error at once when the user submits early', () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useEditPasswordForm(onSubmit));
    act(() => result.current.setValue('newPassword', 'abc'));
    act(() => result.current.setValue('confirmPassword', 'abd'));
    act(() => result.current.submit());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.fields.confirmPassword.feedback).toEqual({
      type: 'error',
      message: 'Passwords do not match.',
    });
  });

  it('shows the server rejection on the banner and under the field the model names', async () => {
    const onSubmit = vi.fn(() =>
      Promise.reject(
        new FormSubmitError<EditPasswordValues>('Password could not be changed.', {
          currentPassword: 'Incorrect password.',
        }),
      ),
    );
    const { result } = renderHook(() => useEditPasswordForm(onSubmit));
    act(() => result.current.setValue('currentPassword', 'wrong'));
    act(() => result.current.setValue('newPassword', 'longenough1'));
    await act(flush);
    act(() => result.current.setValue('confirmPassword', 'longenough1'));
    await act(async () => {
      result.current.submit();
      await flush();
    });
    expect(result.current.error).toBe('Password could not be changed.');
    expect(result.current.fields.currentPassword.feedback).toEqual({ type: 'error', message: 'Incorrect password.' });
    act(() => result.current.setValue('currentPassword', 'right'));
    expect(result.current.fields.currentPassword.feedback).toBeUndefined();
    expect(result.current.canSubmit).toBe(true);
  });
});
