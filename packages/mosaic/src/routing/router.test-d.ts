import { describe, expectTypeOf, test } from 'vitest';

import { createMemoryLocation } from './memory-location';
import { createRouter } from './router';

const router = createRouter(
  { security: 'security', statement: 'billing/statement/:statementId', plan: 'plans/:planId?' },
  createMemoryLocation(),
);

describe('Router href', () => {
  test('accepts a static route without params', () => {
    expectTypeOf(router.href('security')).toEqualTypeOf<string>();
  });

  test('requires params for a route with a required param', () => {
    // @ts-expect-error statementId is required
    router.href('statement');
    // @ts-expect-error statementId is required
    router.href('statement', {});
    expectTypeOf(router.href('statement', { statementId: 'st_1' }, { tab: 'items' })).toEqualTypeOf<string>();
  });

  test('allows omitting an optional param', () => {
    expectTypeOf(router.href('plan')).toEqualTypeOf<string>();
  });

  test('rejects an unknown route name', () => {
    // @ts-expect-error unknown is not a route
    router.href('unknown');
  });
});

describe('Router get', () => {
  test('narrows the route to the table keys', () => {
    expectTypeOf(router.get()?.route).toEqualTypeOf<'security' | 'statement' | 'plan' | undefined>();
  });
});

describe('Router go', () => {
  test('requires params for a route with a required param', () => {
    // @ts-expect-error statementId is required
    void router.go('statement');
    expectTypeOf(router.go('statement', { statementId: 'st_1' }, { replace: true })).toEqualTypeOf<Promise<void>>();
    expectTypeOf(router.go('security')).toEqualTypeOf<Promise<void>>();
  });
});
