import { headers } from 'next/headers';
import type { MockedFunction } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { collectKeylessMetadata, formatMetadataHeaders } from '../server/keyless-custom-headers';

const CI_ENV_VARS = [
  'CI',
  'CONTINUOUS_INTEGRATION',
  'BUILD_NUMBER',
  'BUILD_ID',
  'BUILDKITE',
  'CIRCLECI',
  'GITHUB_ACTIONS',
  'GITLAB_CI',
  'JENKINS_URL',
  'TRAVIS',
  'APPVEYOR',
  'WERCKER',
  'DRONE',
  'CODESHIP',
  'SEMAPHORE',
  'SHIPPABLE',
  'TEAMCITY_VERSION',
  'BAMBOO_BUILDKEY',
  'GO_PIPELINE_NAME',
  'TF_BUILD',
  'SYSTEM_TEAMFOUNDATIONCOLLECTIONURI',
  'BITBUCKET_BUILD_NUMBER',
  'HEROKU_TEST_RUN_ID',
  'VERCEL',
  'NETLIFY',
];
// Helper function to clear all CI environment variables
function clearAllCIEnvironmentVariables(): void {
  CI_ENV_VARS.forEach(indicator => {
    vi.stubEnv(indicator, undefined);
  });
}

// Default mock headers for keyless-custom-headers.ts
const defaultMockHeaders = new Headers({
  'User-Agent': 'Mozilla/5.0 (Test Browser)',
  host: 'test-host.example.com',
  'x-forwarded-port': '3000',
  'x-forwarded-host': 'forwarded-test-host.example.com',
  'x-forwarded-proto': 'https',
  'x-clerk-auth-status': 'signed-out',
});

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((name: string) => {
      // Return mock values for headers used in keyless-custom-headers.ts
      return defaultMockHeaders.get(name);
    }),
    has: vi.fn((name: string) => {
      return defaultMockHeaders.has(name);
    }),
    forEach: vi.fn((callback: (value: string, key: string) => void) => {
      defaultMockHeaders.forEach(callback);
    }),
    entries: function* () {
      const entries: [string, string][] = [];
      defaultMockHeaders.forEach((value, key) => entries.push([key, value]));
      for (const entry of entries) {
        yield entry;
      }
    },
    keys: function* () {
      const keys: string[] = [];
      defaultMockHeaders.forEach((_, key) => keys.push(key));
      for (const key of keys) {
        yield key;
      }
    },
    values: function* () {
      const values: string[] = [];
      defaultMockHeaders.forEach(value => values.push(value));
      for (const value of values) {
        yield value;
      }
    },
  })),
}));

type MockHeadersFn = () => MockHeaders | Promise<MockHeaders>;
const mockHeaders = headers as unknown as MockedFunction<MockHeadersFn>;

// Type for mocking Next.js headers
interface MockHeaders {
  get(key: string): string | null;
  has(key: string): boolean;
  forEach(callback: (value: string, key: string) => void): void;
  entries(): IterableIterator<[string, string]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
}

// Helper function to create custom header mocks for specific tests
function createMockHeaders(customHeaders: Record<string, string | null> = {}): MockHeaders {
  const defaultHeadersObj: Record<string, string> = {};
  defaultMockHeaders.forEach((value, key) => {
    defaultHeadersObj[key] = value;
  });
  const allHeaders = { ...defaultHeadersObj, ...customHeaders };

  return {
    get: vi.fn((name: string) => {
      // Use the defaultMockHeaders.get() method for consistent behavior
      const defaultValue = defaultMockHeaders.get(name);
      const customValue = customHeaders[name];
      return customValue !== undefined ? customValue : defaultValue;
    }),
    has: vi.fn((name: string) => {
      const hasDefault = defaultMockHeaders.has(name);
      const hasCustom = Object.prototype.hasOwnProperty.call(customHeaders, name);
      return hasDefault || (hasCustom && customHeaders[name] !== null);
    }),
    forEach: vi.fn((callback: (value: string, key: string) => void) => {
      Object.entries(allHeaders).forEach(([key, value]) => {
        if (value !== null) {
          callback(value, key);
        }
      });
    }),
    entries: vi.fn(() => {
      const validEntries: [string, string][] = Object.entries(allHeaders).filter(([, value]) => value !== null) as [
        string,
        string,
      ][];
      return validEntries[Symbol.iterator]();
    }),
    keys: vi.fn(() => {
      const validKeys = Object.keys(allHeaders).filter(key => allHeaders[key] !== null);
      return validKeys[Symbol.iterator]();
    }),
    values: vi.fn(() => {
      const validValues = Object.values(allHeaders).filter(value => value !== null);
      return validValues[Symbol.iterator]();
    }),
  };
}

