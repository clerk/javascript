import type { InvitationStatus } from './Enums';
import type { InvitationJSON } from './JSON';

/**
 * The Backend `Invitation` object represents an invitation to join your application.
 */
export class Invitation {
  private _raw: InvitationJSON | null = null;

  public get raw(): InvitationJSON | null {
    return this._raw;
  }

  constructor(
    /**
     * The unique identifier for the `Invitation`.
     */
    readonly id: string,
    /**
     * The email address that the invitation was sent to.
     */
    readonly emailAddress: string,
    /**
     * [Metadata](https://clerk.com/docs/reference/javascript/types/metadata#user-public-metadata){{ target: '_blank' }} that can be read from the Frontend API and [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }} and can be set only from the Backend API. Once the user accepts the invitation and signs up, these metadata will end up in the user's public metadata.
     */
    readonly publicMetadata: Record<string, unknown> | null,
    /**
     * The date when the `Invitation` was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the `Invitation` was last updated.
     */
    readonly updatedAt: number,
    /**
     * The status of the `Invitation`.
     */
    readonly status: InvitationStatus,
    /**
     * The URL that the user can use to accept the invitation.
     */
    readonly url?: string,
    /**
     * Whether the `Invitation` has been revoked.
     */
    readonly revoked?: boolean,
  ) {}

  static fromJSON(data: InvitationJSON): Invitation {
    const res = new Invitation(
      data.id,
      data.email_address,
      data.public_metadata,
      data.created_at,
      data.updated_at,
      data.status,
      data.url,
      data.revoked,
    );
    res._raw = data;
    return res;
  }
}
