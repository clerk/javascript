import type { OrganizationDomainVerificationJSON } from '@clerk/types';

import type { VerificationJSON } from './JSON';

export class Verification {
  constructor(
    readonly status: string,
    readonly strategy: string,
    readonly externalVerificationRedirectURL: URL | null = null,
    readonly attempts: number | null = null,
    readonly expireAt: number | null = null,
    readonly nonce: string | null = null,
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
