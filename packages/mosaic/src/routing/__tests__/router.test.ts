import { logger } from '@clerk/shared/logger';
import { describe, expect, it, vi } from 'vitest';

import type { MosaicLocation, SegmentParts } from '../location';
import { createRouter } from '../router';

const routes = {
  account: 'account',
  security: 'security',
  statement: 'billing/statement/:statementId',
} as const;

function memoryLocation(initial: SegmentParts = []): MosaicLocation & { current: SegmentParts } {
  const location = {
    current: initial,
    useSegmentParts: () => location.current,
    write: (parts: SegmentParts) => {
      location.current = parts;
    },
    clear: () => {
      location.current = [];
    },
    own: () => () => {},
  };
  return location;
}

describe('createRouter parse', () => {
  const router = createRouter(routes, memoryLocation());

  it('derives the route from parts', () => {
    expect(router.parse(['security'])).toEqual({ name: 'security', params: {} });
  });

  it('captures params', () => {
    expect(router.parse(['billing', 'statement', 'st_1'])).toEqual({
      name: 'statement',
      params: { statementId: 'st_1' },
    });
  });

  it('has no route when the parts match nothing', () => {
    expect(router.parse(['nowhere'])).toBeUndefined();
  });
});

describe('createRouter go', () => {
  it('writes the built parts to the location, verbatim', () => {
    const location = memoryLocation(['account']);
    const router = createRouter(routes, location);

    router.go('statement', { statementId: 'st 1' });
    expect(location.current).toEqual(['billing', 'statement', 'st 1']);
  });

  it('ignores an unknown route name and warns', () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const location = memoryLocation(['account']);
    const router = createRouter(routes as Record<string, string>, location);

    router.go('nowhere');

    expect(location.current).toEqual(['account']);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('passes write options through', () => {
    const location = memoryLocation(['account']);
    const write = vi.spyOn(location, 'write');
    const router = createRouter(routes, location);

    router.go('security', {}, { replace: true });
    expect(write).toHaveBeenCalledWith(['security'], { replace: true });
  });
});
