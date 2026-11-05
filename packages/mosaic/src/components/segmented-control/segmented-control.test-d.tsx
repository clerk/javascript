import { describe, expectTypeOf, test } from 'vitest';

import { SegmentedControl } from './segmented-control';

declare const access: 'all' | 'selected';

describe('SegmentedControl.Root onValueChange', () => {
  test('gives a string when the group has no value', () => {
    void (
      <SegmentedControl.Root
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<string>();
        }}
      />
    );
  });

  test('gives the type of value', () => {
    void (
      <SegmentedControl.Root
        value={access}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<'all' | 'selected'>();
        }}
      />
    );
  });

  test('gives the type of defaultValue', () => {
    void (
      <SegmentedControl.Root
        defaultValue={access}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<'all' | 'selected'>();
        }}
      />
    );
  });

  test('rejects a value the handler does not accept', () => {
    void (
      <SegmentedControl.Root
        // @ts-expect-error -- The handler does not accept this value
        value='other'
        onValueChange={(value: 'all' | 'selected') => value}
      />
    );
  });
});
