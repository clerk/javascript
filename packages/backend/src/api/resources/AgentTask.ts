import type { AgentTaskJSON } from './JSON';

/**
 * Represents a agent token resource.
 *
 * Agent tokens are used for testing purposes and allow creating sessions
 * for users without requiring full authentication flows.
 */
export class AgentTask {
  constructor(
    /**
     * A stable identifier for the agent, unique per agent_name within an instance.
     */
    readonly agentId: string,
    /**
     * A unique identifier for this agent task.
     */
    readonly taskId: string,
    /**
     * The FAPI URL that, when visited, creates a session for the user.
     */
    readonly url: string,
  ) {}

  /**
   * Creates a AgentTask instance from a JSON object.
   *
   * @param data - The JSON object containing agent task data
   * @returns A new AgentTask instance
   */
  static fromJSON(data: AgentTaskJSON): AgentTask {
    return new AgentTask(data.agent_id, data.task_id, data.url);
  }
}
