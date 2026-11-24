import { http, HttpResponse, type MockScenario } from '@clerk/msw';
import type { AgentConnectionJSON } from '@clerk/shared/types';

import { UserButtonSignedIn } from './user-button-signed-in';

const connections: AgentConnectionJSON[] = [
  {
    object: 'agent_connection',
    id: 'connection_personal_agent',
    name: 'Personal agent',
    domain: 'agent.example',
    image_url: 'https://agent.example/logo.svg',
    scopes: ['profile', 'email', 'calendar:read'],
    last_used_at: 1794139200000,
  },
  {
    object: 'agent_connection',
    id: 'connection_personal_agent_2',
    name: 'Personal agent 2',
    domain: 'assistant.example',
    image_url: null,
    scopes: ['profile', 'documents:read'],
    last_used_at: null,
  },
];

export function UserProfileAgentConnections(): MockScenario {
  return agentConnectionsScenario(connections, 'user-profile-agent-connections');
}

export function UserProfileAgentConnectionsEmpty(): MockScenario {
  return agentConnectionsScenario([], 'user-profile-agent-connections-empty');
}

export function UserProfileAgentConnectionsPaginated(): MockScenario {
  return agentConnectionsScenario(
    Array.from({ length: 12 }, (_, index) => ({
      ...connections[0],
      id: `connection_personal_agent_${index + 1}`,
      name: `Personal agent ${index + 1}`,
    })),
    'user-profile-agent-connections-paginated',
  );
}

export function UserProfileAgentConnectionsError(): MockScenario {
  const scenario = UserButtonSignedIn();

  return {
    ...scenario,
    name: 'user-profile-agent-connections-error',
    description: 'UserProfile with a failed agent-connections request',
    handlers: [
      http.get('*/v1/me/agent_connections', () =>
        HttpResponse.json(
          { errors: [{ code: 'internal_error', message: 'Request failed', long_message: 'Request failed' }] },
          { status: 500 },
        ),
      ),
      ...scenario.handlers,
    ],
  };
}

function agentConnectionsScenario(data: AgentConnectionJSON[], name: string): MockScenario {
  const scenario = UserButtonSignedIn();

  return {
    ...scenario,
    name,
    description: 'UserProfile with personal-agent connection fixtures',
    handlers: [
      http.get(
        'https://agent.example/logo.svg',
        () =>
          new HttpResponse(
            '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#6c47ff"/><path d="M24 54V26h17a10 10 0 0 1 0 20H33v8zm9-17h8a1 1 0 0 0 0-2h-8z" fill="white"/></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } },
          ),
      ),
      http.get('*/v1/me/agent_connections', ({ request }) => {
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get('limit') ?? 10);
        const offset = Number(url.searchParams.get('offset') ?? 0);

        return HttpResponse.json({
          response: { data: data.slice(offset, offset + limit), total_count: data.length },
        });
      }),
      ...scenario.handlers,
    ],
  };
}
