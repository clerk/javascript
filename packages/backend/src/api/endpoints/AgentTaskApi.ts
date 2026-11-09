import { joinPaths } from '../../util/path';
import type { AgentTask } from '../resources/AgentTask';
import { AbstractAPI } from './AbstractApi';

/** @generateWithEmptyComment */
export type CreateAgentTaskParams = {
  /** The user to create an Agent Task for. Provide either a `userId` or an `identifier` (e.g., an email address, phone number, or username). */
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
  /** The permissions the Agent Task will have. Currently, `'*'` is the only supported value, which grants all permissions. */
  permissions: string;
  /** The name of the agent creating the task. Used to derive a stable `agent_id` for the Agent Task. */
  agentName: string;
  /** The description of the Agent Task to create. */
  taskDescription: string;
  /** The URL the user lands on after the Agent Task is accepted. In production instances, must be a valid absolute URL with an `https` scheme. In development instances, `http` is also permitted. The URL's domain must belong to one of the instance's associated domains (primary or satellite); otherwise, the redirect will be rejected when the task ticket is consumed. */
  redirectUrl: string;
  /** The maximum duration that the session created by the Agent Task should last. By default, the duration is `1800` (30 minutes). */
  sessionMaxDurationInSeconds?: number;
  /** Whether the session created by the Agent Task is restricted. In a restricted session, the Frontend API allows the agent only to read and to refresh its own session token, and refuses other writes with an `agent_session_forbidden` error. Open the Agent Task URL of a restricted session in a browser that has no other session; otherwise the Frontend API refuses it with the same error. By default, the session is not restricted. */
  sessionRestricted?: boolean;
  /** The ID of the Organization that the session created by the Agent Task starts in. The user must be a member of this Organization. A restricted session can only use this Organization. By default, the session starts in the user's last active Organization if the user is still a member of it, and otherwise in the personal account. There is no way yet to ask for the personal account when the user has a last active Organization. If `sessionRestricted` is `true` and the instance requires an Organization, the request fails when no Organization can be used. */
  sessionOrganizationId?: string;
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
   * Revokes the given Agent Task.
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
