import type { ExternalAccountJSON } from './JSON';
import { Verification } from './Verification';

/**
 * The Backend `ExternalAccount` object is a model around an identification obtained by an external provider (e.g. a social provider such as Google).
 *
 * External account must be verified, so that you can make sure they can be assigned to their rightful owners. The `ExternalAccount` object holds all necessary state around the verification process.
 */
export class ExternalAccount {
  constructor(
    /**
     * The unique identifier for this external account.
     */
    readonly id: string,
    /**
     * The provider name (e.g., `google`).
     */
    readonly provider: string,
    /**
     * The unique ID of the user in the provider.
     */
    readonly providerUserId: string,
    /**
     * The identification with which this external account is associated.
     */
    readonly identificationId: string,
    /**
     * @deprecated Use `providerUserId` instead.
     */
    readonly externalId: string,
    /**
     * The scopes that the user has granted access to.
     */
    readonly approvedScopes: string,
    /**
     * The user's email address.
     */
    readonly emailAddress: string,
    /**
     * The user's first name.
     */
    readonly firstName: string,
    /**
     * The user's last name.
     */
    readonly lastName: string,
    /**
     * The user's image URL.
     */
    readonly imageUrl: string,
    /**
     * The user's username.
     */
    readonly username: string | null,
    /**
     * The phone number related to this specific external account.
     */
    readonly phoneNumber: string | null,
    /**
     * Metadata that can be read from the Frontend API and Backend API and can be set only from the Backend API.
     */
    readonly publicMetadata: Record<string, unknown> | null = {},
    /**
     * A descriptive label to differentiate multiple external accounts of the same user for the same provider.
     */
    readonly label: string | null,
    /**
     * An object holding information on the verification of this external account.
     */
    readonly verification: Verification | null,
  ) {}

  static fromJSON(data: ExternalAccountJSON): ExternalAccount {
    return new ExternalAccount(
      data.id,
      data.provider,
      data.provider_user_id,
      data.identification_id,
      data.provider_user_id,
      data.approved_scopes,
      data.email_address,
      data.first_name,
      data.last_name,
      data.image_url || '',
      data.username,
      data.phone_number,
      data.public_metadata,
      data.label,
      data.verification && Verification.fromJSON(data.verification),
    );
  }
}
