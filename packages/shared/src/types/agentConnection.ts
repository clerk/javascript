import type { ClerkPaginationParams } from './pagination';

export interface AgentConnectionResource {
  id: string;
  name: string;
  domain: string | null;
  imageUrl: string | null;
  scopes: string[];
  lastUsedAt: Date | null;
}

export type GetAgentConnectionsParams = ClerkPaginationParams;
