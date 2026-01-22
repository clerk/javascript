import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformHttpClient } from '../client';
import { DomainsAPI } from '../resources/domains';
import type {
  DeletedObjectResponse,
  DNSCheckResponse,
  DomainResponse,
  DomainStatusResponse,
  ListApplicationDomainsResponse,
} from '../types';

describe('DomainsAPI', () => {
  const mockFetch = vi.fn();
  let client: PlatformHttpClient;
  let api: DomainsAPI;

  beforeEach(() => {
    vi.resetAllMocks();
    client = new PlatformHttpClient({
      accessToken: 'test_token',
      fetch: mockFetch,
    });
    api = new DomainsAPI(client);
  });

  const mockSuccessResponse = (data: unknown) => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  };

  describe('list', () => {
    const mockDomains: ListApplicationDomainsResponse = {
      data: [
        {
          object: 'domain',
          id: 'dmn_1',
          name: 'example.com',
          frontend_api_url: 'https://clerk.example.com',
          development_origin: '',
          accounts_portal_url: 'https://accounts.example.com',
          cname_targets: [],
        },
      ],
      total_count: 1,
    };

    it('should list domains for an application', async () => {
      mockSuccessResponse(mockDomains);

      const result = await api.list('app_123');

      expect(result).toEqual(mockDomains);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123/domains'),
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('create', () => {
    const mockDomain: DomainResponse = {
      object: 'domain',
      id: 'dmn_new',
      name: 'auth.example.com',
      frontend_api_url: 'https://clerk.auth.example.com',
      development_origin: '',
      accounts_portal_url: 'https://accounts.auth.example.com',
      cname_targets: [],
    };

    it('should create a domain', async () => {
      mockSuccessResponse(mockDomain);

      const result = await api.create('app_123', { name: 'auth.example.com' });

      expect(result).toEqual(mockDomain);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123/domains'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'auth.example.com' }),
        }),
      );
    });

    it('should create a domain with proxy path', async () => {
      mockSuccessResponse(mockDomain);

      await api.create('app_123', {
        name: 'auth.example.com',
        proxy_path: '/__clerk',
      });

      const calledOptions = mockFetch.mock.calls[0][1];
      const body = JSON.parse(calledOptions.body);
      expect(body.proxy_path).toBe('/__clerk');
    });
  });

  describe('get', () => {
    const mockDomain: DomainResponse = {
      object: 'domain',
      id: 'dmn_123',
      name: 'example.com',
      frontend_api_url: 'https://clerk.example.com',
      development_origin: '',
      accounts_portal_url: 'https://accounts.example.com',
      cname_targets: [],
    };

    it('should get a domain by ID', async () => {
      mockSuccessResponse(mockDomain);

      const result = await api.get('app_123', 'dmn_123');

      expect(result).toEqual(mockDomain);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123/domains/dmn_123'),
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('should get a domain by name', async () => {
      mockSuccessResponse(mockDomain);

      await api.get('app_123', 'example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123/domains/example.com'),
        expect.any(Object),
      );
    });
  });

  describe('delete', () => {
    const mockDeleteResponse: DeletedObjectResponse = {
      deleted: true,
      object: 'deleted',
      id: 'dmn_123',
    };

    it('should delete a domain', async () => {
      mockSuccessResponse(mockDeleteResponse);

      const result = await api.delete('app_123', 'dmn_123');

      expect(result).toEqual(mockDeleteResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123/domains/dmn_123'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('update', () => {
    const mockDomain: DomainResponse = {
      object: 'domain',
      id: 'dmn_123',
      name: 'newdomain.com',
      frontend_api_url: 'https://clerk.newdomain.com',
      development_origin: '',
      accounts_portal_url: 'https://accounts.newdomain.com',
      cname_targets: [],
    };

    it('should update a domain', async () => {
      mockSuccessResponse(mockDomain);

      const result = await api.update('app_123', { name: 'newdomain.com' });

      expect(result).toEqual(mockDomain);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123/domain'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'newdomain.com' }),
        }),
      );
    });
  });

  describe('getStatus', () => {
    const mockStatus: DomainStatusResponse = {
      dns: {
        status: 'complete',
        cnames: {
          accounts: {
            clerk_subdomain: 'accounts',
            from: 'accounts.example.com',
            to: 'clerk.accounts.example.com',
            verified: true,
            required: true,
            failure_hints: null,
          },
        },
      },
      ssl: {
        status: 'complete',
      },
      status: 'complete',
    };

    it('should get domain status', async () => {
      mockSuccessResponse(mockStatus);

      const result = await api.getStatus('app_123', 'dmn_123');

      expect(result).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123/domains/dmn_123/status'),
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('triggerDNSCheck', () => {
    const mockDNSCheckResponse: DNSCheckResponse = {
      domain_id: 'dmn_123',
      last_run_at: 1234567890000,
      dns: {
        status: 'in_progress',
        cnames: {},
      },
      ssl: {
        status: 'not_started',
      },
      status: 'incomplete',
    };

    it('should trigger DNS check', async () => {
      mockSuccessResponse(mockDNSCheckResponse);

      const result = await api.triggerDNSCheck('app_123', 'dmn_123');

      expect(result).toEqual(mockDNSCheckResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123/domains/dmn_123/dns_check'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
