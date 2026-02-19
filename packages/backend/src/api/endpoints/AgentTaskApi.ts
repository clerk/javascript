import { joinPaths } from '../../util/path';
import type { AgentTask } from '../resources/AgentTask';
import { AbstractAPI } from './AbstractApi';

type CreateAgentTaskParams = {
  /**
   * The user to create an agent task for.
   */
  onBehalfOf:
    | {
        /**
         * The identifier of the user to create an agent task for.
         */
        identifier: string;
        userId?: never;
      }
    | {
        /**
         * The ID of the user to create an agent task for.
         */
        userId: string;
        identifier?: never;
      };
  /**
   * The permissions the agent task will have.
   */
  permissions: string;
  /**
   * The name of the agent to create an agent task for.
   */
  agentName: string;
  /**
   * The description of the agent task to create.
   */
  taskDescription: string;
  /**
   * The URL to redirect to after the agent task is consumed.
   */
  redirectUrl: string;

  /**
   * The maximum duration that the session which will be created by the generated agent task should last.
   * By default, the duration is 30 minutes.
   */
  sessionMaxDurationInSeconds?: number;
};

const basePath = '/agents/tasks';

export class AgentTaskAPI extends AbstractAPI {
  /**
   * @experimental This is an experimental API for the Agent Tokens feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
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

  public async revoke(agentTaskId: string) {
    this.requireId(agentTaskId);
    return this.request<Omit<AgentTask, 'url'>>({
      method: 'POST',
      path: joinPaths(basePath, agentTaskId, 'revoke'),
    });
  }
}