describe('keyless-custom-headers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockImplementation(async () => createMockHeaders());

    // Stub all environment variables that collectKeylessMetadata might access
    vi.stubEnv('npm_config_user_agent', undefined);
    vi.stubEnv('PORT', undefined);
    // Clear all CI environment variables
    clearAllCIEnvironmentVariables();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Don't use vi.unstubAllEnvs() as it restores real environment variables
    // Instead, explicitly stub all environment variables to undefined
    vi.stubEnv('npm_config_user_agent', undefined);
    vi.stubEnv('PORT', undefined);
    clearAllCIEnvironmentVariables();
    mockHeaders.mockReset();
  });

  describe('formatMetadataHeaders', () => {
    it('should format complete metadata object with all fields present', async () => {
      const metadata = {
        nodeVersion: 'v18.17.0',
        nextVersion: 'next-server (v15.4.5)',
        npmConfigUserAgent: 'npm/9.8.1 node/v18.17.0 darwin x64 workspaces/false',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        port: '3000',
        host: 'localhost:3000',
        xHost: 'example.com',
        xPort: '3000',
        xProtocol: 'https',
        xClerkAuthStatus: 'signed-out',
        isCI: false,
      };

      const result = await formatMetadataHeaders(metadata);

      // Test exact header casing and values
      expect(result.get('Clerk-Node-Version')).toBe('v18.17.0');
      expect(result.get('Clerk-Next-Version')).toBe('next-server (v15.4.5)');
      expect(result.get('Clerk-NPM-Config-User-Agent')).toBe('npm/9.8.1 node/v18.17.0 darwin x64 workspaces/false');
      expect(result.get('Clerk-Client-User-Agent')).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
      expect(result.get('Clerk-Node-Port')).toBe('3000');
      expect(result.get('Clerk-Client-Host')).toBe('localhost:3000');
      expect(result.get('Clerk-X-Host')).toBe('example.com');
      expect(result.get('Clerk-X-Port')).toBe('3000');
      expect(result.get('Clerk-X-Protocol')).toBe('https');
      expect(result.get('Clerk-Auth-Status')).toBe('signed-out');
    });

    it('should handle missing optional fields gracefully', async () => {
      const metadata = {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        host: 'localhost:3000',
        xHost: 'example.com',
        xPort: '3000',
        xProtocol: 'https',
        xClerkAuthStatus: 'signed-out',
        isCI: false,
        // Missing: nodeVersion, nextVersion, npmConfigUserAgent, port
      };

      const result = await formatMetadataHeaders(metadata);

      // Test that only present fields are set
      expect(result.get('Clerk-Client-User-Agent')).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
      expect(result.get('Clerk-Client-Host')).toBe('localhost:3000');
      expect(result.get('Clerk-X-Host')).toBe('example.com');
      expect(result.get('Clerk-X-Port')).toBe('3000');
      expect(result.get('Clerk-X-Protocol')).toBe('https');
      expect(result.get('Clerk-Auth-Status')).toBe('signed-out');

      // Test that missing fields are not set
      expect(result.get('Clerk-Node-Version')).toBeNull();
      expect(result.get('Clerk-Next-Version')).toBeNull();
      expect(result.get('Clerk-NPM-Config-User-Agent')).toBeNull();
      expect(result.get('Clerk-Node-Port')).toBeNull();
    });

    it('should handle undefined values for optional fields', async () => {
      const metadata = {
        nodeVersion: undefined,
        nextVersion: undefined,
        npmConfigUserAgent: undefined,
        userAgent: 'test-user-agent',
        port: undefined,
        host: 'test-host',
        xHost: 'test-x-host',
        xPort: 'test-x-port',
        xProtocol: 'test-x-protocol',
        xClerkAuthStatus: 'test-auth-status',
        isCI: false,
      };

      const result = await formatMetadataHeaders(metadata);

      // Test that undefined fields are not set
      expect(result.get('Clerk-Node-Version')).toBeNull();
      expect(result.get('Clerk-Next-Version')).toBeNull();
      expect(result.get('Clerk-NPM-Config-User-Agent')).toBeNull();
      expect(result.get('Clerk-Node-Port')).toBeNull();

      // Test that defined fields are set
      expect(result.get('Clerk-Client-User-Agent')).toBe('test-user-agent');
      expect(result.get('Clerk-Client-Host')).toBe('test-host');
      expect(result.get('Clerk-X-Host')).toBe('test-x-host');
      expect(result.get('Clerk-X-Port')).toBe('test-x-port');
      expect(result.get('Clerk-X-Protocol')).toBe('test-x-protocol');
      expect(result.get('Clerk-Auth-Status')).toBe('test-auth-status');
    });

    it('should handle empty string values', async () => {
      const metadata = {
        nodeVersion: '',
        nextVersion: '',
        npmConfigUserAgent: '',
        userAgent: '',
        port: '',
        host: '',
        xHost: '',
        xPort: '',
        xProtocol: '',
        xClerkAuthStatus: '',
        isCI: false,
      };

      const result = await formatMetadataHeaders(metadata);

      // Empty strings should not be set as headers
      expect(result.get('Clerk-Node-Version')).toBeNull();
      expect(result.get('Clerk-Next-Version')).toBeNull();
      expect(result.get('Clerk-NPM-Config-User-Agent')).toBeNull();
      expect(result.get('Clerk-Client-User-Agent')).toBeNull();
      expect(result.get('Clerk-Node-Port')).toBeNull();
      expect(result.get('Clerk-Client-Host')).toBeNull();
      expect(result.get('Clerk-X-Host')).toBeNull();
      expect(result.get('Clerk-X-Port')).toBeNull();
      expect(result.get('Clerk-X-Protocol')).toBeNull();
      expect(result.get('Clerk-Auth-Status')).toBeNull();
    });
  });

  describe('collectKeylessMetadata', () => {
    it('should use default mock headers when no custom headers are specified', async () => {
      // Setup environment variables
      vi.stubEnv('PORT', '3000');
      vi.stubEnv('npm_config_user_agent', 'npm/9.8.1 node/v18.17.0 darwin x64');

      // Mock process.version and process.title
      const originalVersion = process.version;
      const originalTitle = process.title;
      Object.defineProperty(process, 'version', { value: 'v18.17.0', configurable: true });
      Object.defineProperty(process, 'title', { value: 'next-server (v15.4.5)', configurable: true });

      const result = await collectKeylessMetadata();

      // Should use the default mock headers
      expect(result.userAgent).toBe('Mozilla/5.0 (Test Browser)');
      expect(result.host).toBe('test-host.example.com');
      expect(result.xPort).toBe('3000');
      expect(result.xHost).toBe('forwarded-test-host.example.com');
      expect(result.xProtocol).toBe('https');
      expect(result.xClerkAuthStatus).toBe('signed-out');

      // Should use environment variables and process info
      expect(result.nodeVersion).toBe('v18.17.0');
      expect(result.nextVersion).toBe('next-server (v15.4.5)');
      expect(result.npmConfigUserAgent).toBe('npm/9.8.1 node/v18.17.0 darwin x64');
      expect(result.port).toBe('3000');

      // Restore original values
      Object.defineProperty(process, 'version', { value: originalVersion, configurable: true });
      Object.defineProperty(process, 'title', { value: originalTitle, configurable: true });
    });

    it('should collect metadata with all fields present', async () => {
      // Setup environment variables
      vi.stubEnv('PORT', '3000');
      vi.stubEnv('npm_config_user_agent', 'npm/9.8.1 node/v18.17.0 darwin x64');

      // Mock process.version and process.title
      const originalVersion = process.version;
      const originalTitle = process.title;
      Object.defineProperty(process, 'version', { value: 'v18.17.0', configurable: true });
      Object.defineProperty(process, 'title', { value: 'next-server (v15.4.5)', configurable: true });

      // Mock headers
      const mockHeaderStore = new Headers({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        host: 'localhost:3000',
        'x-forwarded-port': '3000',
        'x-forwarded-host': 'example.com',
        'x-forwarded-proto': 'https',
        'x-clerk-auth-status': 'signed-out',
      });

      mockHeaders.mockResolvedValue({
        get: (key: string) => mockHeaderStore.get(key) || null,
        has: (key: string) => mockHeaderStore.has(key),
        forEach: () => {},
        entries: function* () {
          const headerEntries: [string, string][] = [];
          mockHeaderStore.forEach((value, key) => headerEntries.push([key, value]));
          for (const entry of headerEntries) {
            yield entry;
          }
        },
        keys: function* () {
          const headerKeys: string[] = [];
          mockHeaderStore.forEach((_, key) => headerKeys.push(key));
          for (const key of headerKeys) {
            yield key;
          }
        },
        values: function* () {
          const headerValues: string[] = [];
          mockHeaderStore.forEach(value => headerValues.push(value));
          for (const value of headerValues) {
            yield value;
          }
        },
      } as MockHeaders);

      const result = await collectKeylessMetadata();

      expect(result).toEqual({
        nodeVersion: 'v18.17.0',
        nextVersion: 'next-server (v15.4.5)',
        npmConfigUserAgent: 'npm/9.8.1 node/v18.17.0 darwin x64',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        port: '3000',
        host: 'localhost:3000',
        xPort: '3000',
        xHost: 'example.com',
        xProtocol: 'https',
        xClerkAuthStatus: 'signed-out',
        isCI: false,
      });

      // Restore original values
      Object.defineProperty(process, 'version', { value: originalVersion, configurable: true });
      Object.defineProperty(process, 'title', { value: originalTitle, configurable: true });
    });

    it('should use fallback values when headers are missing', async () => {
      // Clear environment variables
      vi.stubEnv('PORT', undefined);
      vi.stubEnv('npm_config_user_agent', undefined);

      // Mock empty headers using createMockHeaders helper with all null values
      mockHeaders.mockResolvedValue(
        createMockHeaders({
          'User-Agent': null,
          host: null,
          'x-forwarded-port': null,
          'x-forwarded-host': null,
          'x-forwarded-proto': null,
          'x-clerk-auth-status': null,
        }),
      );

      const result = await collectKeylessMetadata();

      expect(result.userAgent).toBe('unknown user-agent');
      expect(result.host).toBe('unknown host');
      expect(result.xPort).toBe('unknown x-forwarded-port');
      expect(result.xHost).toBe('unknown x-forwarded-host');
      expect(result.xProtocol).toBe('unknown x-forwarded-proto');
      expect(result.xClerkAuthStatus).toBe('unknown x-clerk-auth-status');
      expect(result.port).toBeUndefined();
      expect(result.npmConfigUserAgent).toBeUndefined();
    });

    it('should handle process.title extraction errors gracefully', async () => {
      // Mock process.title to throw an error
      const originalTitle = process.title;
      Object.defineProperty(process, 'title', {
        get: () => {
          throw new Error('Process title access error');
        },
        configurable: true,
      });

      mockHeaders.mockResolvedValue({
        get: () => null,
        has: () => false,
        forEach: () => {},
        entries: function* () {},
        keys: function* () {},
        values: function* () {},
      } as MockHeaders);

      const result = await collectKeylessMetadata();

      expect(result.nextVersion).toBeUndefined();

      // Restore original value
      Object.defineProperty(process, 'title', { value: originalTitle, configurable: true });
    });

    it('should demonstrate partial header overrides with createMockHeaders', async () => {
      // Only override specific headers, keeping defaults for others
      mockHeaders.mockResolvedValue(
        createMockHeaders({
          'User-Agent': 'Partial-Override-Agent/2.0',
          'x-clerk-auth-status': 'signed-out',
          // Other headers will use default values from defaultMockHeaders
        }),
      );

      const result = await collectKeylessMetadata();

      // Overridden headers
      expect(result.userAgent).toBe('Partial-Override-Agent/2.0');
      expect(result.xClerkAuthStatus).toBe('signed-out');

      // Default headers (unchanged)
      expect(result.host).toBe('test-host.example.com');
      expect(result.xPort).toBe('3000');
      expect(result.xHost).toBe('forwarded-test-host.example.com');
      expect(result.xProtocol).toBe('https');
    });
  });

  it('should format metadata collected from collectKeylessMetadata correctly', async () => {
    // Setup environment
    vi.stubEnv('PORT', '4000');
    vi.stubEnv('npm_config_user_agent', 'test-npm-agent');

    const mockHeaderStore = new Headers({
      'User-Agent': 'Integration-Test-Agent',
      host: 'localhost:4000',
      'x-forwarded-port': '4000',
      'x-forwarded-host': 'integration-forwarded-host',
      'x-forwarded-proto': 'https',
      'x-clerk-auth-status': 'integration-status',
    });

    mockHeaders.mockResolvedValue({
      get: (key: string) => mockHeaderStore.get(key) || null,
      has: (key: string) => mockHeaderStore.has(key),
      forEach: () => {},
      entries: function* () {
        const headerEntries: [string, string][] = [];
        mockHeaderStore.forEach((value, key) => headerEntries.push([key, value]));
        for (const entry of headerEntries) {
          yield entry;
        }
      },
      keys: function* () {
        const headerKeys: string[] = [];
        mockHeaderStore.forEach((_, key) => headerKeys.push(key));
        for (const key of headerKeys) {
          yield key;
        }
      },
      values: function* () {
        const headerValues: string[] = [];
        mockHeaderStore.forEach(value => headerValues.push(value));
        for (const value of headerValues) {
          yield value;
        }
      },
    } as MockHeaders);

    // Collect metadata and format headers
    const metadata = await collectKeylessMetadata();
    const headers = await formatMetadataHeaders(metadata);

    // Verify the full pipeline works correctly
    expect(headers.get('Clerk-Client-User-Agent')).toBe('Integration-Test-Agent');
    expect(headers.get('Clerk-Client-Host')).toBe('localhost:4000');
    expect(headers.get('Clerk-Node-Port')).toBe('4000');
    expect(headers.get('Clerk-X-Port')).toBe('4000');
    expect(headers.get('Clerk-X-Host')).toBe('integration-forwarded-host');
    expect(headers.get('Clerk-X-Protocol')).toBe('https');
    expect(headers.get('Clerk-Auth-Status')).toBe('integration-status');
    expect(headers.get('Clerk-NPM-Config-User-Agent')).toBe('test-npm-agent');
  });
});
