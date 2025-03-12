import { warnPackageRenaming } from './utils/errors';

warnPackageRenaming();

export {
  isClerkAPIResponseError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
  EmailLinkErrorCode,
  EmailLinkErrorCodeStatus,
} from '@clerk/clerk-react/errors';
