import { describe, expectTypeOf, test } from 'vitest';

import { Select } from './select';

declare const label: string;

const expirations = [
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
] as const;

describe('Select.Root onValueChange', () => {
  test('gives a string when the items carry strings', () => {
    void (
      <Select.Root
        items={[{ value: label, label }]}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<string>();
        }}
      >
        {null}
      </Select.Root>
    );
  });

  test('gives the type of the item values', () => {
    void (
      <Select.Root
        items={expirations.map(item => ({ ...item }))}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<'1d' | '7d'>();
        }}
      >
        {null}
      </Select.Root>
    );
  });

  test('gives an array of the item values when multiple', () => {
    void (
      <Select.Root
        multiple
        items={expirations.map(item => ({ ...item }))}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<Array<'1d' | '7d'>>();
        }}
      >
        {null}
      </Select.Root>
    );
  });

  test('rejects a value that is not an item', () => {
    void (
      <Select.Root
        items={expirations.map(item => ({ ...item }))}
        // @ts-expect-error -- No item carries this value
        value='30d'
      >
        {null}
      </Select.Root>
    );
  });
});
