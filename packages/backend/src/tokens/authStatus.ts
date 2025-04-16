import type { JwtPayload } from '@clerk/types';

import { constants } from '../constants';
import type { TokenVerificationErrorReason } from '../errors';
import type { AuthenticateContext } from './authenticateContext';
import type {
  AuthenticatedMachineObject,
  SignedInAuthObject,
  SignedOutAuthObject,
  UnauthenticatedMachineObject,
} from './authObjects';
import {
  authenticatedMachineObject,
  signedInAuthObject,
  signedOutAuthObject,
  unauthenticatedMachineObject,
} from './authObjects';
import type { MachineAuthType, TokenEntity } from './types';

export const AuthStatus = {
  SignedIn: 'signed-in',
  SignedOut: 'signed-out',
  Handshake: 'handshake',
} as const;

export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];

type ToAuthOptions = {
  accept?: TokenEntity | 'any';
};

type ToAuthReturn<T extends ToAuthOptions | undefined, UserAuth, MachineAuth> = T extends { accept: infer E }
  ? E extends 'any'
    ? UserAuth | MachineAuth
    : E extends 'user' | undefined
      ? UserAuth
      : MachineAuth
  : UserAuth;

export type SignedInState = {
  status: typeof AuthStatus.SignedIn;
  reason: null;
  message: null;
  proxyUrl?: string;
  publishableKey: string;
  isSatellite: boolean;
  domain: string;
  signInUrl: string;
  signUpUrl: string;
  afterSignInUrl: string;
  afterSignUpUrl: string;
  isSignedIn: true;
  tokenType: TokenEntity;
  toAuth: <T extends ToAuthOptions | undefined>(
    options?: T,
  ) => ToAuthReturn<T, SignedInAuthObject, AuthenticatedMachineObject>;
  headers: Headers;
  token: string;
};

export type SignedOutState = {
  status: typeof AuthStatus.SignedOut;
  message: string;
  reason: AuthReason;
  proxyUrl?: string;
  publishableKey: string;
  isSatellite: boolean;
  domain: string;
  signInUrl: string;
  signUpUrl: string;
  afterSignInUrl: string;
  afterSignUpUrl: string;
  isSignedIn: false;
  tokenType: TokenEntity;
  toAuth: <T extends ToAuthOptions | undefined>(
    options?: T,
  ) => ToAuthReturn<T, SignedOutAuthObject, UnauthenticatedMachineObject>;
  headers: Headers;
  token: null;
};

export type HandshakeState = Omit<SignedOutState, 'status' | 'toAuth' | 'tokenType'> & {
  tokenType: 'user';
  status: typeof AuthStatus.Handshake;
  headers: Headers;
  toAuth: () => null;
};

export const AuthErrorReason = {
  ClientUATWithoutSessionToken: 'client-uat-but-no-session-token',
  DevBrowserMissing: 'dev-browser-missing',
  DevBrowserSync: 'dev-browser-sync',
  PrimaryRespondsToSyncing: 'primary-responds-to-syncing',
  SatelliteCookieNeedsSyncing: 'satellite-needs-syncing',
  SessionTokenAndUATMissing: 'session-token-and-uat-missing',
  SessionTokenMissing: 'session-token-missing',
  SessionTokenExpired: 'session-token-expired',
  SessionTokenIATBeforeClientUAT: 'session-token-iat-before-client-uat',
  SessionTokenNBF: 'session-token-nbf',
  SessionTokenIatInTheFuture: 'session-token-iat-in-the-future',
  SessionTokenWithoutClientUAT: 'session-token-but-no-client-uat',
  ActiveOrganizationMismatch: 'active-organization-mismatch',
  UnexpectedError: 'unexpected-error',
} as const;

export type AuthErrorReason = (typeof AuthErrorReason)[keyof typeof AuthErrorReason];

export type AuthReason = AuthErrorReason | TokenVerificationErrorReason;

export type RequestState = SignedInState | SignedOutState | HandshakeState;

type BaseSignedInParams = {
  authenticateContext: AuthenticateContext;
  headers?: Headers;
  token: string;
  entity?: TokenEntity;
};

type SignedInParams = BaseSignedInParams &
  (
    | {
        entity: 'user';
        sessionClaims: JwtPayload;
      }
    | {
        entity: Exclude<TokenEntity, 'user'>;
        machineData: MachineAuthType;
      }
  );

