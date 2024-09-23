import { ClerkProvider } from './app-router/server/ClerkProvider';
import { defineProtectParams, Protect, protect, SignedIn, SignedOut } from './app-router/server/controlComponents';

export { ClerkProvider, SignedOut, SignedIn, Protect, protect, defineProtectParams };

export type ServerComponentsServerModuleTypes = {
  ClerkProvider: typeof ClerkProvider;
  SignedIn: typeof SignedIn;
  SignedOut: typeof SignedOut;
  Protect: typeof Protect;
  protect: typeof protect;
  defineProtectParams: typeof defineProtectParams;
};
