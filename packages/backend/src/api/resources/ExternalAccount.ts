import type { ExternalAccountJSON } from './JSON';
import { Verification } from './Verification';

export class ExternalAccount {
  constructor(
    readonly id: string,
    readonly provider: string,
    readonly identificationId: string,
    readonly externalId: string,
    readonly approvedScopes: string,
    readonly emailAddress: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly imageUrl: string,
    readonly username: string | null,
    readonly publicMetadata: Record<string, unknown> | null = {},
    readonly label: string | null,
    readonly verification: Verification | null,
  ) {}

  static fromJSON(data: ExternalAccountJSON): ExternalAccount {
    return new ExternalAccount(
      data.id,
      data.provider,
      data.identification_id,
      data.provider_user_id,
      data.approved_scopes,
      data.email_address,
      data.first_name,
      data.last_name,
      data.image_url,
      data.username,
      data.public_metadata,
      data.label,
      data.verification && Verification.fromJSON(data.verification),
    );
  }
}
