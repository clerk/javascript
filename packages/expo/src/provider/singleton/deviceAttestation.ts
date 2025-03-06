import type { BrowserClerk, HeadlessBrowserClerk } from '@clerk/clerk-react';
import { Platform } from 'react-native';

import type { BuildClerkOptions } from './types';

type DeviceAttestationParams = {
  deviceAttestation?: BuildClerkOptions['deviceAttestation'];
  __internal_clerk: HeadlessBrowserClerk | BrowserClerk;
};

export const enableDeviceAttestation = ({ __internal_clerk, deviceAttestation }: DeviceAttestationParams): void => {
  if (!__internal_clerk || !deviceAttestation) {
    return;
  }

  if (Platform.OS === 'android') {
    if (!deviceAttestation?.android?.cloudProjectId || !deviceAttestation?.android?.packageName) {
      console.log('Device attestation on Android requires both cloudProjectId and packageName properties');
      return;
    }

    // @ts-expect-error - This is an internal API
    __internal_clerk.__internal_assertDevice = async (client_id: string) => {
      console.log('Attesting Android device...');
      return await Promise.resolve({ platform: 'android', token: 'fake_android_token', client_id });
    };
  } else {
    if (!deviceAttestation?.ios?.packageName) {
      console.log('Device attestation on iOS requires the packageName property');
      return;
    }

    // @ts-expect-error - This is an internal API
    __internal_clerk.__internal_assertDevice = async (client_id: string) => {
      console.log('Attesting iOS device...');
      return await Promise.resolve({ platform: 'ios', token: 'fake_ios_token', client_id });
    };
  }
};
