import type { SamlAccountJSON } from './JSON';
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
    );
  }
}
