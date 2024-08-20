import { ClerkProvider } from './app-router/server/ClerkProvider';
import { Protect, protect, SignedIn, SignedOut } from './app-router/server/controlComponents';

export { ClerkProvider, SignedOut, SignedIn, Protect, protect };

export type ServerComponentsServerModuleTypes = {
  ClerkProvider: typeof ClerkProvider;
  SignedIn: typeof SignedIn;
  SignedOut: typeof SignedOut;
  Protect: typeof Protect;
  protect: typeof protect;
};
