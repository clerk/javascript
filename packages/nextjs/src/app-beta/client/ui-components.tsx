'use client';
import { deprecated } from '@clerk/shared';

deprecated(
  '@clerk/nextjs/app-beta',
  'Use imports from `@clerk/nextjs` instead.\nFor more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware',
);

import {
  CreateOrganization as _CreateOrganization,
  OrganizationProfile as _OrganizationProfile,
  OrganizationSwitcher as _OrganizationSwitcher,
  SignIn as _SignIn,
  SignUp as _SignUp,
  UserButton as _UserButton,
  UserProfile as _UserProfile,
} from '@clerk/clerk-react';

/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const CreateOrganization = _CreateOrganization;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const OrganizationProfile = _OrganizationProfile;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const OrganizationSwitcher = _OrganizationSwitcher;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const SignIn = _SignIn;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const SignUp = _SignUp;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const UserButton = _UserButton;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const UserProfile = _UserProfile;
