import { requireOptionalNativeModule } from 'expo';

type VerifyLaunchConfigModule = {
  readLaunchInputs(): Record<string, string>;
  applyStorageScope(scope: string): void;
};

export const VerifyLaunchConfig = requireOptionalNativeModule<VerifyLaunchConfigModule>('VerifyLaunchConfig');
