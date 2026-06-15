import { allTasks } from 'nanostores';
import { describe, expect, it, vi } from 'vitest';

import { insertFieldValue, pushFieldValue, removeFieldValue } from '../array';
import { createField } from '../field';
import type { StandardSchemaV1 } from '../types';
import { createForm } from './index';

/** Minimal Standard Schema stub for a string field (non-empty + max length). */
function nonEmpty(message = 'Required'): StandardSchemaV1<string> {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: value => (typeof value === 'string' && value.length > 0 ? { value } : { issues: [{ message }] }),
    },
  };
}

describe('createForm', () => {
  it('exposes default values and derived state', () => {
    const form = createForm({ defaultValues: { email: '', age: 0 } });
    expect(form.state.values).toEqual({ email: '', age: 0 });
    expect(form.state.isDirty).toBe(false);
    expect(form.state.isValid).toBe(true);
    expect(form.state.canSubmit).toBe(true);
  });

  it('sets nested and array values by path', () => {
    const form = createForm({ defaultValues: { friends: [{ name: '' }] } });
    form.setFieldValue('friends[0].name', 'Sam');
    expect(form.getFieldValue('friends[0].name')).toBe('Sam');
    expect(form.state.isDirty).toBe(true);
  });

  it('tracks dirty against default value', () => {
    const form = createForm({ defaultValues: { email: 'a@b.c' } });
    form.setFieldValue('email', 'x@y.z');
    expect(form.state.fieldMeta.email.isDirty).toBe(true);
    form.setFieldValue('email', 'a@b.c');
    expect(form.state.fieldMeta.email.isDirty).toBe(false);
  });

  it('runs sync function validators on change', () => {
    const form = createForm({ defaultValues: { age: 10 } });
    createField(form, {
      name: 'age',
      validators: { onChange: ({ value }) => (value < 18 ? 'Too young' : undefined) },
    });
    form.setFieldValue('age', 5);
    expect(form.state.fieldMeta.age.errors).toEqual(['Too young']);
    expect(form.state.isValid).toBe(false);
    form.setFieldValue('age', 20);
    expect(form.state.fieldMeta.age.errors).toEqual([]);
    expect(form.state.isValid).toBe(true);
  });

  it('runs Standard Schema validators on change', () => {
    const form = createForm({ defaultValues: { email: '' } });
    createField(form, { name: 'email', validators: { onChange: nonEmpty('Email required') } });
    form.setFieldValue('email', '');
    expect(form.state.fieldMeta.email.errors).toEqual(['Email required']);
    form.setFieldValue('email', 'a@b.c');
    expect(form.state.fieldMeta.email.errors).toEqual([]);
  });

  it('runs async validators tracked by tasks', async () => {
    const form = createForm({ defaultValues: { username: '' } });
    createField(form, {
      name: 'username',
      validators: {
        onChangeAsync: async ({ value }) => {
          await Promise.resolve();
          return value === 'taken' ? 'Taken' : undefined;
        },
      },
    });
    form.setFieldValue('username', 'taken');
    expect(form.state.fieldMeta.username.isValidating).toBe(true);
    await allTasks();
    expect(form.state.fieldMeta.username.errors).toEqual(['Taken']);
    expect(form.state.fieldMeta.username.isValidating).toBe(false);
  });

  it('distributes form-level validator errors to fields', () => {
    const form = createForm({
      defaultValues: { password: '', confirm: '' },
      validators: {
        onChange: ({ value }) => (value.password !== value.confirm ? { fields: { confirm: 'Mismatch' } } : undefined),
      },
    });
    form.setFieldValue('password', 'a');
    form.setFieldValue('confirm', 'b');
    expect(form.state.fieldMeta.confirm.errors).toEqual(['Mismatch']);
    form.setFieldValue('confirm', 'a');
    expect(form.state.fieldMeta.confirm.errors).toEqual([]);
  });

  it('blocks submit when invalid and calls onSubmitInvalid', async () => {
    const onSubmit = vi.fn();
    const onSubmitInvalid = vi.fn();
    const form = createForm({
      defaultValues: { email: '' },
      onSubmit,
      onSubmitInvalid,
    });
    createField(form, { name: 'email', validators: { onSubmit: nonEmpty() } });
    await form.handleSubmit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onSubmitInvalid).toHaveBeenCalledOnce();
    expect(form.state.submissionAttempts).toBe(1);
  });

  it('submits when valid', async () => {
    const onSubmit = vi.fn();
    const form = createForm({ defaultValues: { email: 'a@b.c' }, onSubmit });
    createField(form, { name: 'email', validators: { onSubmit: nonEmpty() } });
    await form.handleSubmit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { email: 'a@b.c' } }));
    expect(form.state.isSubmitSuccessful).toBe(true);
  });

  it('marks fields touched on submit', async () => {
    const form = createForm({ defaultValues: { email: '' } });
    createField(form, { name: 'email' });
    await form.handleSubmit();
    expect(form.state.fieldMeta.email.isTouched).toBe(true);
  });

  it('resets values and meta', () => {
    const form = createForm({ defaultValues: { email: 'a@b.c' } });
    form.setFieldValue('email', 'x');
    expect(form.state.isDirty).toBe(true);
    form.reset();
    expect(form.state.values).toEqual({ email: 'a@b.c' });
    expect(form.state.isDirty).toBe(false);
  });

  it('supports array push/insert/remove via free functions', () => {
    const form = createForm({ defaultValues: { items: ['a'] as string[] } });
    pushFieldValue(form, 'items', 'b');
    expect(form.getFieldValue('items')).toEqual(['a', 'b']);
    insertFieldValue(form, 'items', 1, 'c');
    expect(form.getFieldValue('items')).toEqual(['a', 'c', 'b']);
    removeFieldValue(form, 'items', 0);
    expect(form.getFieldValue('items')).toEqual(['c', 'b']);
  });

  it('deletes a field value and meta', () => {
    const form = createForm({ defaultValues: { a: '1', b: '2' } as Record<string, string> });
    form.setFieldValue('a', 'x');
    expect(form.state.fieldMeta.a).toBeDefined();
    form.deleteField('a');
    expect(form.getFieldValue('a')).toBeUndefined();
    expect(form.state.fieldMeta.a).toBeUndefined();
    expect(form.getFieldValue('b')).toBe('2');
  });

  it('revalidates dependents via listenTo', () => {
    const form = createForm({ defaultValues: { password: '', confirm: '' } });
    createField(form, {
      name: 'confirm',
      validators: {
        onChange: ({ value, fieldApi }) => (value !== fieldApi.form.getFieldValue('password') ? 'Mismatch' : undefined),
        onChangeListenTo: ['password'],
      },
    });
    form.setFieldValue('confirm', 'a');
    expect(form.state.fieldMeta.confirm.errors).toEqual(['Mismatch']);
    form.setFieldValue('password', 'a');
    expect(form.state.fieldMeta.confirm.errors).toEqual([]);
  });
});
