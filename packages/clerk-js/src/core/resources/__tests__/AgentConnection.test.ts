import type { AgentConnectionJSON, UserJSON } from '@clerk/shared/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AgentConnection } from '../AgentConnection';
import { BaseResource } from '../internal';
import { User } from '../User';

const connection: AgentConnectionJSON = {
  object: 'agent_connection',
  id: 'connection_123',
  name: 'Personal agent',
  domain: 'agent.example',
  image_url: 'https://agent.example/logo.svg',
  scopes: ['profile', 'email'],
  last_used_at: 1794240000000,
};

describe('AgentConnection', () => {
  afterEach(() => vi.restoreAllMocks());

  it('retrieves a page for the signed-in user and converts last use to a Date', async () => {
    const fetch = vi.spyOn(BaseResource, '_fetch').mockResolvedValue({
      response: { data: [connection], total_count: 12 },
    } as unknown as Awaited<ReturnType<typeof BaseResource._fetch>>);
    const user = new User({} as UserJSON);

    const result = await user.__experimental_getAgentConnections({ pageSize: 5, initialPage: 2 });

    expect(fetch).toHaveBeenCalledWith({
      path: '/me/agent_connections',
      method: 'GET',
      search: new URLSearchParams({ limit: '5', offset: '5' }),
    });
    expect(result.total_count).toBe(12);
    expect(result.data[0]).toEqual({
      id: connection.id,
      name: connection.name,
      domain: connection.domain,
      imageUrl: connection.image_url,
      scopes: connection.scopes,
      lastUsedAt: new Date(1794240000000),
    });
  });

  it('keeps unknown domain and last use as null', () => {
    expect(new AgentConnection({ ...connection, domain: null, last_used_at: null })).toMatchObject({
      domain: null,
      lastUsedAt: null,
    });
  });

  it.each([undefined, null])('keeps a missing logo as null for older responses with %s', imageUrl => {
    expect(new AgentConnection({ ...connection, image_url: imageUrl }).imageUrl).toBeNull();
  });

  it('returns an empty page without inventing connections', async () => {
    vi.spyOn(BaseResource, '_fetch').mockResolvedValue({
      response: { data: [], total_count: 0 },
    } as unknown as Awaited<ReturnType<typeof BaseResource._fetch>>);

    expect(await AgentConnection.retrieve()).toEqual({ data: [], total_count: 0 });
  });

  it('preserves list failures for the caller', async () => {
    const error = new Error('Request failed');
    vi.spyOn(BaseResource, '_fetch').mockRejectedValue(error);

    await expect(AgentConnection.retrieve()).rejects.toBe(error);
  });
});
