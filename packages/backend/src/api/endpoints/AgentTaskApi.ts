import { joinPaths } from '../../util/path';
import type { AgentTask } from '../resources/AgentTask';
import { AbstractAPI } from './AbstractApi';

/** @generateWithEmptyComment */
export type CreateAgentTaskParams = {
  /** The user to create an Agent Task for. Provide either a `userId` or an `identifier` (e.g. an email address, phone number, or username). */
  onBehalfOf:
    | {
        /** The identifier of the user to create an Agent Task for. */
        identifier: string;
        userId?: never;
      }
    | {
        /** The ID of the user to create an Agent Task for. */
        userId: string;
        identifier?: never;
      };
  /** The permissions the Agent Task will have. Currently, `'*'` is the only support value, which grants all permissions. */
  permissions: string;
  /** The name of the agent creating the task. Used to derive a stable `agent_id` for the Agent Task. */
  agentName: string;
  /** The description of the Agent Task to create. */
  taskDescription: string;
  /** The URL the user lands on after the Agent Task is accepted. In production instances, must be a valid absolute URL with an `https` scheme. In development instances, `http` is also permitted. The URL's domain must belong to one of the instance's associated domains (primary or satellite); otherwise, the redirect will be rejected when the task ticket is consumed. */
  redirectUrl: string;
  /** The maximum duration that the session created by the Agent Task should last. By default, the duration is `1800` (30 minutes). */
  sessionMaxDurationInSeconds?: number;
};

const basePath = '/agents/tasks';

/** @generateWithEmptyComment */
export class AgentTaskAPI extends AbstractAPI {
  /**
   * Creates an Agent Task that generates a URL which, when visited, creates a session for the specified user. This is useful for automated testing or agent-driven flows where full authentication isn't practical.
   * @returns The created [`AgentTask`](https://clerk.com/docs/reference/backend/types/backend-agent-task) object.
   */
  public async create(params: CreateAgentTaskParams) {
    return this.request<AgentTask>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
      options: {
        deepSnakecaseBodyParamKeys: true,
      },
    });
  }

  /**
   * Revokes the given agent task.
   * @param agentTaskId - The ID of the Agent Task to revoke.
   * @returns The revoked [`AgentTask`](https://clerk.com/docs/reference/backend/types/backend-agent-task) object.
   */
  public async revoke(agentTaskId: string) {
    this.requireId(agentTaskId);
    return this.request<Omit<AgentTask, 'url'>>({
      method: 'POST',
      path: joinPaths(basePath, agentTaskId, 'revoke'),
    });
  }
}
