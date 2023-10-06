import { deprecated } from '@clerk/shared';

deprecated(
  '@clerk/nextjs/app-beta',
  'Use imports from `@clerk/nextjs` instead.\nFor more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware',
);

export { auth } from './auth';
export { currentUser } from './currentUser';
export { ClerkProvider } from './ClerkProvider';
export { SignedIn, SignedOut } from './control-components';
export {
  UserButton,
  SignUp,
  SignIn,
  OrganizationProfile,
  CreateOrganization,
  OrganizationSwitcher,
  UserProfile,
} from './client/ui-components';
export { clerkClient } from './clerkClient';
