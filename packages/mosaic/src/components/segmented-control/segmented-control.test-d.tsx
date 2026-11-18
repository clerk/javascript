import { describe, expectTypeOf, test } from 'vitest';

import { SegmentedControl } from '.';

type Access = 'all' | 'selected';

declare const access: Access;
declare const onAccessChange: (access: Access) => void;

describe('SegmentedControl.Root onValueChange', () => {
  test('takes the value type from a typed value', () => {
    void (
      <SegmentedControl.Root
        value={access}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<Access>();
        }}
      />
    );
  });

  test('gives a string when defaultValue is a literal', () => {
    void (
      <SegmentedControl.Root
        defaultValue='all'
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<string>();
        }}
      />
    );
  });

  test('gives a string when nothing is typed', () => {
    void (
      <SegmentedControl.Root
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<string>();
        }}
      />
    );
  });

  test('takes the value type from a typed handler', () => {
    void (
      <SegmentedControl.Root
        defaultValue='all'
        onValueChange={(value: Access) => {
          expectTypeOf(value).toEqualTypeOf<Access>();
        }}
      />
    );
  });

  test('accepts values that are not strings', () => {
    void (
      <SegmentedControl.Root
        defaultValue={1}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<number>();
        }}
      >
        <SegmentedControl.Item value={1} />
      </SegmentedControl.Root>
    );
  });

  test('rejects a value the handler does not accept', () => {
    void (
      <>
        <SegmentedControl.Root
          // @ts-expect-error -- The handler does not accept this value
          value='other'
          onValueChange={onAccessChange}
        />
        <SegmentedControl.Root
          // @ts-expect-error -- The handler does not accept this value
          defaultValue='other'
          onValueChange={onAccessChange}
        />
      </>
    );
  });
});
