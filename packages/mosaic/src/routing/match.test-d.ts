import { describe, expectTypeOf, test } from 'vitest';

import type { RouteParams } from './match';

describe('RouteParams', () => {
  test('infers required and optional params from the pattern', () => {
    expectTypeOf<RouteParams<'org/:orgId/member/:memberId?'>>().toEqualTypeOf<
      Record<'orgId', string> & Partial<Record<'memberId', string>>
    >();
  });

  test('infers no params for a static pattern', () => {
    expectTypeOf<keyof RouteParams<'security'>>().toEqualTypeOf<never>();
  });
});
