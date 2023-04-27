import { auth } from './app-router/server/auth';
import { currentUser } from './app-router/server/currentUser';
import { authMiddleware } from './server/authMiddleware';
import { clerkClient } from './server/clerkClient';
import { getAuth } from './server/getAuth';
import { withClerkMiddleware } from './server/withClerkMiddleware';

export { auth, currentUser, authMiddleware, getAuth, clerkClient, withClerkMiddleware };

export type ServerHelpersServerModuleTypes = {
  auth: typeof auth;
  currentUser: typeof currentUser;
  authMiddleware: typeof authMiddleware;
  getAuth: typeof getAuth;
  clerkClient: typeof clerkClient;
  withClerkMiddleware: typeof withClerkMiddleware;
};
