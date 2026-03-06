import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../Components', () => ({
  mountComponentRenderer: vi.fn(() => ({
    ensureMounted: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('@clerk/shared/logger', () => ({
  logger: {
    warnOnce: vi.fn(),
  },
}));

import { ClerkRuntimeError } from '@clerk/shared/error';
import { logger } from '@clerk/shared/logger';
import type { Clerk, ClerkOptions } from '@clerk/shared/types';

import { ClerkUI } from '../ClerkUI';
import { MIN_CLERK_JS_VERSION } from '../constants';

describe('ClerkUI version check', () => {
  const mockModuleManager = { load: vi.fn(), unload: vi.fn(), isLoaded: vi.fn() };
  const mockOptions: ClerkOptions = {};
  const getEnvironment = () => null;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('compatible versions', () => {
    test(`accepts exact minimum version (${MIN_CLERK_JS_VERSION})`, () => {
      const getClerk = () => ({ version: MIN_CLERK_JS_VERSION, instanceType: 'production' }) as Clerk;

      expect(() => {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
      }).not.toThrow();
    });

    test('accepts versions above minimum (6.5.0)', () => {
      const getClerk = () => ({ version: '6.5.0', instanceType: 'production' }) as Clerk;

      expect(() => {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
      }).not.toThrow();
    });

    test('accepts pre-release at minimum version (6.0.0-canary)', () => {
      const getClerk = () => ({ version: '6.0.0-canary.123', instanceType: 'production' }) as Clerk;

      expect(() => {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
      }).not.toThrow();
    });

    test('accepts pre-release above minimum (6.1.0-snapshot)', () => {
      const getClerk = () => ({ version: '6.1.0-snapshot.456', instanceType: 'production' }) as Clerk;

      expect(() => {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
      }).not.toThrow();
    });
  });

  describe('outdated versions in development', () => {
    test('throws ClerkRuntimeError to fail fast', () => {
      const getClerk = () => ({ version: '5.0.0', instanceType: 'development' }) as Clerk;

      expect(() => {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
      }).toThrow(ClerkRuntimeError);
    });

    test('includes clerk_ui_version_mismatch error code', () => {
      const getClerk = () => ({ version: '5.0.0', instanceType: 'development' }) as Clerk;

      try {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ClerkRuntimeError);
        expect((error as ClerkRuntimeError).code).toBe('clerk_ui_version_mismatch');
      }
    });

    test('error mentions @clerk/ui version', () => {
      const getClerk = () => ({ version: '5.0.0', instanceType: 'development' }) as Clerk;

      try {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('@clerk/ui@');
      }
    });

    test('error mentions detected clerk-js version', () => {
      const getClerk = () => ({ version: '5.0.0', instanceType: 'development' }) as Clerk;

      try {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('@clerk/clerk-js@5.0.0');
      }
    });

    test('error mentions minimum required version', () => {
      const getClerk = () => ({ version: '5.0.0', instanceType: 'development' }) as Clerk;

      try {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain(`>=${MIN_CLERK_JS_VERSION}`);
      }
    });

    test('error includes upgrade instructions', () => {
      const getClerk = () => ({ version: '5.0.0', instanceType: 'development' }) as Clerk;

      try {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('Please upgrade');
      }
    });

    test('throws for older major versions (4.x)', () => {
      const getClerk = () => ({ version: '4.999.999', instanceType: 'development' }) as Clerk;

      expect(() => {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
      }).toThrow(ClerkRuntimeError);
    });
  });

  describe('outdated versions in production', () => {
    test('warns instead of throwing to avoid outages', () => {
      const getClerk = () => ({ version: '5.0.0', instanceType: 'production' }) as Clerk;

      expect(() => {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
      }).not.toThrow();

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
      expect(logger.warnOnce).toHaveBeenCalledWith(expect.stringContaining('@clerk/ui@'));
    });

    test('warning includes version details', () => {
      const getClerk = () => ({ version: '5.0.0', instanceType: 'production' }) as Clerk;

      new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);

      expect(logger.warnOnce).toHaveBeenCalledWith(expect.stringContaining('@clerk/clerk-js@5.0.0'));
      expect(logger.warnOnce).toHaveBeenCalledWith(expect.stringContaining(`>=${MIN_CLERK_JS_VERSION}`));
    });
  });

  describe('unknown version handling', () => {
    test('trusts moduleManager for local dev builds (undefined version)', () => {
      const getClerk = () => ({ version: undefined, instanceType: 'production' }) as Clerk;

      expect(() => {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
      }).not.toThrow();
    });

    test('trusts moduleManager for builds with empty version string', () => {
      const getClerk = () => ({ version: '', instanceType: 'production' }) as Clerk;

      expect(() => {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
      }).not.toThrow();
    });

    test('trusts moduleManager for builds with unparseable version format', () => {
      const getClerk = () => ({ version: 'invalid', instanceType: 'production' }) as Clerk;

      expect(() => {
        new ClerkUI(getClerk, getEnvironment, mockOptions, mockModuleManager as any);
      }).not.toThrow();
    });

    test('throws for unknown version without moduleManager (development)', () => {
      const getClerk = () => ({ version: undefined, instanceType: 'development' }) as Clerk;

      expect(() => {
        new ClerkUI(getClerk, getEnvironment, mockOptions, null as any);
      }).toThrow(ClerkRuntimeError);
    });

    test('warns for unknown version without moduleManager (production)', () => {
      const getClerk = () => ({ version: undefined, instanceType: 'production' }) as Clerk;

      expect(() => {
        new ClerkUI(getClerk, getEnvironment, mockOptions, null as any);
      }).not.toThrow();

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });

    test('error for unknown version includes helpful message', () => {
      const getClerk = () => ({ version: undefined, instanceType: 'development' }) as Clerk;

      try {
        new ClerkUI(getClerk, getEnvironment, mockOptions, null as any);
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as ClerkRuntimeError).code).toBe('clerk_ui_version_mismatch');
        expect((error as Error).message).toContain('incompatible version');
      }
    });
  });
});
