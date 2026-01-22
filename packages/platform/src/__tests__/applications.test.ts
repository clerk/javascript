import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformHttpClient } from '../client';
import { ApplicationsAPI } from '../resources/applications';
import type { ApplicationResponse, DeletedObjectResponse } from '../types';

describe('ApplicationsAPI', () => {
  const mockFetch = vi.fn();
  let client: PlatformHttpClient;
  let api: ApplicationsAPI;

  beforeEach(() => {
    vi.resetAllMocks();
    client = new PlatformHttpClient({
      accessToken: 'test_token',
      fetch: mockFetch,
    });
    api = new ApplicationsAPI(client);
  });

  const mockSuccessResponse = (data: unknown) => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  };

  describe('list', () => {
    const mockApplications: ApplicationResponse[] = [
      {
        application_id: 'app_1',
        instances: [
          {
            instance_id: 'ins_1',
            environment_type: 'development',
            publishable_key: 'pk_test_123',
          },
        ],
      },
    ];

    it('should list applications', async () => {
      mockSuccessResponse(mockApplications);

      const result = await api.list();

      expect(result).toEqual(mockApplications);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications'),
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('should include secret keys when requested', async () => {
      mockSuccessResponse(mockApplications);

      await api.list({ includeSecretKeys: true });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('include_secret_keys=true');
    });
  });

  describe('create', () => {
    const mockApplication: ApplicationResponse = {
      application_id: 'app_new',
      instances: [],
    };

    it('should create an application', async () => {
      mockSuccessResponse(mockApplication);

      const result = await api.create({ name: 'Test App' });

      expect(result).toEqual(mockApplication);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test App' }),
        }),
      );
    });

    it('should create an application with all options', async () => {
      mockSuccessResponse(mockApplication);

      await api.create({
        name: 'Test App',
        domain: 'example.com',
        proxy_path: '/__clerk',
        environment_types: ['development', 'production'],
        template: 'b2b-saas',
      });

      const calledOptions = mockFetch.mock.calls[0][1];
      const body = JSON.parse(calledOptions.body);
      expect(body).toEqual({
        name: 'Test App',
        domain: 'example.com',
        proxy_path: '/__clerk',
        environment_types: ['development', 'production'],
        template: 'b2b-saas',
      });
    });
  });

  describe('get', () => {
    const mockApplication: ApplicationResponse = {
      application_id: 'app_123',
      instances: [
        {
          instance_id: 'ins_1',
          environment_type: 'production',
          publishable_key: 'pk_live_123',
        },
      ],
    };

    it('should get an application by ID', async () => {
      mockSuccessResponse(mockApplication);

      const result = await api.get('app_123');

      expect(result).toEqual(mockApplication);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123'),
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('should include secret keys when requested', async () => {
      mockSuccessResponse(mockApplication);

      await api.get('app_123', { includeSecretKeys: true });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('include_secret_keys=true');
    });

    it('should encode application ID in URL', async () => {
      mockSuccessResponse(mockApplication);

      await api.get('app/with/slashes');

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain(encodeURIComponent('app/with/slashes'));
    });
  });

  describe('update', () => {
    const mockApplication: ApplicationResponse = {
      application_id: 'app_123',
      instances: [],
    };

    it('should update an application', async () => {
      mockSuccessResponse(mockApplication);

      const result = await api.update('app_123', { name: 'Updated Name' });

      expect(result).toEqual(mockApplication);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated Name' }),
        }),
      );
    });
  });

  describe('delete', () => {
    const mockDeleteResponse: DeletedObjectResponse = {
      deleted: true,
      object: 'deleted',
      id: 'app_123',
    };

    it('should delete an application', async () => {
      mockSuccessResponse(mockDeleteResponse);

      const result = await api.delete('app_123');

      expect(result).toEqual(mockDeleteResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });
});
