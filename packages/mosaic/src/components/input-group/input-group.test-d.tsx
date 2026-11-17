import { describe, expectTypeOf, test } from 'vitest';

import type { InputGroup, InputGroupInputProps, InputGroupStartProps } from '.';

describe('InputGroup part types', () => {
  test('a part re-exported from another component keeps that component namespace', () => {
    expectTypeOf<InputGroup.Input.Props>().toEqualTypeOf<InputGroupInputProps>();
    expectTypeOf<InputGroup.Start.Props>().toEqualTypeOf<InputGroupStartProps>();
  });
});
