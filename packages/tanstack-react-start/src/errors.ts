import { warnPackageRenaming } from './utils/errors';

warnPackageRenaming();

export {
  isClerkAPIResponseError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
  isReverificationCancelledError,
  EmailLinkErrorCode,
  EmailLinkErrorCodeStatus,
} from '@clerk/clerk-react/errors';
