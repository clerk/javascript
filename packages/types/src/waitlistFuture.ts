import type { JoinWaitlistParams } from './clerk';

/**
 * The `WaitlistFuture` API provides a minimal interface to drive the waitlist flow from custom UIs.
 */
export interface WaitlistFutureResource {
  /**
   * Submits an email address to join the waitlist.
   */
  join: (params: JoinWaitlistParams) => Promise<{ error: unknown }>;
}
