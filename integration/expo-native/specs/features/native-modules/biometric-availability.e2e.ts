import { test, expect } from '../../fixtures.ts';
import { homeLinks } from '../../native.ts';

test('useBiometricCredentials reports what the expo-biometrics native module found on the device', async ({
  host,
  screen,
  platform,
}) => {
  const nativeAnswer = platform === 'ios' ? 'biometric_authentication_unavailable' : 'no_local_credential';
  await host.launch();
  await host.tap(homeLinks(screen).nativeModules);
  await host.tap(screen.getByTestId('biometric-availability-button'));
  await expect(screen.getByTestId('biometric-availability-result')).toHaveText(
    `biometric availability: ${nativeAnswer}`,
    { timeout: 15_000 },
  );
  await host.screenshot('biometric-availability');
});
