import { ClerkProvider } from './app-router/server/ClerkProvider';
import { SignedIn, SignedOut } from './app-router/server/controlComponents';

export { ClerkProvider, SignedOut, SignedIn };

export type ServerComponentsServerModuleTypes = {
  ClerkProvider: typeof ClerkProvider;
  SignedIn: typeof SignedIn;
  SignedOut: typeof SignedOut;
};
