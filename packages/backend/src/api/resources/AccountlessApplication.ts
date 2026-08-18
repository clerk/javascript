import type { AccountlessApplicationJSON } from './JSON';

/**
 * @deprecated Keyless mode is no longer activated by the framework SDKs. Kept for the claimed-keys migration path and older published SDK versions; remove in the next major.
 */
export class AccountlessApplication {
  constructor(
    readonly publishableKey: string,
    readonly secretKey: string,
    readonly claimUrl: string,
    readonly apiKeysUrl: string,
  ) {}

  static fromJSON(data: AccountlessApplicationJSON): AccountlessApplication {
    return new AccountlessApplication(data.publishable_key, data.secret_key, data.claim_url, data.api_keys_url);
  }
}
