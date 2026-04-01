import type { VerificationStatus } from '@clerk/shared/types';

import type { OrganizationDomainVerificationJSON, VerificationJSON } from './JSON';

/**
 * The Backend `Verification` object describes the state of the verification process of a sign-in or sign-up attempt.
 */
export class Verification {
  constructor(
    /**
     * The state of the verification.
     *
     * <ul>
     *  <li>`unverified`: The verification has not been verified yet.</li>
     *  <li>`verified`: The verification has been verified.</li>
     *  <li>`transferable`: The verification is transferable to between sign-in and sign-up flows.</li>
     *  <li>`failed`: The verification has failed.</li>
     *  <li>`expired`: The verification has expired.</li>
     * </ul>
     */
    readonly status: VerificationStatus,
    /**
     * The strategy pertaining to the parent sign-up or sign-in attempt.
     */
    readonly strategy: string,
    /**
     * The redirect URL for an external verification.
     */
    readonly externalVerificationRedirectURL: URL | null = null,
    /**
     * The number of attempts related to the verification.
     */
    readonly attempts: number | null = null,
    /**
     * The time the verification will expire at.
     */
    readonly expireAt: number | null = null,
    /**
     * The [nonce](https://en.wikipedia.org/wiki/Cryptographic_nonce) pertaining to the verification.
     */
    readonly nonce: string | null = null,
    /**
     * The message that will be presented to the user's Web3 wallet for signing during authentication. This follows the [Sign-In with Ethereum (SIWE) protocol format](https://docs.login.xyz/general-information/siwe-overview/eip-4361#example-message-to-be-signed), which typically includes details like the requesting service, wallet address, terms acceptance, nonce, timestamp, and any additional resources.
     */
    readonly message: string | null = null,
  ) {}

  static fromJSON(data: VerificationJSON): Verification {
    return new Verification(
      data.status,
      data.strategy,
      data.external_verification_redirect_url ? new URL(data.external_verification_redirect_url) : null,
      data.attempts,
      data.expire_at,
      data.nonce,
    );
  }
}

export class OrganizationDomainVerification {
  constructor(
    readonly status: string,
    readonly strategy: string,
    readonly attempts: number | null = null,
    readonly expireAt: number | null = null,
  ) {}

  static fromJSON(data: OrganizationDomainVerificationJSON): OrganizationDomainVerification {
    return new OrganizationDomainVerification(data.status, data.strategy, data.attempts, data.expires_at);
  }
}