export function signedIn(params: SignedInParams): SignedInState {
  const { authenticateContext, headers = new Headers(), token, entity = 'user' } = params;

  // We need to assert type because TS can't infer that our runtime logic
  // matches the conditional type pattern.
  const toAuth = (<T extends ToAuthOptions | undefined>(options?: T) => {
    const targetEntity = options?.accept || 'user';

    // If targetEntity is 'any', return the current auth object without conversion
    if (targetEntity === 'any') {
      if (params.entity === 'user') {
        const { sessionClaims } = params;
        return signedInAuthObject(authenticateContext, token, sessionClaims);
      }
      const { machineData } = params;
      return authenticatedMachineObject(params.entity, token, machineData, authenticateContext);
    }

    // For specific entity types, validate they match
    if (targetEntity !== params.entity) {
      return signedOutAuthObject({
        ...authenticateContext,
        status: AuthStatus.SignedOut,
        reason: AuthErrorReason.UnexpectedError,
        message: `Cannot convert ${params.entity} token to ${targetEntity} token.`,
      });
    }

    if (targetEntity === 'user') {
      const { sessionClaims } = params as { sessionClaims: JwtPayload };
      return signedInAuthObject(authenticateContext, token, sessionClaims);
    }

    const { machineData } = params as { machineData: MachineAuthType };
    return authenticatedMachineObject(targetEntity, token, machineData, authenticateContext);
  }) as SignedInState['toAuth'];

  return {
    status: AuthStatus.SignedIn,
    reason: null,
    message: null,
    proxyUrl: authenticateContext.proxyUrl || '',
    publishableKey: authenticateContext.publishableKey || '',
    isSatellite: authenticateContext.isSatellite || false,
    domain: authenticateContext.domain || '',
    signInUrl: authenticateContext.signInUrl || '',
    signUpUrl: authenticateContext.signUpUrl || '',
    afterSignInUrl: authenticateContext.afterSignInUrl || '',
    afterSignUpUrl: authenticateContext.afterSignUpUrl || '',
    isSignedIn: true,
    tokenType: entity,
    toAuth,
    headers,
    token,
  };
}

type SignedOutParams = Omit<BaseSignedInParams, 'token'> & {
  reason: AuthReason;
  message?: string;
};

export function signedOut(params: SignedOutParams): SignedOutState {
  const { authenticateContext, headers = new Headers(), entity = 'user', reason, message = '' } = params;

  // We need to assert type because TS can't infer that our runtime logic
  // matches the conditional type pattern.
  const toAuth = (<T extends ToAuthOptions | undefined>(options?: T) => {
    const targetEntity = options?.accept || 'user';

    // If targetEntity is 'any', return based on current entity type
    if (targetEntity === 'any') {
      if (entity === 'user') {
        return signedOutAuthObject({ ...authenticateContext, status: AuthStatus.SignedOut, reason, message });
      }
      return unauthenticatedMachineObject(entity, { reason, message, headers });
    }

    // For specific entity types, validate they match
    if (targetEntity !== entity) {
      return signedOutAuthObject({
        ...authenticateContext,
        status: AuthStatus.SignedOut,
        reason: AuthErrorReason.UnexpectedError,
        message: `Cannot convert ${entity} token to ${targetEntity} token.`,
      });
    }

    if (targetEntity === 'user') {
      return signedOutAuthObject({ ...authenticateContext, status: AuthStatus.SignedOut, reason, message });
    }

    return unauthenticatedMachineObject(targetEntity, { reason, message, headers });
  }) as SignedOutState['toAuth'];

  return withDebugHeaders({
    status: AuthStatus.SignedOut,
    reason,
    message,
    proxyUrl: authenticateContext.proxyUrl || '',
    publishableKey: authenticateContext.publishableKey || '',
    isSatellite: authenticateContext.isSatellite || false,
    domain: authenticateContext.domain || '',
    signInUrl: authenticateContext.signInUrl || '',
    signUpUrl: authenticateContext.signUpUrl || '',
    afterSignInUrl: authenticateContext.afterSignInUrl || '',
    afterSignUpUrl: authenticateContext.afterSignUpUrl || '',
    isSignedIn: false,
    tokenType: entity,
    headers,
    toAuth,
    token: null,
  });
}

export function handshake(
  authenticateContext: AuthenticateContext,
  reason: AuthReason,
  message = '',
  headers: Headers,
): HandshakeState {
  return withDebugHeaders({
    status: AuthStatus.Handshake,
    reason,
    message,
    publishableKey: authenticateContext.publishableKey || '',
    isSatellite: authenticateContext.isSatellite || false,
    domain: authenticateContext.domain || '',
    proxyUrl: authenticateContext.proxyUrl || '',
    signInUrl: authenticateContext.signInUrl || '',
    signUpUrl: authenticateContext.signUpUrl || '',
    afterSignInUrl: authenticateContext.afterSignInUrl || '',
    afterSignUpUrl: authenticateContext.afterSignUpUrl || '',
    isSignedIn: false,
    tokenType: 'user',
    headers,
    toAuth: () => null,
    token: null,
  });
}

const withDebugHeaders = <T extends RequestState>(requestState: T): T => {
  const headers = new Headers(requestState.headers || {});

  if (requestState.message) {
    try {
      headers.set(constants.Headers.AuthMessage, requestState.message);
    } catch {
      // headers.set can throw if unicode strings are passed to it. In this case, simply do nothing
    }
  }

  if (requestState.reason) {
    try {
      headers.set(constants.Headers.AuthReason, requestState.reason);
    } catch {
      /* empty */
    }
  }

  if (requestState.status) {
    try {
      headers.set(constants.Headers.AuthStatus, requestState.status);
    } catch {
      /* empty */
    }
  }

  requestState.headers = headers;

  return requestState;
};
