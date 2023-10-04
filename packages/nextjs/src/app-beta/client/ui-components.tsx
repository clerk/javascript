'use client';
import { deprecated } from '@clerk/shared';

deprecated(
  '@clerk/nextjs/app-beta',
  'Use imports from `@clerk/nextjs` instead.\nFor more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware',
);

export {
  CreateOrganization,
  OrganizationProfile,
  OrganizationSwitcher,
  SignIn,
  SignUp,
  UserButton,
  UserProfile,
} from '@clerk/clerk-react';
