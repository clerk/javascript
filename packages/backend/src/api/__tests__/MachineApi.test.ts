import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('MachineAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const machineId = 'machine_123';
  const otherMachineId = 'machine_456';

  const mockSecondMachine = {
    object: 'machine',
    id: otherMachineId,
    name: 'Second Machine',
    instance_id: 'inst_456',
    created_at: 1640995200,
    updated_at: 1640995200,
  };

  const mockMachine = {
    object: 'machine',
    id: machineId,
    name: 'Test Machine',
    instance_id: 'inst_123',
    created_at: 1640995200,
    updated_at: 1640995200,
    scoped_machines: [mockSecondMachine],
  };

  const mockMachineScope = {
    object: 'machine_scope',
    from_machine_id: machineId,
    to_machine_id: otherMachineId,
    created_at: 1640995200,
  };

  const mockMachineSecretKey = {
    secret: 'ak_test_...',
  };

  const mockPaginatedResponse = {
    data: [mockMachine],
    total_count: 1,
  };

  it('fetches a machine by ID', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/machines/${machineId}`,
        validateHeaders(() => {
          return HttpResponse.json(mockMachine);
        }),
      ),
    );

    const response = await apiClient.machines.get(machineId);

    expect(response.id).toBe(machineId);
    expect(response.name).toBe('Test Machine');
  });

  it('fetches machines list with query parameters', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/machines',
        validateHeaders(({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('limit')).toBe('10');
          expect(url.searchParams.get('offset')).toBe('5');
          expect(url.searchParams.get('query')).toBe('test');
          return HttpResponse.json(mockPaginatedResponse);
        }),
      ),
    );

    const response = await apiClient.machines.list({
      limit: 10,
      offset: 5,
      query: 'test',
    });

    expect(response.data).toHaveLength(1);
    expect(response.totalCount).toBe(1);
  });

  it('creates a machine with scoped machines', async () => {
    const createParams = {
      name: 'New Machine',
      scoped_machines: [otherMachineId],
      default_token_ttl: 7200,
    };

    server.use(
      http.post(
        'https://api.clerk.test/v1/machines',
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(createParams);
          return HttpResponse.json(mockMachine);
        }),
      ),
    );

    const response = await apiClient.machines.create(createParams);

    expect(response.id).toBe(machineId);
    expect(response.name).toBe('Test Machine');
    expect(response.scopedMachines).toHaveLength(1);
    expect(response.scopedMachines[0].id).toBe(otherMachineId);
    expect(response.scopedMachines[0].name).toBe('Second Machine');
  });

  it('updates a machine with partial parameters', async () => {
    const updateParams = {
      machineId,
      name: 'Updated Machine',
    };

    server.use(
      http.patch(
        `https://api.clerk.test/v1/machines/${machineId}`,
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ name: 'Updated Machine' });
          return HttpResponse.json({
            ...mockMachine,
            name: 'Updated Machine',
          });
        }),
      ),
    );

    const response = await apiClient.machines.update(updateParams);

    expect(response.id).toBe(machineId);
    expect(response.name).toBe('Updated Machine');
  });

  it('deletes a machine', async () => {
    server.use(
      http.delete(
        `https://api.clerk.test/v1/machines/${machineId}`,
        validateHeaders(() => {
          return HttpResponse.json(mockMachine);
        }),
      ),
    );

    const response = await apiClient.machines.delete(machineId);

    expect(response.id).toBe(machineId);
  });

  it('fetches machine secret key', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/machines/${machineId}/secret_key`,
        validateHeaders(() => {
          return HttpResponse.json(mockMachineSecretKey);
        }),
      ),
    );

    const response = await apiClient.machines.getSecretKey(machineId);

    expect(response.secret).toBe('ak_test_...');
  });

  it('creates a machine scope', async () => {
    server.use(
      http.post(
        `https://api.clerk.test/v1/machines/${machineId}/scopes`,
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ to_machine_id: otherMachineId });
          return HttpResponse.json(mockMachineScope);
        }),
      ),
    );

    const response = await apiClient.machines.createScope(machineId, otherMachineId);

    expect(response.fromMachineId).toBe(machineId);
    expect(response.toMachineId).toBe(otherMachineId);
  });

  it('deletes a machine scope', async () => {
    server.use(
      http.delete(
        `https://api.clerk.test/v1/machines/${machineId}/scopes/${otherMachineId}`,
        validateHeaders(() => {
          return HttpResponse.json(mockMachineScope);
        }),
      ),
    );

    const response = await apiClient.machines.deleteScope(machineId, otherMachineId);

    expect(response.fromMachineId).toBe(machineId);
    expect(response.toMachineId).toBe(otherMachineId);
  });
});
