import type { WaitlistEntryStatus } from './Enums';
import { Invitation } from './Invitation';
import type { WaitlistEntryJSON } from './JSON';

export class WaitlistEntry {
  constructor(
    readonly id: string,
    readonly emailAddress: string,
    readonly status: WaitlistEntryStatus,
    readonly invitation: Invitation | null,
    readonly createdAt: number,
    readonly updatedAt: number,
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
