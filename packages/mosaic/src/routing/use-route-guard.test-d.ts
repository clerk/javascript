import { describe, expectTypeOf, test } from 'vitest';

import type { MosaicLocation } from './location';
import { createRouter } from './router';
import type { useRouteGuard } from './use-route-guard';

type GuardedScope<Name extends string> = Parameters<typeof useRouteGuard<Name>>[0];

const location: MosaicLocation = { useSegmentParts: () => [], write: () => {}, clear: () => {}, own: () => () => {} };

describe('useRouteGuard', () => {
  test('guards a table whose routes take no params', () => {
    const { go } = createRouter({ start: '', verify: 'verify' }, location);
    expectTypeOf({ route: undefined, go }).toExtend<GuardedScope<'start' | 'verify'>>();
  });

  test('guards to a route without params in a table that has some', () => {
    const { go } = createRouter({ start: '', statement: 'statement/:statementId' }, location);
    expectTypeOf({ route: undefined, go }).toExtend<GuardedScope<'start'>>();
  });

  test('rejects guarding to a route that needs params', () => {
    const { go } = createRouter({ start: '', statement: 'statement/:statementId' }, location);
    expectTypeOf({ route: undefined, go }).not.toExtend<GuardedScope<'start' | 'statement'>>();
  });
});
