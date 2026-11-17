import type { ErrorDescription, LocalizableError } from '../localization';

export const UNEXPECTED_ERROR: LocalizableError = { code: 'generic' };

/** One thing to tell the user about a failed action. `field` is the form control it belongs to, if any. */
export interface MosaicIssue extends LocalizableError {
  field?: string;
}

/** What an action rejects with when the failure is the user's to fix; anything else propagates. */
export class MosaicError extends Error {
  readonly issues: readonly [MosaicIssue, ...MosaicIssue[]];

  constructor(issues: readonly [MosaicIssue, ...MosaicIssue[]]) {
    super(issues[0].message ?? 'Action failed');
    this.name = 'MosaicError';
    this.issues = issues;
  }
}

/** What an action rejects with when the user backed out of it, such as a cancelled reverification. */
export class CancelledError extends Error {
  constructor() {
    super('Cancelled');
    this.name = 'CancelledError';
  }
}

/**
 * Picks what to show for a failed action: the first issue without a field, else the first issue.
 * Anything else is logged and keeps its cause, so the caller shows its fallback.
 */
export function describeError(cause: unknown): ErrorDescription {
  if (cause instanceof MosaicError) {
    return cause.issues.find(issue => issue.field === undefined) ?? cause.issues[0];
  }
  console.error('[Clerk] Could not localize error', cause);
  return { cause };
}

/** Reads every issue of a failed action, in the order it reported them. */
export function describeErrors(cause: unknown): ErrorDescription[] {
  return cause instanceof MosaicError ? [...cause.issues] : [describeError(cause)];
}
