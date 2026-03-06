import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('AgentTaskAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const mockAgentTaskResponse = {
    object: 'agent_task',
    agent_id: 'agent_123',
    task_id: 'task_456',
    url: 'https://example.com/agent-task',
  };

  describe('create', () => {
    it('converts nested onBehalfOf.userId to snake_case', async () => {
      server.use(
        http.post(
          'https://api.clerk.test/v1/agents/tasks',
          validateHeaders(async ({ request }) => {
            const body = await request.json();

            expect(body).toEqual({
              on_behalf_of: {
                user_id: 'user_123',
              },
              permissions: 'read,write',
              agent_name: 'test-agent',
              task_description: 'Test task',
              redirect_url: 'https://example.com/callback',
              session_max_duration_in_seconds: 1800,
            });

            return HttpResponse.json(mockAgentTaskResponse);
          }),
        ),
      );

      const response = await apiClient.agentTasks.create({
        onBehalfOf: {
          userId: 'user_123',
        },
        permissions: 'read,write',
        agentName: 'test-agent',
        taskDescription: 'Test task',
        redirectUrl: 'https://example.com/callback',
        sessionMaxDurationInSeconds: 1800,
      });

      expect(response.agentId).toBe('agent_123');
      expect(response.taskId).toBe('task_456');
      expect(response.url).toBe('https://example.com/agent-task');
    });

    it('converts nested onBehalfOf.identifier to snake_case', async () => {
      server.use(
        http.post(
          'https://api.clerk.test/v1/agents/tasks',
          validateHeaders(async ({ request }) => {
            const body = await request.json();

            expect(body).toEqual({
              on_behalf_of: {
                identifier: 'user@example.com',
              },
              permissions: 'read',
              agent_name: 'test-agent',
              task_description: 'Test task',
              redirect_url: 'https://example.com/callback',
            });

            return HttpResponse.json(mockAgentTaskResponse);
          }),
        ),
      );

      const response = await apiClient.agentTasks.create({
        onBehalfOf: {
          identifier: 'user@example.com',
        },
        permissions: 'read',
        agentName: 'test-agent',
        taskDescription: 'Test task',
        redirectUrl: 'https://example.com/callback',
      });

      expect(response.agentId).toBe('agent_123');
      expect(response.taskId).toBe('task_456');
    });
  });
});
