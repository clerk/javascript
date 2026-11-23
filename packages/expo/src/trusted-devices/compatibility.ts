import type { EnrollBiometricCredentialParams, UseBiometricCredentialsReturn } from '../biometric-credentials/types';
import type { EnrollTrustedDeviceParams, UseTrustedDevicesReturn } from './types';

function toBiometricCredentialEnrollmentParams(
  params?: EnrollTrustedDeviceParams,
): EnrollBiometricCredentialParams | undefined {
  if (!params) {
    return undefined;
  }

  const { deviceName, ...rest } = params;
  return { ...rest, name: deviceName };
}

export function toTrustedDevices(biometricCredentials: UseBiometricCredentialsReturn): UseTrustedDevicesReturn {
  return {
    ...biometricCredentials,
    enroll: params => biometricCredentials.enroll(toBiometricCredentialEnrollmentParams(params)),
  };
}
