/**
 * The lifecycle status of an Agent Action. `pending` is the only non-terminal value.
 *
 * Declared here rather than in a consuming package because both `@clerk/backend`'s
 * resources and the approval review surface project the same column.
 *
 * @experimental This is an experimental API and is subject to change.
 * @inline
 */
export type AgentActionStatus = 'pending' | 'allowed' | 'denied' | 'approved' | 'rejected' | 'expired';
