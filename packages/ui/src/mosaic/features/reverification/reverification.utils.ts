import type { PreferredSignInStrategy } from '@clerk/shared/types';

import type {
  ReverificationMethod,
  ReverificationOtpChannel,
  ReverificationResult,
  ReverificationStrategy,
} from './reverification.types';

export function otpChannelFor(strategy: ReverificationStrategy): ReverificationOtpChannel | undefined {
  if (strategy === 'email_code') {
    return 'email';
  }
  if (strategy === 'phone_code') {
    return 'phone';
  }
  if (strategy === 'totp') {
    return 'totp';
  }
  return undefined;
}

export function needsPrepare(strategy: ReverificationStrategy): boolean {
  return strategy === 'email_code' || strategy === 'phone_code';
}

function pickStartingFirstFactor(
  methods: readonly ReverificationMethod[],
  preferredSignInStrategy: PreferredSignInStrategy | undefined,
  webAuthnSupported: boolean,
): ReverificationMethod | null {
  if (methods.length === 0) {
    return null;
  }

  if (webAuthnSupported) {
    const passkey = methods.find(method => method.strategy === 'passkey');
    if (passkey) {
      return passkey;
    }
  }

  if (preferredSignInStrategy === 'password') {
    return methods.find(method => method.strategy === 'password') ?? methods[0] ?? null;
  }

  return (
    methods.find(method => method.strategy === 'email_code' || method.strategy === 'phone_code') ?? methods[0] ?? null
  );
}

function pickStartingSecondFactor(methods: readonly ReverificationMethod[]): ReverificationMethod | null {
  return (
    methods.find(method => method.strategy === 'totp') ??
    methods.find(method => method.strategy === 'phone_code') ??
    methods[0] ??
    null
  );
}

export function pickStartingMethod(
  methods: readonly ReverificationMethod[],
  status: ReverificationResult['status'],
  preferredSignInStrategy: PreferredSignInStrategy | undefined,
  webAuthnSupported: boolean,
): ReverificationMethod | null {
  return status === 'needs_second_factor'
    ? pickStartingSecondFactor(methods)
    : pickStartingFirstFactor(methods, preferredSignInStrategy, webAuthnSupported);
}
