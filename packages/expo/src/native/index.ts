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
 * - {@link AuthView} - Authentication flow (sign-in/sign-up), supports `presentation="modal"` (default) or `presentation="inline"`
 * - {@link UserProfileView} - User profile and account management, supports `presentation="modal"` (default) or `presentation="inline"`
 * - {@link UserButton} - Avatar button that opens profile
 *
 * @module @clerk/expo/native
 */

export { AuthView } from './AuthView';
export type { AuthViewProps, AuthViewMode } from './AuthView.types';
export { UserButton } from './UserButton';
export type { UserButtonProps } from './UserButton';
export { UserProfileView } from './UserProfileView';
export type { UserProfileViewProps } from './UserProfileView';
