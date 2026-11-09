import type {
  AgentConnectionJSON,
  AgentConnectionResource,
  ClerkPaginatedResponse,
  GetAgentConnectionsParams,
} from '@clerk/shared/types';

import { convertPageToOffsetSearchParams } from '../../utils/convertPageToOffsetSearchParams';
import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class AgentConnection implements AgentConnectionResource {
  id: string;
  name: string;
  domain: string | null;
  imageUrl: string | null;
  scopes: string[];
  lastUsedAt: Date | null;

  constructor(data: AgentConnectionJSON) {
    this.id = data.id;
    this.name = data.name;
    this.domain = data.domain;
    this.imageUrl = data.image_url ?? null;
    this.scopes = data.scopes;
    this.lastUsedAt = data.last_used_at === null ? null : unixEpochToDate(data.last_used_at);
  }

  static async retrieve(params?: GetAgentConnectionsParams): Promise<ClerkPaginatedResponse<AgentConnection>> {
    const res = await BaseResource._fetch({
      path: '/me/agent_connections',
      method: 'GET',
      search: convertPageToOffsetSearchParams(params),
    });
    const { data, total_count } = res?.response as unknown as ClerkPaginatedResponse<AgentConnectionJSON>;

    return { data: data.map(connection => new AgentConnection(connection)), total_count };
  }
}
