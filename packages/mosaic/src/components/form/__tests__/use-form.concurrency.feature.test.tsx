import { act, renderHook } from '@testing-library/react';
import { Activity, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred, tick } from '../../../__tests__/async';
import type { FieldFeedback } from '../form-submit-error';
import { useForm, type UseFormOptions } from '../use-form';

function renderFormInActivity<TValues extends object>(options: UseFormOptions<TValues>) {
  let mode: 'visible' | 'hidden' = 'visible';
  const wrapper = ({ children }: { children: ReactNode }) => <Activity mode={mode}>{children}</Activity>;
  const view = renderHook(() => useForm(options), { wrapper });
  const setMode = (next: typeof mode) => {
    mode = next;
    act(() => view.rerender());
  };
  return { result: view.result, hide: () => setMode('hidden'), show: () => setMode('visible') };
}

describe.runIf(Activity)('useForm inside Activity', () => {
  it('runs a submit queued behind an async check that settled while hidden', async () => {
    const check = deferred<FieldFeedback | undefined>();
    const onSubmit = vi.fn(() => Promise.resolve());
    const form = renderFormInActivity({
      initialValues: { password: '' },
      fields: { password: { validateAsync: () => check.promise } },
      onSubmit,
    });
    act(() => form.result.current.setValue('password', 'ab'));
    act(() => form.result.current.submit());

    form.hide();
    await act(async () => {
      check.resolve(undefined);
      await tick();
    });
    form.show();
    await act(tick);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ password: 'ab' });
    expect(form.result.current.isSubmitting).toBe(false);
  });

  it('finishes a submit that settled while hidden and keeps the submitted values', async () => {
    const save = deferred<void>();
    const onSubmit = vi.fn(() => save.promise);
    const form = renderFormInActivity({ initialValues: { name: 'Acme' }, onSubmit });
    act(() => form.result.current.setValue('name', 'Globex'));
    act(() => form.result.current.submit());
    expect(form.result.current.isSubmitting).toBe(true);

    form.hide();
    await act(async () => {
      save.resolve();
      await tick();
    });
    form.show();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(form.result.current.isSubmitting).toBe(false);
    act(() => form.result.current.submit());
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onSubmit).toHaveBeenLastCalledWith({ name: 'Globex' });
  });

  it('shows a submit error that arrived while hidden', async () => {
    const save = deferred<void>();
    const form = renderFormInActivity({
      initialValues: { name: 'Acme' },
      onSubmit: () => save.promise,
      errorFallback: 'Could not save',
    });
    act(() => form.result.current.submit());

    form.hide();
    await act(async () => {
      save.reject(new Error('boom'));
      await tick();
    });
    form.show();

    expect(form.result.current.isSubmitting).toBe(false);
    expect(form.result.current.error).toBe('Could not save');
  });
});
