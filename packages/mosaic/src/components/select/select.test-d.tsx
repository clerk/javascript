import { describe, expectTypeOf, test } from 'vitest';

import { Select } from '.';

type Expiration = '1d' | '7d';

declare const expiration: Expiration | null;
declare const expirationItems: { value: Expiration; label: string }[];
declare const onExpirationChange: (expiration: Expiration) => void;

describe('Select.Root onValueChange', () => {
  test('takes the value type from typed items', () => {
    void (
      <Select.Root
        items={expirationItems}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<Expiration>();
        }}
      >
        {null}
      </Select.Root>
    );
  });

  test('takes the value type from a typed value, including null for no selection', () => {
    void (
      <Select.Root
        items={[]}
        value={expiration}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<Expiration>();
        }}
      >
        {null}
      </Select.Root>
    );
  });

  test('gives a string when the items are literals', () => {
    void (
      <Select.Root
        items={[{ value: '1d', label: '1 day' }]}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<string>();
        }}
      >
        {null}
      </Select.Root>
    );
  });

  test('gives an array with multiple', () => {
    void (
      <Select.Root
        multiple
        items={expirationItems}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<Expiration[]>();
        }}
      >
        {null}
      </Select.Root>
    );
  });

  test('accepts values that are not strings', () => {
    void (
      <Select.Root
        items={[{ value: 10, label: '10' }]}
        defaultValue={10}
        onValueChange={value => {
          expectTypeOf(value).toEqualTypeOf<number>();
        }}
      >
        <Select.Option
          value={10}
          label='10'
        />
      </Select.Root>
    );
  });

  test('rejects a value or an item the handler does not accept', () => {
    void (
      <>
        <Select.Root
          items={expirationItems}
          // @ts-expect-error -- The handler does not accept this value
          value='30d'
          onValueChange={onExpirationChange}
        >
          {null}
        </Select.Root>
        <Select.Root
          // @ts-expect-error -- The handler does not accept this item
          items={[{ value: '30d', label: '30 days' }]}
          onValueChange={onExpirationChange}
        >
          {null}
        </Select.Root>
      </>
    );
  });
});
