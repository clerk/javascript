import { type TokenCarrier } from './authState';

export enum TokenVerificationErrorReason {
  TokenInvalid = 'token-invalid',
  TokenExpired = 'token-expired',
  TokenNotActiveYet = 'token-not-active-yet',
  TokenVerificationFailed = 'token-verification-failed',

  LocalJWKMissing = 'jwk-local-missing',

  RemoteJWKFailedToLoad = 'jwk-remote-failed-to-load',
  RemoteJWKInvalid = 'jwk-remote-invalid',
  RemoteJWKMissing = 'jwk-remote-missing',

  JWKFailedToResolve = 'jwk-failed-to-resolve',

  RemoteInterstitialFailedToLoad = 'interstitial-remote-failed-to=load',
}

export enum TokenVerificationErrorAction {
  ContactSupport = 'Contact support@clerk.dev',
  SetClerkJWTKey = 'Set the CLERK_JWT_KEY environment variable.',
  setClerkAPIKey = 'Set the CLERK_API_KEY environment variable.',
}

export class TokenVerificationError extends Error {
  action?: TokenVerificationErrorAction;
  reason: TokenVerificationErrorReason;
  tokenCarrier?: TokenCarrier;

  constructor({
    action,
    message,
    reason,
  }: {
    action?: TokenVerificationErrorAction;
    message: string;
    reason: TokenVerificationErrorReason;
  }) {
    super(message);

    Object.setPrototypeOf(this, TokenVerificationError.prototype);

    this.reason = reason;
    this.message = message;
    this.action = action;
  }

  public getFullMessage() {
    return `${[this.message, this.action].filter(m => m).join(' ')} (reason=${this.reason}, token-carrier=${
      this.tokenCarrier
    })`;
  }
}
