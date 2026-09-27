import { errorThrower } from '../errorThrower';
import type { ClerkExpoNativeModule } from './loadClerkExpoNative';
import { loadClerkExpoNative } from './loadClerkExpoNative';

// Public types are declared in native/index.d.ts, which re-exports them from @clerk/expo-native.

const CLERK_EXPO_NATIVE_MISSING_MESSAGE =
  'Native components have moved to the @clerk/expo-native package. ' +
  'Install it with `npx expo install @clerk/expo-native`, add "@clerk/expo-native" to the plugins array in your app config, ' +
  'then rebuild your native app. You can then import them from "@clerk/expo-native".';

const clerkExpoNative = loadClerkExpoNative();

function resolveExport<K extends keyof ClerkExpoNativeModule>(name: K) {
  return (
    clerkExpoNative?.[name] ??
    function ClerkExpoNativeMissing(): never {
      return errorThrower.throw(`\`${name}\` is unavailable. ${CLERK_EXPO_NATIVE_MISSING_MESSAGE}`);
    }
  );
}

export const AuthView = resolveExport('AuthView');
export const UserButton = resolveExport('UserButton');
export const UserProfileView = resolveExport('UserProfileView');
export const useAuthViewState = resolveExport('useAuthViewState');
export const useUserProfileCustomPageNavigation = resolveExport('useUserProfileCustomPageNavigation');
