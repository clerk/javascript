import type { WaitlistEntryStatus } from './Enums';
import { Invitation } from './Invitation';
import type { WaitlistEntryJSON } from './JSON';

/**
 * The Backend `WaitlistEntry` object holds information about a [waitlist entry](https://clerk.com/docs/guides/secure/restricting-access#waitlist).
 */
export class WaitlistEntry {
  constructor(
    /**
     * The unique identifier for the waitlist entry.
     */
    readonly id: string,
    /**
     * The email address to add to the waitlist.
     */
    readonly emailAddress: string,
    /**
     * The status of the waitlist entry.
     */
    readonly status: WaitlistEntryStatus,
    /**
     * The invitation associated with the waitlist entry.
     */
    readonly invitation: Invitation | null,
    /**
     * The Unix timestamp when the waitlist entry was created.
     */
    readonly createdAt: number,
    /**
     * The Unix timestamp when the waitlist entry was last updated.
     */
    readonly updatedAt: number,
    /**
     * Whether the waitlist entry is locked.
     */
    readonly isLocked?: boolean,
  ) {}

  static fromJSON(data: WaitlistEntryJSON): WaitlistEntry {
    return new WaitlistEntry(
      data.id,
      data.email_address,
      data.status,
      data.invitation && Invitation.fromJSON(data.invitation),
      data.created_at,
      data.updated_at,
      data.is_locked,
    );
  }
}
