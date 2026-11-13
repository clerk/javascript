type ClerkExpoNativeExport = (...args: never[]) => unknown;

export type ClerkExpoNativeModule = Partial<
  Record<'AuthView' | 'UserButton' | 'UserProfileView' | 'useUserProfileCustomPageNavigation', ClerkExpoNativeExport>
>;

export function loadClerkExpoNative(): ClerkExpoNativeModule | null {
  try {
    // Synchronous require() in try/catch so Metro treats @clerk/expo-native-components as an optional dependency.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@clerk/expo-native-components') as ClerkExpoNativeModule;
  } catch {
    return null;
  }
}
