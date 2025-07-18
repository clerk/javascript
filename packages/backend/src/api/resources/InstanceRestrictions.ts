import type { InstanceRestrictionsJSON } from './JSON';

export class InstanceRestrictions {
  constructor(
    readonly allowlist: boolean,
    readonly blocklist: boolean,
    readonly blockEmailSubaddresses: boolean,
    readonly blockDisposableEmailDomains: boolean,
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
