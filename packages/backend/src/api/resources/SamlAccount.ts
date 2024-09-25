import type { SamlAccountJSON } from './JSON';
import { SamlAccountConnection } from './SamlConnection';
import { Verification } from './Verification';

export class SamlAccount {
  constructor(
    readonly id: string,
    readonly provider: string,
    readonly providerUserId: string | null,
    readonly active: boolean,
    readonly emailAddress: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly verification: Verification | null,
    readonly samlConnection: SamlAccountConnection | null,
  ) {}

  static fromJSON(data: SamlAccountJSON): SamlAccount {
    return new SamlAccount(
      data.id,
      data.provider,
      data.provider_user_id,
      data.active,
      data.email_address,
      data.first_name,
      data.last_name,
      data.verification && Verification.fromJSON(data.verification),
      data.saml_connection && SamlAccountConnection.fromJSON(data.saml_connection),
    );
  }
}
