import type {
  AuthConfigJSON,
  AuthConfigJSONSnapshot,
  AuthConfigResource,
  NativeSettingsJSON,
  NativeSettingsResource,
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
  nativeSettings: NativeSettingsResource | null = null;

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
    if (data.native_settings !== undefined) {
      this.nativeSettings = nativeSettingsFromJSON(data.native_settings);
    }
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
      native_settings: nativeSettingsToJSON(this.nativeSettings),
    };
  }
}

function nativeSettingsFromJSON(data: NativeSettingsJSON | null): NativeSettingsResource | null {
  if (!data) {
    return null;
  }
  return {
    apiEnabled: !!data.api_enabled,
    trustedDeviceSignInEnabled: !!data.trusted_device_sign_in_enabled,
    trustedDeviceEnrollmentPromptAfterSignInEnabled: !!data.trusted_device_enrollment_prompt_after_sign_in_enabled,
    trustedDeviceEnrollmentPromptAfterSignUpEnabled: !!data.trusted_device_enrollment_prompt_after_sign_up_enabled,
  };
}

function nativeSettingsToJSON(settings: NativeSettingsResource | null): NativeSettingsJSON | null {
  if (!settings) {
    return null;
  }
  return {
    object: 'native_settings',
    api_enabled: settings.apiEnabled,
    trusted_device_sign_in_enabled: settings.trustedDeviceSignInEnabled,
    trusted_device_enrollment_prompt_after_sign_in_enabled: settings.trustedDeviceEnrollmentPromptAfterSignInEnabled,
    trusted_device_enrollment_prompt_after_sign_up_enabled: settings.trustedDeviceEnrollmentPromptAfterSignUpEnabled,
  };
}
