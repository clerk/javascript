import { expectTypeOf, test } from 'vitest';

import type { UseFormOptions, UseFormResult } from './use-form';
import { useForm } from './use-form';

test('infers success result and submitted values from the submission', () => {
  useForm({
    initialValues: { username: 'alex' },
    onSubmit: values => Promise.resolve({ id: values.username, count: 1 }),
    onSuccess: (result, submittedValues) => {
      expectTypeOf(result).toEqualTypeOf<{ id: string; count: number }>();
      expectTypeOf(submittedValues).toEqualTypeOf<{ username: string }>();
    },
  });
});

test('preserves explicit values generics and options without a success callback', () => {
  const options: UseFormOptions<{ username: string }> = {
    initialValues: { username: 'alex' },
    onSubmit: () => Promise.resolve({ id: 'saved' }),
  };
  expectTypeOf(useForm<{ username: string }>(options)).toEqualTypeOf<UseFormResult<{ username: string }>>();
});

test('infers a void result for submissions without a return value', () => {
  useForm({
    initialValues: { username: 'alex' },
    onSubmit: () => Promise.resolve(),
    onSuccess: result => {
      expectTypeOf(result).toEqualTypeOf<void>();
    },
  });
});
