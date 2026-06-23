import type { AgentTaskJSON } from './JSON';

/**
 * The Backend `AgentTask` object represents an agent task resource. Agent tasks are used for testing purposes and allow creating sessions for users without requiring full authentication flows.
 */
export class AgentTask {
  constructor(
    /** The identifier for the agent, unique per `agent_name` within an instance. */
    readonly agentId: string,
    /** @deprecated Use `agentTaskId` instead. */
    readonly taskId: string,
    /** The unique identifier for this agent task. */
    readonly agentTaskId: string,
    /** The Frontend API URL that, when visited, creates a session for the user. Only returned by [`create()`](https://clerk.com/docs/reference/backend/agent-tasks/create); omitted from [`revoke()`](https://clerk.com/docs/reference/backend/agent-tasks/revoke). */
    readonly url: string,
  ) {}

  /**
   * Creates a AgentTask instance from a JSON object.
   *
   * @param data - The JSON object containing agent task data
   * @returns A new AgentTask instance
   */
  static fromJSON(data: AgentTaskJSON): AgentTask {
    const agentTaskId = data.agent_task_id ?? data.task_id ?? '';
    return new AgentTask(data.agent_id, agentTaskId, agentTaskId, data.url);
  }
}
