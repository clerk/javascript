import type { AgentTokenJSON } from './JSON';

/**
 * Represents a agent token resource.
 *
 * Agent tokens are used for testing purposes and allow creating sessions
 * for users without requiring full authentication flows.
 */
export class AgentToken {
  constructor(
    /**
     * The unique identifier for the agent token.
     */
    readonly id: string,
    /**
     * The unique identifier for the user associated with this token.
     */
    readonly userId: string,
    /**
     * The agent token string value.
     */
    readonly token: string,
    /**
     * The current status of the token: 'pending', 'accepted', or 'revoked'.
     */
    readonly status: 'pending' | 'accepted' | 'revoked',
    /**
     * The URL associated with the agent token.
     */
    readonly url: string,
    /**
     * Unix timestamp (in milliseconds) indicating when the token was created.
     */
    readonly createdAt: number,
    /**
     * Unix timestamp (in milliseconds) indicating when the token was last updated.
     */
    readonly updatedAt: number,
  ) {}

  /**
   * Creates a AgentToken instance from a JSON object.
   *
   * @param data - The JSON object containing agent token data
   * @returns A new AgentToken instance
   */
  static fromJSON(data: AgentTokenJSON): AgentToken {
    return new AgentToken(data.id, data.user_id, data.token, data.status, data.url, data.created_at, data.updated_at);
  }
}
