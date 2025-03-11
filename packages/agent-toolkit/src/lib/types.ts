import type { ClerkClient } from '@clerk/backend';
import type { SignedInAuthObject } from '@clerk/backend/internal';

import type { ClerkTool } from './clerk-tool';

export type SdkAdapter<T> = (clerkClient: ClerkClient, context: ToolkitContext, clerkTool: ClerkTool) => T;

export type ToolkitContext = {
  /**
   * The userId of the currently signed-in user.
   * This is used to scope the tools to a specific user.
   */
  userId?: string;
  /**
   * The organizationId of the currently signed-in user.
   * This is used to scope the tools to a specific organization.
   */
  organizationId?: string;
  /**
   * All JWT claims of the current session.
   * This is used to scope the tools to a specific session or to make the LLM
   * aware of the sessions details.
   */
  sessionClaims?: SignedInAuthObject['sessionClaims'];
  /**
   * Whether to explicitly allow private metadata access.
   * By default, private metadata are pruned from all resources, before
   * the resources become available to the LLM. This is important to help avoid
   * leaking sensitive information to carefully crafted user prompts.
   *
   * @default false
   */
  allowPrivateMetadata?: boolean;
};

export type CreateClerkToolkitParams = {
  clerkClient?: ClerkClient;
  context?: ToolkitContext;
};

export type ClerkToolkitBase = {
  /**
   * Augment the system prompt with data about the current session.
   * This usually contains the userId, the sessionId, the organizationId, etc.
   * This property uses the data passed to `createClerkToolkit`.
   */
  injectSessionClaims: (prompt: string) => string;
};
