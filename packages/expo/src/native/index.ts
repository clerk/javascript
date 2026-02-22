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
 * - {@link AuthView} - Authentication flow (sign-in/sign-up)
 * - {@link UserProfileView} - User profile and account management
 * - {@link UserButton} - Avatar button that opens profile
 *
 * ## Usage with JS SDK
 *
 * After authenticating with native components, all `@clerk/expo` hooks work normally:
 *
 * ```tsx
 * import { AuthView } from '@clerk/expo/native';
 * import { useUser, useOrganization } from '@clerk/expo';
 *
 * function App() {
 *   const { user } = useUser();
 *   const { organization } = useOrganization();
 *
 *   if (!user) {
 *     return <AuthView onSuccess={() => console.log('Ready!')} />;
 *   }
 *
 *   // All JS SDK APIs available after native auth
 *   return <Dashboard />;
 * }
 * ```
 *
 * @module @clerk/expo/native
 */

export { AuthView } from './AuthView';
export type { AuthViewProps, AuthViewMode } from './AuthView.types';
export { InlineAuthView } from './InlineAuthView';
export type { InlineAuthViewProps } from './InlineAuthView';
export { InlineUserProfileView } from './InlineUserProfileView';
export type { InlineUserProfileViewProps } from './InlineUserProfileView';
export { UserButton } from './UserButton';
export type { UserButtonProps } from './UserButton';
export { UserProfileView } from './UserProfileView';
export type { UserProfileViewProps } from './UserProfileView';
