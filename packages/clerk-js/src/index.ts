import 'regenerator-runtime/runtime';

import { Clerk } from './core/clerk';
import { mountComponentRenderer } from './ui/Components';

export {
  ClerkAPIResponseError,
  ClerkRuntimeError,
  EmailLinkError,
  EmailLinkErrorCode,
  EmailLinkErrorCodeStatus,
  isClerkAPIResponseError,
  isClerkRuntimeError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
  isUserLockedError,
  type MetamaskError,
} from '@clerk/shared/error';
export { Clerk };

Clerk.mountComponentRenderer = mountComponentRenderer;

if (module.hot) {
  module.hot.accept();
}
