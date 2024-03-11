import type { ClerkAPIError } from './api';
import type { __experimental_PublicKeyCredentialCreationOptionsWithoutExtensions } from './passkey';
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

export interface PasskeyVerificationResource extends VerificationResource {
  publicKey: __experimental_PublicKeyCredentialCreationOptionsWithoutExtensions | null;
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

export interface StartEmailLinkFlowParams {
  redirectUrl: string;
}

export type CreateEmailLinkFlowReturn<Params, Resource> = {
  startEmailLinkFlow: (params: Params) => Promise<Resource>;
  cancelEmailLinkFlow: () => void;
};
