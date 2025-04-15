import type { InstanceSettingsJSON } from './JSON';

export class InstanceSettings {
  constructor(
    readonly id?: string | undefined,
    readonly restrictedToAllowlist?: boolean | undefined,
    readonly fromEmailAddress?: string | undefined,
    readonly progressiveSignUp?: boolean | undefined,
    readonly enhancedEmailDeliverability?: boolean | undefined,
  ) {}

  static fromJSON(data: InstanceSettingsJSON): InstanceSettings {
    return new InstanceSettings(
      data.id,
      data.restricted_to_allowlist,
      data.from_email_address,
      data.progressive_sign_up,
      data.enhanced_email_deliverability,
    );
  }
}
