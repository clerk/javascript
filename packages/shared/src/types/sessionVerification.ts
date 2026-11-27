import type {
  BackupCodeFactor,
  EmailCodeFactor,
  EnterpriseSSOFactor,
  PasskeyFactor,
  PasswordFactor,
  PhoneCodeFactor,
  ResetPasswordEmailCodeFactor,
  ResetPasswordPhoneCodeFactor,
  TOTPFactor,
} from './factors';
import type { ClerkResource } from './resource';
import type { SessionResource } from './session';
import type { VerificationResource } from './verification';

export interface SessionVerificationResource extends ClerkResource {
  status: SessionVerificationStatus;
  level: SessionVerificationLevel;
  session: SessionResource;
  firstFactorVerification: VerificationResource;
  secondFactorVerification: VerificationResource;
  supportedFirstFactors: SessionVerificationFirstFactor[] | null;
  supportedSecondFactors: SessionVerificationSecondFactor[] | null;
}

export type SessionVerificationStatus = 'needs_first_factor' | 'needs_second_factor' | 'complete';

/**
 * What a completed reverification did, passed to the fetcher of `useReverification` with `passReverificationResult`.
 * @inline
 */
export type ReverificationResult = {
  /**
   * Set when the user reset their password to reverify. The new password is
   * already saved, so a retried password change should not send it again.
   */
  passwordReset?: {
    newPassword: string;
    signOutOfOtherSessions: boolean;
  };
};

/**
 * Values the reverification modal reuses instead of asking for them, returned by the `prefill` option of
 * `useReverification`. Same shape as `ReverificationResult`.
 * @inline
 */
export type ReverificationPrefill = {
  /**
   * Used when the user resets a breached or compromised password to reverify. The modal saves `newPassword` with
   * the reset code instead of asking for a new password, and doesn't ask whether to sign out of other sessions.
   */
  passwordReset?: {
    /** The new password to save when the reset code is verified. */
    newPassword: string;
    /** Whether to sign out of the user's other sessions after the password reset. */
    signOutOfOtherSessions: boolean;
  };
};

/**
 * @inline
 */
export type SessionVerificationTypes = 'strict_mfa' | 'strict' | 'moderate' | 'lax';

/**
 * The `ReverificationConfig` type has the following properties:
 */
export type ReverificationConfig =
  | SessionVerificationTypes
  | {
      /**
       * The reverification level of credentials to check for.
       */
      level: SessionVerificationLevel;
      /**
       * The age of the factor level to check for. Value should be greater than or equal to 1 and less than 99,999.
       */
      afterMinutes: SessionVerificationAfterMinutes;
    };

/**
 * @inline
 */
export type SessionVerificationLevel = 'first_factor' | 'second_factor' | 'multi_factor';
export type SessionVerificationAfterMinutes = number;

export type SessionVerificationFirstFactor =
  | EmailCodeFactor
  | PhoneCodeFactor
  | PasswordFactor
  | PasskeyFactor
  | ResetPasswordEmailCodeFactor
  | ResetPasswordPhoneCodeFactor
  /**
   * @experimental
   */
  | EnterpriseSSOFactor;
export type SessionVerificationSecondFactor = PhoneCodeFactor | TOTPFactor | BackupCodeFactor | PasskeyFactor;
