import { describe, expectTypeOf, it } from 'vitest';

import type { ArrayFieldName } from './array';
import { pushFieldValue } from './array';
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

// A form shape deep enough to exercise the recursive path types through the
// array helpers' generics, where TS's instantiation-depth limit bites first.
type Deep = {
  email: string;
  profile: { name: string; tags: string[]; address: { city: string; zip: string } };
  friends: { name: string; nicknames: string[]; meta: { since: number } }[];
  optional?: string[];
};

describe('array field path typing', () => {
  it('narrows field paths to array-valued ones', () => {
    expectTypeOf<'friends'>().toMatchTypeOf<ArrayFieldName<Deep>>();
    expectTypeOf<'profile.tags'>().toMatchTypeOf<ArrayFieldName<Deep>>();
    expectTypeOf<'optional'>().toMatchTypeOf<ArrayFieldName<Deep>>();
    expectTypeOf<'email'>().not.toMatchTypeOf<ArrayFieldName<Deep>>();
    expectTypeOf<'profile'>().not.toMatchTypeOf<ArrayFieldName<Deep>>();
  });

  it('types the pushed value as the array element', () => {
    const form = createForm<Deep>({});
    pushFieldValue(form, 'profile.tags', 'a');
    pushFieldValue(form, 'friends', { name: 'bob', nicknames: [], meta: { since: 1 } });
    // @ts-expect-error element must match the array's item type
    pushFieldValue(form, 'profile.tags', 1);
    // @ts-expect-error 'email' is not an array field
    pushFieldValue(form, 'email', 'a');
  });
});
