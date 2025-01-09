export { constants } from './constants';
export { createRedirect } from './createRedirect';
export type { RedirectFun } from './createRedirect';

export type { CreateAuthenticateRequestOptions } from './tokens/factory';
export { createAuthenticateRequest } from './tokens/factory';

export { debugRequestState } from './tokens/request';

export type { AuthenticateRequestOptions, OrganizationSyncOptions } from './tokens/types';

<<<<<<< HEAD
export type { SignedInAuthObjectOptions, SignedInAuthObject, SignedOutAuthObject } from './tokens/authObjects';
=======
export type {
  SignedInAuthObjectOptions,
  SignedInAuthObject,
  SignedOutAuthObject,
  UnauthenticatedMachineObject,
  AuthenticatedMachineObject,
} from './tokens/authObjects';
>>>>>>> 24e3ef125 (auth function changes)
export {
  makeAuthObjectSerializable,
  signedOutAuthObject,
  signedInAuthObject,
  unauthenticatedMachineObject,
  authenticatedMachineObject,
} from './tokens/authObjects';

export { AuthStatus } from './tokens/authStatus';
export type {
  RequestState,
  SignedInState,
  SignedOutState,
  MachineAuthenticatedState,
  MachineUnauthenticatedState,
} from './tokens/authStatus';

export { decorateObjectWithResources, stripPrivateDataFromObject } from './util/decorateObjectWithResources';

export { createClerkRequest } from './tokens/clerkRequest';
export type { ClerkRequest } from './tokens/clerkRequest';

export { reverificationError, reverificationErrorResponse } from '@clerk/shared/authorization-errors';
