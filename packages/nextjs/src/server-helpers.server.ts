import { auth } from './app-router/server/auth';
import { currentUser } from './app-router/server/currentUser';
import { authMiddleware } from './server/authMiddleware';
import { clerkClient } from './server/clerkClient';
import { getAuth } from './server/getAuth';
import { redirectToSignIn, redirectToSignUp } from './server/redirect';

export { auth, authMiddleware, clerkClient, currentUser, getAuth, redirectToSignIn, redirectToSignUp };

export type ServerHelpersServerModuleTypes = {
  auth: typeof auth;
  currentUser: typeof currentUser;
  authMiddleware: typeof authMiddleware;
  getAuth: typeof getAuth;
  clerkClient: typeof clerkClient;
  redirectToSignIn: typeof redirectToSignIn;
  redirectToSignUp: typeof redirectToSignUp;
};
