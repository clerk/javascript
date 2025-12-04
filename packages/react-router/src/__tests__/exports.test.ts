import { logger } from '@clerk/shared/logger';
import { vi } from 'vitest';

import * as publicExports from '../index';
import * as legacyExports from '../legacy';
import * as serverExports from '../server/index';

describe('root public exports', () => {
  it('should not change unexpectedly', () => {
    expect(Object.keys(publicExports).sort()).toMatchSnapshot();
  });
});

describe('server public exports', () => {
  it('should not change unexpectedly', () => {
    expect(Object.keys(serverExports).sort()).toMatchSnapshot();
  });
});

describe('deprecated ssr public exports', () => {
  it('should not change unexpectedly', async () => {
    const warnOnceSpy = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const ssrExports = await import('../ssr/index');
    expect(Object.keys(ssrExports).sort()).toMatchSnapshot();
    expect(warnOnceSpy).toHaveBeenCalled();
    warnOnceSpy.mockRestore();
  });
});

describe('legacy public exports', () => {
  it('should not change unexpectedly', () => {
    expect(Object.keys(legacyExports).sort()).toMatchSnapshot();
  });
});
