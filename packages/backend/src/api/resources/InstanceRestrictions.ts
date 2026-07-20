import type { InstanceRestrictionsJSON } from './JSON';

/** The `InstanceRestrictions` object represents the [restrictions](https://clerk.com/docs/guides/secure/restricting-access) settings for the current instance. */
export class InstanceRestrictions {
  constructor(
    /** Whether the instance has [**Allowlist**](https://clerk.com/docs/guides/secure/restricting-access#allowlist) enabled. */
    readonly allowlist: boolean,
    /** Whether the instance has [**Blocklist**](https://clerk.com/docs/guides/secure/restricting-access#blocklist) enabled. */
    readonly blocklist: boolean,
    /** Whether the instance has [**Block email subaddresses**](https://clerk.com/docs/guides/secure/restricting-access#block-email-subaddresses) enabled. */
    readonly blockEmailSubaddresses: boolean,
    /** Whether the instance has [**Block sign-ups that use disposable email domains**](https://clerk.com/docs/guides/secure/restricting-access#block-sign-ups-that-use-disposable-email-addresses) enabled. */
    readonly blockDisposableEmailDomains: boolean,
    /** Whether the instance has [**Ignore dots for Gmail addresses**](https://clerk.com/docs/guides/secure/restricting-access#block-email-subaddresses) enabled. */
    readonly ignoreDotsForGmailAddresses: boolean,
  ) {}

  static fromJSON(data: InstanceRestrictionsJSON): InstanceRestrictions {
    return new InstanceRestrictions(
      data.allowlist,
      data.blocklist,
      data.block_email_subaddresses,
      data.block_disposable_email_domains,
      data.ignore_dots_for_gmail_addresses,
    );
  }
}
