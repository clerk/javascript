export type TokenCarrier = 'header' | 'cookie';

export enum TokenVerificationErrorCode {
  InvalidSecretKey = 'clerk_key_invalid',
}

export enum TokenVerificationErrorReason {
  TokenExpired = 'token-expired',
  TokenInvalid = 'token-invalid',
  TokenInvalidAlgorithm = 'token-invalid-algorithm',
  TokenInvalidAuthorizedParties = 'token-invalid-authorized-parties',
  TokenInvalidIssuer = 'token-invalid-issuer',
  TokenInvalidSignature = 'token-invalid-signature',
  TokenNotActiveYet = 'token-not-active-yet',
  TokenVerificationFailed = 'token-verification-failed',
  InvalidSecretKey = 'secret-key-invalid',

  LocalJWKMissing = 'jwk-local-missing',

  RemoteJWKFailedToLoad = 'jwk-remote-failed-to-load',
  RemoteJWKInvalid = 'jwk-remote-invalid',
  RemoteJWKMissing = 'jwk-remote-missing',

  JWKFailedToResolve = 'jwk-failed-to-resolve',

  RemoteInterstitialFailedToLoad = 'interstitial-remote-failed-to-load',
}

export enum TokenVerificationErrorAction {
  ContactSupport = 'Contact support@clerk.com',
  EnsureClerkJWT = 'Make sure that this is a valid Clerk generate JWT.',
  SetClerkJWTKey = 'Set the CLERK_JWT_KEY environment variable.',
  SetClerkSecretKey = 'Set the CLERK_SECRET_KEY environment variable.',
  EnsureClockSync = 'Make sure your system clock is in sync (e.g. turn off and on automatic time synchronization).',
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
