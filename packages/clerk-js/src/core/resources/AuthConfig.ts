import type {
  AuthConfigJSON,
  AuthConfigJSONSnapshot,
  AuthConfigResource,
  NativeAuthSettings,
  PhoneCodeChannel,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class AuthConfig extends BaseResource implements AuthConfigResource {
  claimedAt: Date | null = null;
  reverification: boolean = false;
  singleSessionMode: boolean = false;
  preferredChannels: Record<string, PhoneCodeChannel> | null = null;
  sessionMinter: boolean = false;
  nativeSettings: NativeAuthSettings = {
    apiEnabled: false,
    trustedDeviceSignInEnabled: false,
    trustedDeviceEnrollmentPromptAfterSignInEnabled: false,
    trustedDeviceEnrollmentPromptAfterSignUpEnabled: false,
  };

  public constructor(data: Partial<AuthConfigJSON> | null = null) {
    super();

    this.fromJSON(data);
  }

  protected fromJSON(data: Partial<AuthConfigJSON> | null): this {
    if (!data) {
      return this;
    }
    this.claimedAt = this.withDefault(data.claimed_at ? unixEpochToDate(data.claimed_at) : null, this.claimedAt);
    this.reverification = this.withDefault(data.reverification, this.reverification);
    this.singleSessionMode = this.withDefault(data.single_session_mode, this.singleSessionMode);
    this.preferredChannels = this.withDefault(data.preferred_channels, this.preferredChannels);
    this.sessionMinter = this.withDefault(data.session_minter, this.sessionMinter);
    this.nativeSettings = {
      apiEnabled: data.native_settings?.api_enabled ?? false,
      trustedDeviceSignInEnabled: data.native_settings?.trusted_device_sign_in_enabled ?? false,
      trustedDeviceEnrollmentPromptAfterSignInEnabled:
        data.native_settings?.trusted_device_enrollment_prompt_after_sign_in_enabled ?? false,
      trustedDeviceEnrollmentPromptAfterSignUpEnabled:
        data.native_settings?.trusted_device_enrollment_prompt_after_sign_up_enabled ?? false,
    };
    return this;
  }

  public __internal_toSnapshot(): AuthConfigJSONSnapshot {
    return {
      claimed_at: this.claimedAt ? this.claimedAt.getTime() : null,
      id: this.id ?? '',
      object: 'auth_config',
      reverification: this.reverification,
      single_session_mode: this.singleSessionMode,
      session_minter: this.sessionMinter,
      native_settings: {
        api_enabled: this.nativeSettings.apiEnabled,
        trusted_device_sign_in_enabled: this.nativeSettings.trustedDeviceSignInEnabled,
        trusted_device_enrollment_prompt_after_sign_in_enabled:
          this.nativeSettings.trustedDeviceEnrollmentPromptAfterSignInEnabled,
        trusted_device_enrollment_prompt_after_sign_up_enabled:
          this.nativeSettings.trustedDeviceEnrollmentPromptAfterSignUpEnabled,
      },
    };
  }
}
