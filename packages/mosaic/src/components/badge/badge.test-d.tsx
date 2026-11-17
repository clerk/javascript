import { describe, expectTypeOf, test } from 'vitest';

import type { Badge, BadgeProps } from '.';

describe('Badge types', () => {
  test('the namespace names the same props as the flat type', () => {
    expectTypeOf<Badge.Props>().toEqualTypeOf<BadgeProps>();
  });
});
