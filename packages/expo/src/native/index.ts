/**
 * Native UI components for Clerk authentication in Expo apps.
 *
 * These components provide pre-built, native authentication experiences powered by:
 * - **iOS**: clerk-ios (SwiftUI) - https://github.com/clerk/clerk-ios
 * - **Android**: clerk-android (Jetpack Compose) - https://github.com/clerk/clerk-android
 *
 * ## Installation
 *
 * Native components require the `@clerk/expo` plugin to be configured in your `app.json`:
 *
 * ```json
 * {
 *   "expo": {
 *     "plugins": ["@clerk/expo"]
 *   }
 * }
 * ```
 *
 * Then run `npx expo prebuild` to generate native code.
 *
 * ## Components
 *
 * - {@link AuthView} - Authentication flow (sign-in/sign-up), renders inline
 * - {@link UserProfileView} - User profile and account management, renders inline
 * - {@link UserButton} - Avatar button that opens the native user profile
 *
 * @module @clerk/expo/native
 */

export { AuthView } from './AuthView';
export type { AuthViewProps, AuthViewMode } from './AuthView.types';
export type { EmbeddedNavigationProps } from './EmbeddedNavigation.types';
export { useAuthViewState } from './useAuthViewState';
export type { UseAuthViewStateReturn } from './useAuthViewState';
export { UserButton } from './UserButton';
export type { UserButtonProps, UserButtonUserProfileProps } from './UserButton';
export { useUserProfileCustomPageNavigation } from './UserProfileCustomPages';
export type {
  UserProfileCustomPageNavigation,
  UserProfileCustomDestination,
  UserProfileCustomPage,
  UserProfileCustomPageIcon,
  UserProfileCustomPagePlacement,
  UserProfileRow,
  UserProfileSection,
} from './UserProfileCustomPages';
export { UserProfileView } from './UserProfileView';
export type { UserProfileViewProps } from './UserProfileView';
