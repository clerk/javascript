import { describe, expectTypeOf, it } from 'vitest';

import { createForm } from './form';
import type { FieldName, FieldValue } from './types';

// NOTE: form data must be a `type` (object-literal), not an `interface`.
// nanostores' `AllPaths` requires `Record<string, unknown>`, and only
// object-literal types carry the implicit index signature that satisfies it.
type Data = {
  email: string;
  age: number;
  friends: { name: string }[];
};

describe('field path typing', () => {
  it('derives typed paths from form data', () => {
    expectTypeOf<'email'>().toMatchTypeOf<FieldName<Data>>();
    expectTypeOf<'friends[0].name'>().toMatchTypeOf<FieldName<Data>>();
  });

  it('derives the value type at a path', () => {
    expectTypeOf<FieldValue<Data, 'email'>>().toEqualTypeOf<string>();
    expectTypeOf<FieldValue<Data, 'age'>>().toEqualTypeOf<number>();
    expectTypeOf<FieldValue<Data, 'friends[0].name'>>().toEqualTypeOf<string>();
  });

  it('types getFieldValue by path', () => {
    const form = createForm<Data>({ defaultValues: { email: '', age: 0, friends: [] } });
    expectTypeOf(form.getFieldValue('email')).toEqualTypeOf<string>();
    expectTypeOf(form.getFieldValue('age')).toEqualTypeOf<number>();
  });
});
