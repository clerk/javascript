import { ClerkProvider } from './app-router/server/ClerkProvider';
import { __experimental_protectComponent, Protect, SignedIn, SignedOut } from './app-router/server/controlComponents';

export { ClerkProvider, SignedOut, SignedIn, Protect, __experimental_protectComponent };

export type ServerComponentsServerModuleTypes = {
  ClerkProvider: typeof ClerkProvider;
  SignedIn: typeof SignedIn;
  SignedOut: typeof SignedOut;
  Protect: typeof Protect;
  __experimental_protectComponent: typeof __experimental_protectComponent;
};
