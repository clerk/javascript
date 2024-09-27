import { ClerkProvider } from './app-router/server/ClerkProvider';
import {
  defineProtectParams,
  Protect,
  protect,
  protectComponent,
  SignedIn,
  SignedOut,
} from './app-router/server/controlComponents';

export { ClerkProvider, SignedOut, SignedIn, Protect, protect, defineProtectParams, protectComponent };

export type ServerComponentsServerModuleTypes = {
  ClerkProvider: typeof ClerkProvider;
  SignedIn: typeof SignedIn;
  SignedOut: typeof SignedOut;
  Protect: typeof Protect;
  protect: typeof protect;
  defineProtectParams: typeof defineProtectParams;
  protectComponent: typeof protectComponent;
};
