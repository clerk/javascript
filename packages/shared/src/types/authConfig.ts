import type { PhoneCodeChannel } from './phoneCodeChannel';
import type { ClerkResource } from './resource';
import type { AuthConfigJSONSnapshot } from './snapshots';

export interface AuthConfigResource extends ClerkResource {
  /**
   * Enabled single session configuration at the instance level.
   */
  singleSessionMode: boolean;
  /**
   * Timestamp of when the instance was claimed. This only applies to applications created with the Keyless mode.
   *
   * @default null
   */
  claimedAt: Date | null;
  /**
   * Whether Reverification is enabled at the instance level.
   */
  reverification: boolean;
  /**
   * Preferred channels for phone code providers.
   */
  preferredChannels: Record<string, PhoneCodeChannel> | null;
  sessionMinter: boolean;
  /**
   * Native application settings, such as trusted device (biometric) sign-in.
   * @experimental
   */
  nativeSettings: NativeSettingsResource | null;
  __internal_toSnapshot: () => AuthConfigJSONSnapshot;
}

/**
 * @experimental
 */
export interface NativeSettingsResource {
  apiEnabled: boolean;
  trustedDeviceSignInEnabled: boolean;
  trustedDeviceEnrollmentPromptAfterSignInEnabled: boolean;
  trustedDeviceEnrollmentPromptAfterSignUpEnabled: boolean;
}
