import { ClerkDynamicProvider } from './app-router/server/ClerkDynamicProvider';
import { ClerkProvider } from './app-router/server/ClerkProvider';
import { Protect, SignedIn, SignedOut } from './app-router/server/controlComponents';

export { ClerkProvider, SignedOut, SignedIn, Protect, ClerkDynamicProvider };

export type ServerComponentsServerModuleTypes = {
  ClerkProvider: typeof ClerkProvider;
  SignedIn: typeof SignedIn;
  SignedOut: typeof SignedOut;
  Protect: typeof Protect;
  ClerkDynamicProvider: typeof ClerkDynamicProvider;
};
