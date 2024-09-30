import { ClerkProvider } from './app-router/server/ClerkProvider';
import {
  // protect,
  __experimental_protectComponent,
  defineProtectParams,
  Protect,
  SignedIn,
  SignedOut,
} from './app-router/server/controlComponents';

export {
  ClerkProvider,
  SignedOut,
  SignedIn,
  Protect,
  // protect,
  defineProtectParams,
  __experimental_protectComponent,
};

export type ServerComponentsServerModuleTypes = {
  ClerkProvider: typeof ClerkProvider;
  SignedIn: typeof SignedIn;
  SignedOut: typeof SignedOut;
  Protect: typeof Protect;
  // protect: typeof protect;
  defineProtectParams: typeof defineProtectParams;
  __experimental_protectComponent: typeof __experimental_protectComponent;
};
