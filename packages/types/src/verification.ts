import { ClerkAPIError } from './api';

export interface VerificationResource {
  attempts: number | null;
  error: ClerkAPIError | null;
  expireAt: Date | null;
  externalVerificationRedirectURL: URL | null;
  nonce: string | null;
  status: VerificationStatus | null;
  strategy: string | null;
  verifiedAtClient: string | null;
  verifiedFromTheSameClient: () => boolean;
}

export type VerificationStatus =
  | 'unverified'
  | 'verified'
  | 'transferable'
  | 'failed'
  | 'expired';

export interface CodeVerificationAttemptParam {
  code: string;
  signature?: never;
}

export interface SignatureVerificationAttemptParam {
  code?: never;
  signature: string;
}

export type VerificationAttemptParams =
  | CodeVerificationAttemptParam
  | SignatureVerificationAttemptParam;

export interface StartMagicLinkFlowParams {
  redirectUrl?: string;
  // DX: Deprecated v2.4.4
  /**
   * @deprecated Use {@link StartMagicLinkFlowParams.redirectUrl} instead.
   */
  callbackUrl?: string;
}

export type CreateMagicLinkFlowReturn<Params, Resource> = {
  startMagicLinkFlow: (params: Params) => Promise<Resource>;
  cancelMagicLinkFlow: () => void;
};
