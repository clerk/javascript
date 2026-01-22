import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformHttpClient } from '../client';
import { ApplicationTransfersAPI } from '../resources/transfers';
import type { ApplicationTransferResponse, ListApplicationTransfersResponse } from '../types';

describe('ApplicationTransfersAPI', () => {
  const mockFetch = vi.fn();
  let client: PlatformHttpClient;
  let api: ApplicationTransfersAPI;

  beforeEach(() => {
    vi.resetAllMocks();
    client = new PlatformHttpClient({
      accessToken: 'test_token',
      fetch: mockFetch,
    });
    api = new ApplicationTransfersAPI(client);
  });

  const mockSuccessResponse = (data: unknown) => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  };

  describe('list', () => {
    const mockTransfers: ListApplicationTransfersResponse = {
      data: [
        {
          object: 'application_transfer',
          id: 'appxfr_1',
          code: '550e8400-e29b-41d4-a716-446655440000',
          application_id: 'app_123',
          status: 'pending',
          expires_at: '2024-01-16T12:00:00Z',
          created_at: '2024-01-15T12:00:00Z',
          canceled_at: null,
          completed_at: null,
        },
      ],
      total_count: 1,
    };

    it('should list transfers', async () => {
      mockSuccessResponse(mockTransfers);

      const result = await api.list();

      expect(result).toEqual(mockTransfers);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/application_transfers'),
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('should filter by single status', async () => {
      mockSuccessResponse(mockTransfers);

      await api.list({ status: 'pending' });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('status=pending');
    });

    it('should filter by multiple statuses', async () => {
      mockSuccessResponse(mockTransfers);

      await api.list({ status: ['pending', 'completed'] });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('status=pending');
      expect(calledUrl).toContain('status=completed');
    });

    it('should handle pagination parameters', async () => {
      mockSuccessResponse(mockTransfers);

      await api.list({
        limit: 50,
        starting_after: 'appxfr_last',
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('limit=50');
      expect(calledUrl).toContain('starting_after=appxfr_last');
    });

    it('should handle ending_before pagination', async () => {
      mockSuccessResponse(mockTransfers);

      await api.list({ ending_before: 'appxfr_first' });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('ending_before=appxfr_first');
    });
  });

  describe('create', () => {
    const mockTransfer: ApplicationTransferResponse = {
      object: 'application_transfer',
      id: 'appxfr_new',
      code: '550e8400-e29b-41d4-a716-446655440001',
      application_id: 'app_123',
      status: 'pending',
      expires_at: '2024-01-16T12:00:00Z',
      created_at: '2024-01-15T12:00:00Z',
      canceled_at: null,
      completed_at: null,
    };

    it('should create a transfer', async () => {
      mockSuccessResponse(mockTransfer);

      const result = await api.create('app_123');

      expect(result).toEqual(mockTransfer);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123/transfers'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('get', () => {
    const mockTransfer: ApplicationTransferResponse = {
      object: 'application_transfer',
      id: 'appxfr_123',
      code: '550e8400-e29b-41d4-a716-446655440002',
      application_id: 'app_123',
      status: 'pending',
      expires_at: '2024-01-16T12:00:00Z',
      created_at: '2024-01-15T12:00:00Z',
      canceled_at: null,
      completed_at: null,
    };

    it('should get a transfer by ID', async () => {
      mockSuccessResponse(mockTransfer);

      const result = await api.get('app_123', 'appxfr_123');

      expect(result).toEqual(mockTransfer);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123/transfers/appxfr_123'),
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('cancel', () => {
    const mockCanceledTransfer: ApplicationTransferResponse = {
      object: 'application_transfer',
      id: 'appxfr_123',
      code: '550e8400-e29b-41d4-a716-446655440003',
      application_id: 'app_123',
      status: 'canceled',
      expires_at: '2024-01-16T12:00:00Z',
      created_at: '2024-01-15T12:00:00Z',
      canceled_at: '2024-01-15T14:00:00Z',
      completed_at: null,
    };

    it('should cancel a transfer', async () => {
      mockSuccessResponse(mockCanceledTransfer);

      const result = await api.cancel('app_123', 'appxfr_123');

      expect(result).toEqual(mockCanceledTransfer);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/applications/app_123/transfers/appxfr_123'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });
});
