import type { ClerkError } from '../error';
import type { ClerkResource } from './resource';

export interface WaitlistResource extends ClerkResource {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface WaitlistFutureResource {
  /**
   * The unique identifier for the waitlist entry. `undefined` if the user has not joined the waitlist yet.
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
   * Used to add the provided `emailAddress` to the waitlist.
   */
  join: (params: JoinWaitlistParams) => Promise<{ error: ClerkError | null }>;
}

export type JoinWaitlistParams = {
  emailAddress: string;
};
