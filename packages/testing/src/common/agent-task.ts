import type { ClerkClient } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';

export type CreateAgentTaskParams = Parameters<ClerkClient['agentTasks']['create']>[0] & {
  /**
   * The API URL for your Clerk instance.
   * If not provided, falls back to the `CLERK_API_URL` environment variable.
   */
  apiUrl?: string;
  /**
   * The secret key for your Clerk instance.
   * If not provided, falls back to the `CLERK_SECRET_KEY` environment variable.
   */
  secretKey?: string;
};

export const ERROR_MISSING_SECRET_KEY =
  'A secretKey is required to create agent tasks. ' +
  'Pass it directly or set the CLERK_SECRET_KEY environment variable.';

export const ERROR_MISSING_API_URL =
  'An apiUrl is required to create agent tasks. ' + 'Pass it directly or set the CLERK_API_URL environment variable.';

export const ERROR_AGENT_TASK_FAILED = 'Failed to create agent task: ';

/**
 * Creates an agent task using the Clerk Backend API and returns its URL.
 *
 * @internal Framework-specific wrappers should call this after resolving the secret key.
 *
 * @experimental This is an experimental API for the Agent Tasks feature that is available under a private beta,
 * and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version
 * and the clerk-js version to avoid breaking changes.
 */
export async function createAgentTaskUrl(params: CreateAgentTaskParams) {
  const { apiUrl, secretKey, ...taskParams } = params;

  if (!apiUrl) {
    throw new Error(ERROR_MISSING_API_URL);
  }

  if (!secretKey) {
    throw new Error(ERROR_MISSING_SECRET_KEY);
  }

  const clerkClient = createClerkClient({ apiUrl, secretKey });

  try {
    const agentTask = await clerkClient.agentTasks.create(taskParams);
    return agentTask.url;
  } catch (error) {
    throw new Error(ERROR_AGENT_TASK_FAILED + (error instanceof Error ? error.message : String(error)));
  }
}
