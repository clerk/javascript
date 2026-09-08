import type { ClerkAPIResponseError } from '../../errors/clerkApiResponseError';
import type { ClerkRuntimeError } from '../../errors/clerkRuntimeError';
import type {
  LookupOAuthDeviceVerificationParams,
  OAuthDeviceVerificationInfo,
  OAuthDeviceVerificationResult,
  SubmitOAuthDeviceVerificationParams,
} from '../../types';

/**
 * @interface
 */
export type UseOAuthDeviceVerificationReturn = {
  /**
   * Information about the device authorization returned by the latest successful lookup, or `undefined` if no lookup has succeeded.
   */
  data: OAuthDeviceVerificationInfo | undefined;
  /**
   * The result of the latest approval or denial, or `undefined` if no decision has succeeded.
   */
  result: OAuthDeviceVerificationResult | undefined;
  /**
   * The most recent error returned while looking up or submitting a device authorization, or `null` if no error occurred.
   */
  error: ClerkAPIResponseError | ClerkRuntimeError | null;
  /**
   * Whether a device authorization lookup is in progress.
   */
  isLoading: boolean;
  /**
   * Whether an approval or denial is in progress.
   */
  isSubmitting: boolean;
  /**
   * Looks up a device authorization by its user code.
   */
  lookup: (params: LookupOAuthDeviceVerificationParams) => Promise<OAuthDeviceVerificationInfo>;
  /**
   * Approves a device authorization.
   */
  approve: (params: Omit<SubmitOAuthDeviceVerificationParams, 'approved'>) => Promise<OAuthDeviceVerificationResult>;
  /**
   * Denies a device authorization.
   */
  deny: (params: LookupOAuthDeviceVerificationParams) => Promise<OAuthDeviceVerificationResult>;
  /**
   * Clears the current device authorization state.
   */
  reset: () => void;
};
