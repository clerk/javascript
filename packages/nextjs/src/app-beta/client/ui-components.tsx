'use client';
import {
  CreateOrganization as _CreateOrganization,
  OrganizationProfile as _OrganizationProfile,
  OrganizationSwitcher as _OrganizationSwitcher,
  SignIn as _SignIn,
  SignUp as _SignUp,
  UserButton as _UserButton,
  UserProfile as _UserProfile,
} from '@clerk/clerk-react';
import { deprecated } from '@clerk/shared/deprecated';

deprecated(
  '@clerk/nextjs/app-beta',
  'Use imports from `@clerk/nextjs` instead.\nFor more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware',
);

/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const CreateOrganization = _CreateOrganization;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const OrganizationProfile: typeof _OrganizationProfile = _OrganizationProfile;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const OrganizationSwitcher: typeof _OrganizationSwitcher = _OrganizationSwitcher;
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
export const UserButton: typeof _UserButton = _UserButton;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const UserProfile: typeof _UserProfile = _UserProfile;
