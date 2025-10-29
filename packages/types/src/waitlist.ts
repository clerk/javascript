import type { ClerkResource } from './resource';

export interface WaitlistResource extends ClerkResource {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface JoinWaitlistParams {
  /**
   * The user's email address to join the waitlist.
   */
  emailAddress: string;
}

export interface WaitlistFutureResource {
  /**
   * The unique identifier for the waitlist entry. `null` if the user has not joined the waitlist yet.
   */
  readonly id?: string;

  /**
   * The date and time the waitlist entry was created. `null` if the user has not joined the waitlist yet.
   */
  readonly createdAt: Date | null;

  /**
   * The date and time the waitlist entry was last updated. `null` if the user has not joined the waitlist yet.
   */
  readonly updatedAt: Date | null;

  /**
   * Used to join the waitlist with the provided email address.
   */
  join: (params: JoinWaitlistParams) => Promise<{ error: unknown }>;
}
