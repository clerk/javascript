import type { AgentToken } from '../resources/AgentToken';
import { AbstractAPI } from './AbstractApi';

type CreateAgentTokenParams = {
  /**
   * The ID of the user to create an agent token for.
   */
  userId: string;
  /**
   * The maximum duration that the session which will be created by the generated agent token should last.
   * By default, the duration is 30 minutes.
   */
  sessionMaxDurationInSeconds?: number;
  /**
   * The URL to redirect to after the agent token is consumed.
   */
  redirectUrl?: string;
};

const basePath = '/agent_tokens';

export class AgentTokenAPI extends AbstractAPI {
  /**
   * @experimental This is an experimental API for the Agent Tokens feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  public async create(params: CreateAgentTokenParams) {
    return this.request<AgentToken>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }
}
