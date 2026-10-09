import { VerifyLaunchConfig } from '../modules/verify-launch-config';

const authModes = ['signIn', 'signUp', 'signInOrUp'] as const;

type AuthMode = (typeof authModes)[number];
export type VerifyFailure = { code: string; message: string };

export type VerifyLaunch = {
  publishableKey: string;
  runId: string | null;
  launchId: string | null;
  authMode: AuthMode;
  signInTicket: string | null;
  debugLogging: boolean;
};

function isOneOf<T extends string>(values: readonly T[], value: string | undefined): value is T {
  return values.includes(value as T);
}

function parseVerifyLaunch(
  inputs: Readonly<Record<string, string>>,
  fallbackPublishableKey: string | undefined,
): VerifyLaunch | null {
  if (Object.keys(inputs).length === 0) {
    return null;
  }

  return {
    publishableKey: inputs.verifyPublishableKey ?? fallbackPublishableKey ?? '',
    runId: inputs.verifyRunId ?? null,
    launchId: inputs.verifyLaunchId ?? null,
    authMode: isOneOf(authModes, inputs.verifyAuthMode) ? inputs.verifyAuthMode : 'signInOrUp',
    signInTicket: inputs.verifySignInTicket ?? null,
    debugLogging: inputs.verifyLogLevel === 'debug',
  };
}

export function publishableKeyFailure(publishableKey: string): VerifyFailure | null {
  const [prefix, environment, encoded, ...rest] = publishableKey.split('_');
  const wellFormed = prefix === 'pk' && (environment === 'test' || environment === 'live') && encoded && !rest.length;
  const decoded = wellFormed ? decodeBase64(encoded) : '';
  const host = decoded.slice(0, -1);

  if (decoded.endsWith('$') && !host.includes('$') && host.includes('.')) {
    return null;
  }

  return {
    code: 'invalid_publishable_key',
    message: 'The publishable key is missing or is not a pk_test_ or pk_live_ key.',
  };
}

function decodeBase64(value: string): string {
  try {
    return atob(value);
  } catch {
    return '';
  }
}

export function readVerifyLaunch(): VerifyLaunch | null {
  const inputs = VerifyLaunchConfig?.readLaunchInputs() ?? {};
  if (inputs.verifyStorageScope) {
    VerifyLaunchConfig?.applyStorageScope(inputs.verifyStorageScope);
  }
  return parseVerifyLaunch(inputs, process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);
}
