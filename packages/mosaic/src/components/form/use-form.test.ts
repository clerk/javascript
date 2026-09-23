import { act, renderHook } from '@testing-library/react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import type { FieldFeedback } from './form-submit-error';
import { FormSubmitError } from './form-submit-error';
import { useForm } from './use-form';

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));
const resolved = () => Promise.resolve();

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('useForm', () => {
  it('starts from initialValues and updates one value at a time', () => {
    const { result } = renderHook(() => useForm({ initialValues: { username: 'alex', bio: '' }, onSubmit: resolved }));
    expect(result.current.values).toEqual({ username: 'alex', bio: '' });
    expect(result.current.id).toEqual(expect.any(String));
    act(() => result.current.setValue('bio', 'hello'));
    expect(result.current.values).toEqual({ username: 'alex', bio: 'hello' });
  });

  it('types values, fields, setValue, validators and reset from initialValues', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { username: 'alex', age: 1 },
        fields: {
          age: {
            validate: (value, values) => {
              expectTypeOf(value).toEqualTypeOf<number>();
              expectTypeOf(values).toEqualTypeOf<{ username: string; age: number }>();
              return undefined;
            },
          },
        },
        onSubmit: resolved,
      }),
    );
    expectTypeOf(result.current.values).toEqualTypeOf<{ username: string; age: number }>();
    expectTypeOf(result.current.setValue).parameter(0).toEqualTypeOf<'username' | 'age'>();
    expectTypeOf(result.current.touch).parameter(0).toEqualTypeOf<'username' | 'age'>();
    expectTypeOf(result.current.register).parameter(0).toEqualTypeOf<'username'>();
    expectTypeOf(result.current.control).parameter(0).toEqualTypeOf<'username' | 'age'>();
    expectTypeOf(result.current.fields.age.feedback).toEqualTypeOf<FieldFeedback | undefined>();
    expectTypeOf(result.current.error).toEqualTypeOf<string | undefined>();
    expectTypeOf(result.current.reset).parameter(0).toEqualTypeOf<{ username: string; age: number } | undefined>();
  });

  it('submits the current values once and ignores submits while pending', async () => {
    const request = deferred<void>();
    const onSubmit = vi.fn(async (_values: { username: string }) => {
      await request.promise;
    });
    const { result } = renderHook(() => useForm({ initialValues: { username: 'alex' }, onSubmit }));
    act(() => result.current.setValue('username', 'alexc'));
    act(() => result.current.submit());
    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.submit());
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ username: 'alexc' });
    await act(async () => {
      request.resolve();
      await flush();
    });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('submits a value set in the same tick', () => {
    const onSubmit = vi.fn(resolved);
    const { result } = renderHook(() => useForm({ initialValues: { code: '' }, onSubmit }));
    act(() => {
      result.current.setValue('code', '123456');
      result.current.submit();
    });
    expect(onSubmit).toHaveBeenCalledWith({ code: '123456' });
  });

  it('maps FormSubmitError onto the form message and field feedback, clearing the field on change', async () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { username: 'alex' },
        onSubmit: () =>
          Promise.reject(new FormSubmitError({ message: 'Could not save', fields: { username: 'Taken' } })),
      }),
    );
    await act(async () => {
      result.current.submit();
      await flush();
    });
    expect(result.current.error).toBe('Could not save');
    expect(result.current.fields.username.feedback).toEqual({ type: 'error', message: 'Taken' });
    act(() => result.current.setValue('username', 'alexc'));
    expect(result.current.error).toBe('Could not save');
    expect(result.current.fields.username.feedback).toBeUndefined();
  });

  it('maps a fields-only FormSubmitError onto field feedback with no form message', async () => {
    const failure = new FormSubmitError({ fields: { username: 'Taken', bio: 'Too long' } });
    expect(failure.message).toBe('Taken Too long');
    const { result } = renderHook(() =>
      useForm({ initialValues: { username: 'alex', bio: '' }, onSubmit: () => Promise.reject(failure) }),
    );
    await act(async () => {
      result.current.submit();
      await flush();
    });
    expect(result.current.error).toBeUndefined();
    expect(result.current.fields.username.feedback).toEqual({ type: 'error', message: 'Taken' });
    expect(result.current.fields.bio.feedback).toEqual({ type: 'error', message: 'Too long' });
  });

  it('shows only the message for a plain Error and a generic message otherwise', async () => {
    const plain = renderHook(() =>
      useForm({ initialValues: { username: '' }, onSubmit: () => Promise.reject(new Error('Nope')) }),
    );
    await act(async () => {
      plain.result.current.submit();
      await flush();
    });
    expect(plain.result.current.error).toBe('Nope');

    const cause: unknown = 'boom';
    const unknown = renderHook(() =>
      useForm({
        initialValues: { username: '' },
        onSubmit: async () => {
          await Promise.resolve();
          throw cause;
        },
      }),
    );
    await act(async () => {
      unknown.result.current.submit();
      await flush();
    });
    expect(unknown.result.current.error).toBe('Something went wrong. Please try again.');
  });

  it('clears the message on the next submit', async () => {
    let fail = true;
    const { result } = renderHook(() =>
      useForm({
        initialValues: { username: '' },
        onSubmit: () => (fail ? Promise.reject(new Error('Nope')) : Promise.resolve()),
      }),
    );
    await act(async () => {
      result.current.submit();
      await flush();
    });
    expect(result.current.error).toBe('Nope');
    fail = false;
    act(() => result.current.submit());
    expect(result.current.error).toBeUndefined();
  });

  it('hides validator errors until the field is touched, then updates them live', () => {
    const onSubmit = vi.fn(resolved);
    const { result } = renderHook(() =>
      useForm({
        initialValues: { password: '' },
        fields: {
          password: {
            validate: value => (value.length < 8 ? { type: 'error', message: 'Too short' } : undefined),
          },
        },
        onSubmit,
      }),
    );
    act(() => result.current.setValue('password', 'abc'));
    expect(result.current.fields.password.feedback).toBeUndefined();
    expect(result.current.fields.password.touched).toBe(false);
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.touch('password'));
    expect(result.current.fields.password.touched).toBe(true);
    expect(result.current.fields.password.feedback).toEqual({ type: 'error', message: 'Too short' });
    act(() => result.current.setValue('password', 'abcdefgh'));
    expect(result.current.fields.password.feedback).toBeUndefined();
    expect(result.current.canSubmit).toBe(true);
  });

  it('shows success, warning and info feedback immediately', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { password: '', confirm: '' },
        fields: {
          password: { validate: value => (value ? { type: 'warning', message: 'Could be stronger' } : undefined) },
          confirm: {
            validate: (value, values) =>
              value === '' ? undefined : { type: value === values.password ? 'success' : 'error', message: 'Match?' },
          },
        },
        onSubmit: resolved,
      }),
    );
    act(() => result.current.setValue('password', 'a'));
    expect(result.current.fields.password.feedback).toEqual({ type: 'warning', message: 'Could be stronger' });
    act(() => result.current.setValue('confirm', 'a'));
    expect(result.current.fields.confirm.feedback).toEqual({ type: 'success', message: 'Match?' });
    act(() => result.current.setValue('password', 'ab'));
    expect(result.current.fields.confirm.feedback).toBeUndefined();
    expect(result.current.canSubmit).toBe(false);
  });

  it('touches every field on submit and does not call onSubmit while a validator fails', () => {
    const onSubmit = vi.fn(resolved);
    const { result } = renderHook(() =>
      useForm({
        initialValues: { a: '', b: '' },
        fields: { a: { validate: () => ({ type: 'error', message: 'Bad' }) } },
        onSubmit,
      }),
    );
    act(() => result.current.submit());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.fields.a.touched).toBe(true);
    expect(result.current.fields.b.touched).toBe(true);
    expect(result.current.fields.a.feedback).toEqual({ type: 'error', message: 'Bad' });
  });

  it('gates submit silently with canSubmit()', () => {
    const onSubmit = vi.fn(resolved);
    const { result } = renderHook(() =>
      useForm({ initialValues: { username: 'alex' }, onSubmit, canSubmit: values => values.username !== 'alex' }),
    );
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.fields.username.feedback).toBeUndefined();
    act(() => result.current.submit());
    expect(onSubmit).not.toHaveBeenCalled();
    act(() => result.current.setValue('username', 'alexc'));
    expect(result.current.canSubmit).toBe(true);
  });

  it('runs async validators on change with the latest result winning', async () => {
    const checks = new Map<string, ReturnType<typeof deferred<FieldFeedback | undefined>>>();
    const validateAsync = vi.fn((value: string) => {
      const check = deferred<FieldFeedback | undefined>();
      checks.set(value, check);
      return check.promise;
    });
    const onSubmit = vi.fn(resolved);
    const { result } = renderHook(() =>
      useForm({ initialValues: { password: '' }, fields: { password: { validateAsync } }, onSubmit }),
    );
    expect(validateAsync).not.toHaveBeenCalled();
    expect(result.current.fields.password.isValidating).toBe(false);
    act(() => result.current.setValue('password', 'a'));
    act(() => result.current.setValue('password', 'ab'));
    expect(validateAsync).toHaveBeenCalledTimes(2);
    expect(result.current.fields.password.isValidating).toBe(true);
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.submit());
    expect(onSubmit).not.toHaveBeenCalled();
    await act(async () => {
      checks.get('ab')?.resolve({ type: 'success', message: 'Strong' });
      await flush();
    });
    expect(result.current.fields.password.feedback).toEqual({ type: 'success', message: 'Strong' });
    expect(result.current.fields.password.isValidating).toBe(false);
    expect(result.current.canSubmit).toBe(true);
    await act(async () => {
      checks.get('a')?.resolve({ type: 'error', message: 'Weak' });
      await flush();
    });
    expect(result.current.fields.password.feedback).toEqual({ type: 'success', message: 'Strong' });
  });

  it('skips async validation when the value returns to its initial value', async () => {
    const validateAsync = vi.fn(() => Promise.resolve(undefined));
    const { result } = renderHook(() =>
      useForm({ initialValues: { username: 'alex' }, fields: { username: { validateAsync } }, onSubmit: resolved }),
    );
    act(() => result.current.setValue('username', 'alexc'));
    expect(validateAsync).toHaveBeenCalledTimes(1);
    act(() => result.current.setValue('username', 'alex'));
    await act(flush);
    expect(validateAsync).toHaveBeenCalledTimes(1);
    expect(result.current.fields.username.isValidating).toBe(false);
  });

  it('prefers a sync validator result over the async one for the same field', async () => {
    const validateAsync = vi.fn(() => Promise.resolve<FieldFeedback>({ type: 'success', message: 'Strong' }));
    const { result } = renderHook(() =>
      useForm({
        initialValues: { password: '' },
        fields: {
          password: {
            validate: value => (value.length < 3 ? { type: 'info', message: 'Keep going' } : undefined),
            validateAsync,
          },
        },
        onSubmit: resolved,
      }),
    );
    act(() => result.current.setValue('password', 'ab'));
    await act(flush);
    expect(result.current.fields.password.feedback).toEqual({ type: 'info', message: 'Keep going' });
    act(() => result.current.setValue('password', 'abc'));
    await act(flush);
    expect(result.current.fields.password.feedback).toEqual({ type: 'success', message: 'Strong' });
  });

  it('resets to the latest initialValues or to the given values, clearing errors, touched and feedback', async () => {
    const { result, rerender } = renderHook(
      ({ username }) =>
        useForm({
          initialValues: { username },
          fields: { username: { validate: () => ({ type: 'error', message: 'Bad' }) } },
          onSubmit: () => Promise.reject(new Error('Nope')),
        }),
      { initialProps: { username: 'alex' } },
    );
    act(() => result.current.setValue('username', 'draft'));
    await act(async () => {
      result.current.submit();
      await flush();
    });
    expect(result.current.fields.username.touched).toBe(true);
    expect(result.current.fields.username.feedback).toEqual({ type: 'error', message: 'Bad' });
    rerender({ username: 'saved' });
    act(() => result.current.reset());
    expect(result.current.values).toEqual({ username: 'saved' });
    expect(result.current.error).toBeUndefined();
    expect(result.current.fields.username.touched).toBe(false);
    expect(result.current.fields.username.feedback).toBeUndefined();
    act(() => result.current.reset({ username: 'given' }));
    expect(result.current.values).toEqual({ username: 'given' });
  });

  it('ignores changes and reset while submitting', async () => {
    const request = deferred<void>();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { username: 'alex' },
        onSubmit: async () => {
          await request.promise;
        },
      }),
    );
    act(() => result.current.submit());
    act(() => result.current.setValue('username', 'other'));
    act(() => result.current.reset());
    expect(result.current.values).toEqual({ username: 'alex' });
    expect(result.current.isSubmitting).toBe(true);
    await act(async () => {
      request.resolve();
      await flush();
    });
    expect(result.current.isSubmitting).toBe(false);
  });

  it('registers a text control with its name, value, change and blur handlers', () => {
    const { result } = renderHook(() => useForm({ initialValues: { username: 'alex' }, onSubmit: resolved }));
    expect(result.current.register('username')).toMatchObject({ name: 'username', value: 'alex' });
    act(() => result.current.register('username').onChange({ target: { value: 'alexc' } }));
    expect(result.current.values.username).toBe('alexc');
    expect(result.current.register('username').value).toBe('alexc');
    expect(result.current.fields.username.touched).toBe(false);
    act(() => result.current.register('username').onBlur());
    expect(result.current.fields.username.touched).toBe(true);
  });

  it('controls a value-shaped field of any type with its name, value, value and blur handlers', () => {
    const { result } = renderHook(() => useForm({ initialValues: { code: '', count: 0 }, onSubmit: resolved }));
    expect(result.current.control('count')).toMatchObject({ name: 'count', value: 0 });
    act(() => result.current.control('count').onValueChange(2));
    expect(result.current.values.count).toBe(2);
    act(() => result.current.control('code').onValueChange('123456'));
    expect(result.current.control('code').value).toBe('123456');
    expect(result.current.fields.code.touched).toBe(false);
    act(() => result.current.control('code').onBlur());
    expect(result.current.fields.code.touched).toBe(true);
  });

  it('focuses the first registered control with an error instead of submitting', () => {
    const onSubmit = vi.fn(resolved);
    const { result } = renderHook(() =>
      useForm({
        initialValues: { a: '', b: '' },
        fields: { b: { validate: value => (value === '' ? { type: 'error', message: 'Required' } : undefined) } },
        onSubmit,
      }),
    );
    const a = document.body.appendChild(document.createElement('input'));
    const b = document.body.appendChild(document.createElement('input'));
    result.current.register('a').ref(a);
    result.current.register('b').ref(b);
    act(() => result.current.submit());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(b);
    act(() => result.current.setValue('b', 'ok'));
    a.focus();
    act(() => result.current.submit());
    expect(onSubmit).toHaveBeenCalledWith({ a: '', b: 'ok' });
    expect(document.activeElement).toBe(a);
    a.remove();
    b.remove();
  });

  it('marks fields and the form dirty against initialValues, or the values given to reset', () => {
    const { result } = renderHook(() => useForm({ initialValues: { username: 'alex', bio: '' }, onSubmit: resolved }));
    expect(result.current.isDirty).toBe(false);
    act(() => result.current.setValue('bio', 'hi'));
    expect(result.current.fields.bio.isDirty).toBe(true);
    expect(result.current.fields.username.isDirty).toBe(false);
    expect(result.current.isDirty).toBe(true);
    act(() => result.current.setValue('bio', ''));
    expect(result.current.isDirty).toBe(false);
    act(() => result.current.reset({ username: 'sam', bio: 'x' }));
    expect(result.current.isDirty).toBe(false);
    act(() => result.current.setValue('bio', ''));
    expect(result.current.fields.bio.isDirty).toBe(true);
    act(() => result.current.reset());
    expect(result.current.values).toEqual({ username: 'alex', bio: '' });
    expect(result.current.isDirty).toBe(false);
  });

  it('handles a form submit event by preventing navigation and submitting', () => {
    const onSubmit = vi.fn(resolved);
    const { result } = renderHook(() => useForm({ initialValues: { username: 'alex' }, onSubmit }));
    const preventDefault = vi.fn();
    act(() => result.current.handleSubmit({ preventDefault }));
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({ username: 'alex' });
  });
});
