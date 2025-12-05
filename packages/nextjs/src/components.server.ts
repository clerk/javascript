import { ClerkProvider } from './app-router/server/ClerkProvider';
import { Protect, Show, SignedIn, SignedOut } from './app-router/server/controlComponents';

export { ClerkProvider, Protect, Show, SignedIn, SignedOut };

export type ServerComponentsServerModuleTypes = {
  ClerkProvider: typeof ClerkProvider;
  Protect: typeof Protect;
  Show: typeof Show;
  SignedIn: typeof SignedIn;
  SignedOut: typeof SignedOut;
};
