import { describe, expectTypeOf, test } from 'vitest';

import { Radio } from './radio';

declare const access: 'all' | 'selected';

describe('Radio.Group onValueChange', () => {
  test('gives a string when the group has no value', () => {
    void (
      <Radio.Group
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<string>();
        }}
      />
    );
  });

  test('gives the type of value', () => {
    void (
      <Radio.Group
        value={access}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<'all' | 'selected'>();
        }}
      />
    );
  });

  test('gives the type of defaultValue', () => {
    void (
      <Radio.Group
        defaultValue={access}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<'all' | 'selected'>();
        }}
      />
    );
  });

  test('rejects a value the handler does not accept', () => {
    void (
      <Radio.Group
        // @ts-expect-error -- The handler does not accept this value
        value='other'
        onValueChange={(value: 'all' | 'selected') => value}
      />
    );
  });
});
