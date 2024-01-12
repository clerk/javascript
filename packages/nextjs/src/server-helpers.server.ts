import { auth } from './app-router/server/auth';
import { currentUser } from './app-router/server/currentUser';
import { authMiddleware } from './server/authMiddleware';
import { clerkClient } from './server/clerkClient';
import { getAuth } from './server/createGetAuth';
import { redirectToSignIn, redirectToSignUp } from './server/redirect';
import { withClerkMiddleware } from './server/withClerkMiddleware';

export {
  auth,
  currentUser,
  authMiddleware,
  getAuth,
  clerkClient,
  withClerkMiddleware,
  redirectToSignIn,
  redirectToSignUp,
};

export type ServerHelpersServerModuleTypes = {
  auth: typeof auth;
  currentUser: typeof currentUser;
  authMiddleware: typeof authMiddleware;
  getAuth: typeof getAuth;
  clerkClient: typeof clerkClient;
  withClerkMiddleware: typeof withClerkMiddleware;
  redirectToSignIn: typeof redirectToSignIn;
  redirectToSignUp: typeof redirectToSignUp;
};
