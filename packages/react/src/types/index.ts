/**
 * Re-exports all types from @clerk/shared/types along with React-specific types.
 * This allows consumers to import types from @clerk/react/types instead of
 * installing @clerk/types separately.
 */

// Re-export all shared types
export type * from '@clerk/shared/types';

// React-specific types from this package
export type {
  ClerkProviderProps,
  CustomPortalsRendererProps,
  MountProps,
  OpenProps,
  OrganizationProfileLinkProps,
  OrganizationProfilePageProps,
  RedirectToSignInProps,
  RedirectToSignUpProps,
  RedirectToTasksProps,
  SignInWithMetamaskButtonProps,
  UserButtonActionProps,
  UserButtonLinkProps,
  UserProfileLinkProps,
  UserProfilePageProps,
  WithClerkProp,
} from '../types';

export type { ShowProps } from '../components/controlComponents';
