import type { ClerkClient } from '@clerk/backend';
import type { SignedInAuthObject } from '@clerk/backend/internal';

import type { ClerkTool } from './clerk-tool';

export type SdkAdapter<T> = (clerkClient: ClerkClient, context: ToolkitContext, clerkTool: ClerkTool) => T;

export type ToolkitContext = {
  userId?: string;
  sessionClaims?: SignedInAuthObject['sessionClaims'];
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
