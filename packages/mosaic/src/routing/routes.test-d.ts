import { describe, expectTypeOf, test } from 'vitest';

import type { MosaicLocation } from './location';
import { createRouter } from './router';
import type { RouteParams } from './routes';

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

describe('Router', () => {
  const location: MosaicLocation = { useSegmentParts: () => [], write: () => {} };
  const router = createRouter(
    { index: '', security: 'security', statement: 'billing/statement/:statementId' },
    location,
  );

  test('requires the params a pattern declares', () => {
    router.go('security');
    router.go('statement', { statementId: 'st_1' });
    // @ts-expect-error statementId is required
    router.go('statement');
    // @ts-expect-error unknown route
    router.go('billing');
  });

  test('narrows the route name', () => {
    expectTypeOf(router.parse([])?.name).toEqualTypeOf<'index' | 'security' | 'statement' | undefined>();
  });
});
