import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPlatformClient, PlatformHttpClient } from '../index';
import { ApplicationsAPI } from '../resources/applications';
import { DomainsAPI } from '../resources/domains';
import { ApplicationTransfersAPI } from '../resources/transfers';

describe('createPlatformClient', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create a client with all APIs', () => {
    const client = createPlatformClient({
      accessToken: 'test_token',
      fetch: mockFetch,
    });

    expect(client.applications).toBeInstanceOf(ApplicationsAPI);
    expect(client.domains).toBeInstanceOf(DomainsAPI);
    expect(client.transfers).toBeInstanceOf(ApplicationTransfersAPI);
  });

  it('should throw when access token is missing', () => {
    expect(() => createPlatformClient({ accessToken: '' })).toThrow('accessToken is required');
  });

  it('should use custom baseUrl', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve('[]'),
    });

    const client = createPlatformClient({
      accessToken: 'test_token',
      baseUrl: 'https://custom.api.com/v2',
      fetch: mockFetch,
    });

    void client.applications.list();

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('https://custom.api.com/v2'), expect.any(Object));
  });
});

describe('PlatformHttpClient', () => {
  it('should be exported for direct use', () => {
    expect(PlatformHttpClient).toBeDefined();
  });
});

describe('exports', () => {
  it('should export all expected items', async () => {
    const exports = await import('../index');

    // Client exports
    expect(exports.createPlatformClient).toBeDefined();
    expect(exports.PlatformHttpClient).toBeDefined();

    // API classes
    expect(exports.ApplicationsAPI).toBeDefined();
    expect(exports.DomainsAPI).toBeDefined();
    expect(exports.ApplicationTransfersAPI).toBeDefined();

    // Factory functions
    expect(exports.createApplicationsAPI).toBeDefined();
    expect(exports.createDomainsAPI).toBeDefined();
    expect(exports.createApplicationTransfersAPI).toBeDefined();

    // Error classes
    expect(exports.ClerkPlatformError).toBeDefined();
    expect(exports.BadRequestError).toBeDefined();
    expect(exports.AuthenticationError).toBeDefined();
    expect(exports.AuthorizationError).toBeDefined();
    expect(exports.NotFoundError).toBeDefined();
    expect(exports.ConflictError).toBeDefined();
    expect(exports.UnprocessableEntityError).toBeDefined();
    expect(exports.TimeoutError).toBeDefined();
  });
});
