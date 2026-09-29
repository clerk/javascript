import type { useClerk } from '@clerk/react';

import { synchronizeNativeClientToJs, waitForPendingJsToNativeSync } from '../provider/nativeClientSyncCoordinator';
import { errorThrower } from '../utils/errors';
import { ClerkExpoModule } from '../utils/native-module';
import type { UseBiometricCredentialsReturn } from './types';

const CLERK_EXPO_NATIVE_INSTALL_INSTRUCTIONS =
  'Install it with `npx expo install @clerk/expo-native-components`, add "@clerk/expo-native-components" to the plugins array in your app config, then rebuild your development build.';

export function createNativeReverify(clerk: ReturnType<typeof useClerk>): UseBiometricCredentialsReturn['reverify'] {
  return async params => {
    const nativeModule = ClerkExpoModule;
    if (!nativeModule) {
      return errorThrower.throw(
        `Biometric reverification requires the @clerk/expo-native-components package in a development build. ${CLERK_EXPO_NATIVE_INSTALL_INSTRUCTIONS}`,
      );
    }
    if (typeof nativeModule.reverifyWithBiometrics !== 'function') {
      return errorThrower.throw(
        'Biometric reverification requires a development build containing a compatible version of @clerk/expo-native-components.',
      );
    }
    const level = params?.level ?? 'first_factor';
    if (level !== 'first_factor' && level !== 'second_factor' && level !== 'multi_factor') {
      return errorThrower.throw('Biometric reverification level must be first_factor, second_factor, or multi_factor.');
    }
    const session = clerk.session;
    if (!session) {
      return errorThrower.throw('Biometric reverification requires an active session.');
    }
    await waitForPendingJsToNativeSync();
    if (clerk.session?.id !== session.id) {
      return errorThrower.throw('The active session changed before biometric reverification started.');
    }
    const verification = await nativeModule.reverifyWithBiometrics(session.id, level, params?.reason ?? null);
    if (verification.sessionId !== session.id) {
      return errorThrower.throw('Biometric reverification returned a different session.');
    }
    if (verification.status === 'complete') {
      session.clearCache();
    }
    await synchronizeNativeClientToJs();
    const synchronizedSession = clerk.session;
    if (synchronizedSession?.id !== session.id) {
      return errorThrower.throw('The active session changed during biometric reverification.');
    }
    if (verification.status === 'complete') {
      synchronizedSession.clearCache();
      const token = await synchronizedSession.getToken({ skipCache: true });
      if (!token) {
        return errorThrower.throw('Unable to refresh the session token after biometric reverification.');
      }
      if (clerk.session?.id !== session.id) {
        return errorThrower.throw('The active session changed during biometric reverification.');
      }
    }
    return {
      id: verification.id,
      status: verification.status,
      level: verification.level,
      session: synchronizedSession,
    };
  };
}
