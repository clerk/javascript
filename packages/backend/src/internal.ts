export { constants } from './constants';
export { createRedirect } from './createRedirect';
export type { RedirectFun } from './createRedirect';

export type { CreateAuthenticateRequestOptions } from './tokens/factory';
export { createAuthenticateRequest } from './tokens/factory';

export { debugRequestState } from './tokens/request';

export type {
  AuthenticateRequestOptions,
  OrganizationSyncOptions,
  InferAuthObjectFromToken,
  InferAuthObjectFromTokenArray,
  GetAuthFn,
  AuthOptions,
  GetAuthFnNoRequest,
} from './tokens/types';

export { TokenType } from './tokens/tokenTypes';
export type { SessionTokenType, MachineTokenType } from './tokens/tokenTypes';

export type {
  SignedInAuthObjectOptions,
  SignedInAuthObject,
  SignedOutAuthObject,
  AuthenticatedMachineObject,
  UnauthenticatedMachineObject,
} from './tokens/authObjects';
export {
  makeAuthObjectSerializable,
  signedOutAuthObject,
  signedInAuthObject,
  authenticatedMachineObject,
  unauthenticatedMachineObject,
  invalidTokenAuthObject,
  getAuthObjectFromJwt,
  getAuthObjectForAcceptedToken,
} from './tokens/authObjects';

export { AuthStatus } from './tokens/authStatus';
export type {
  RequestState,
  SignedInState,
  SignedOutState,
  AuthenticatedState,
  UnauthenticatedState,
} from './tokens/authStatus';

export { decorateObjectWithResources, stripPrivateDataFromObject } from './util/decorateObjectWithResources';

export { createClerkRequest } from './tokens/clerkRequest';
export type { ClerkRequest } from './tokens/clerkRequest';

export { reverificationError, reverificationErrorResponse } from '@clerk/shared/authorization-errors';

export { verifyMachineAuthToken } from './tokens/verify';

export { isMachineTokenByPrefix, isMachineTokenType, getMachineTokenType, isTokenTypeAccepted } from './tokens/machine';
