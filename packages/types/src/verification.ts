import type { ClerkAPIError } from './errors';
import type { PublicKeyCredentialCreationOptionsWithoutExtensions } from './passkey';
import type { PhoneCodeChannel } from './phoneCodeChannel';
import type { ClerkResource } from './resource';
import type { VerificationJSONSnapshot } from './snapshots';

export interface VerificationResource extends ClerkResource {
  attempts: number | null;
  error: ClerkAPIError | null;
  expireAt: Date | null;
  externalVerificationRedirectURL: URL | null;
  nonce: string | null;
  message: string | null;
  status: VerificationStatus | null;
  strategy: string | null;
  verifiedAtClient: string | null;
  verifiedFromTheSameClient: () => boolean;
  channel?: PhoneCodeChannel;
  __internal_toSnapshot: () => VerificationJSONSnapshot;
}

export interface PasskeyVerificationResource extends VerificationResource {
  publicKey: PublicKeyCredentialCreationOptionsWithoutExtensions | null;
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

export interface StartEnterpriseSSOLinkFlowParams {
  redirectUrl: string;
}

export type CreateEnterpriseSSOLinkFlowReturn<Params, Resource> = {
  startEnterpriseSSOLinkFlow: (params: Params) => Promise<Resource>;
  cancelEnterpriseSSOLinkFlow: () => void;
};
