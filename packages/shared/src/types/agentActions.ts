/**
 * The lifecycle status of an Agent Action. `pending` is the only non-terminal value.
 *
 * Declared here rather than in a consuming package because both `@clerk/backend`'s
 * resources and the approval review surface project the same column.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 *
 * @inline
 */
export type AgentActionStatus = 'pending' | 'allowed' | 'denied' | 'approved' | 'rejected' | 'expired';
