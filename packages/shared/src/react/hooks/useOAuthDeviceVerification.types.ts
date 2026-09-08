import type { ClerkAPIResponseError } from '../../errors/clerkApiResponseError';
import type { ClerkRuntimeError } from '../../errors/clerkRuntimeError';
import type {
  LookupOAuthDeviceVerificationParams,
  OAuthDeviceVerificationInfo,
  OAuthDeviceVerificationResult,
  SubmitOAuthDeviceVerificationParams,
} from '../../types';

type DecisionParams = Omit<SubmitOAuthDeviceVerificationParams, 'approved'>;

export type UseOAuthDeviceVerificationReturn = {
  data: OAuthDeviceVerificationInfo | undefined;
  result: OAuthDeviceVerificationResult | undefined;
  error: ClerkAPIResponseError | ClerkRuntimeError | null;
  isLoading: boolean;
  isSubmitting: boolean;
  lookup: (params: LookupOAuthDeviceVerificationParams) => Promise<OAuthDeviceVerificationInfo>;
  approve: (params: DecisionParams) => Promise<OAuthDeviceVerificationResult>;
  deny: (params: LookupOAuthDeviceVerificationParams) => Promise<OAuthDeviceVerificationResult>;
  reset: () => void;
};
