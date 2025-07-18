import type { ClerkClient } from '@clerk/backend';
import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal';

import type { ClerkTool } from './clerk-tool';

export type ToolkitParams = {
  /**
   * All JWT claims of the current session.
   * This is used to scope the tools of this toolkit to a specific session/ user/ organization for
   * security reasons, or to make the LLM aware of the session details without requiring the LLM to
   * use tools to fetch the session details.
   *
   * @default {}
   */
  authContext?: Pick<
    SignedInAuthObject | SignedOutAuthObject,
    'userId' | 'sessionId' | 'sessionClaims' | 'orgId' | 'orgRole' | 'orgSlug' | 'orgPermissions' | 'actor'
  >;
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

export type ToolsContext = Partial<ToolkitParams['authContext']> & Omit<ToolkitParams, 'authContext'>;

export type CreateClerkToolkitParams = ToolkitParams & {
  /**
   * The Clerk client to use for all API calls,
   * useful if you want to override the default client.
   * This is commonly used when managing environment variables using special tooling
   * or when multiple Clerk instances are used in the same application.
   *
   * @default undefined
   */
  clerkClient?: ClerkClient;
};

export type SdkAdapter<T> = (clerkClient: ClerkClient, params: ToolkitParams, clerkTool: ClerkTool) => T;

export type ClerkToolkitBase = {
  /**
   * Augment the system prompt with data about the current session.
   * This usually contains the userId, the sessionId, the organizationId, etc.
   * This property uses the data passed to `createClerkToolkit`.
   */
  injectSessionClaims: (prompt: string) => string;
};
