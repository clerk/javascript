import type { ClerkAPIError } from './api';
import type { ClerkResource } from './resource';

export interface VerificationResource extends ClerkResource {
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

export type VerificationStatus = 'unverified' | 'verified' | 'transferable' | 'failed' | 'expired';

export interface CodeVerificationAttemptParam {
  code: string;
  signature?: never;
}

export interface SignatureVerificationAttemptParam {
  code?: never;
  signature: string;
}

export type VerificationAttemptParams = CodeVerificationAttemptParam | SignatureVerificationAttemptParam;

/**
 * @deprecated Use `StarEmailLinkFlowParams` instead.
 */
export interface StartMagicLinkFlowParams {
  redirectUrl: string;
}

export interface StartEmailLinkFlowParams {
  redirectUrl: string;
}

/**
 * @deprecated Use `CreateEmailLinkFlowReturn` instead.
 */
export type CreateMagicLinkFlowReturn<Params, Resource> = {
  startMagicLinkFlow: (params: Params) => Promise<Resource>;
  cancelMagicLinkFlow: () => void;
};

export type CreateEmailLinkFlowReturn<Params, Resource> = {
  startEmailLinkFlow: (params: Params) => Promise<Resource>;
  cancelEmailLinkFlow: () => void;
};
