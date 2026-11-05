import { describe, expectTypeOf, test } from 'vitest';

import { Radio } from './radio';

type Access = 'all' | 'selected';

declare const access: Access;
declare const onAccessChange: (access: Access) => void;

describe('Radio.Group onValueChange', () => {
  test('takes the value type from a typed value', () => {
    void (
      <Radio.Group
        value={access}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<Access>();
        }}
      />
    );
  });

  test('gives a string when defaultValue is a literal', () => {
    void (
      <Radio.Group
        defaultValue='all'
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<string>();
        }}
      />
    );
  });

  test('gives a string when nothing is typed', () => {
    void (
      <Radio.Group
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<string>();
        }}
      />
    );
  });

  test('takes the value type from a typed handler', () => {
    void (
      <Radio.Group
        defaultValue='all'
        onValueChange={(value: Access) => {
          expectTypeOf(value).toEqualTypeOf<Access>();
        }}
      />
    );
  });

  test('accepts values that are not strings', () => {
    void (
      <Radio.Group
        defaultValue={1}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<number>();
        }}
      >
        <Radio.Item value={1} />
      </Radio.Group>
    );
  });

  test('rejects a value the handler does not accept', () => {
    void (
      <>
        <Radio.Group
          // @ts-expect-error -- The handler does not accept this value
          value='other'
          onValueChange={onAccessChange}
        />
        <Radio.Group
          // @ts-expect-error -- The handler does not accept this value
          defaultValue='other'
          onValueChange={onAccessChange}
        />
      </>
    );
  });
});
