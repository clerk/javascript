import { isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';
import type { PreferredSignInStrategy } from '@clerk/shared/types';

import type {
  ReverificationMethod,
  ReverificationOtpChannel,
  ReverificationPreparableMethod,
  ReverificationStrategy,
} from './reverification.types';

// TODO: Return toLocalizableError(error) and render with errorText so Clerk errors are localized by code instead of shown raw.
export function errorDetail(error: unknown): string | undefined {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    return first?.longMessage || first?.message || error.message;
  }
  if (isClerkRuntimeError(error) && error.code !== 'network_error') {
    return error.message;
  }
  return undefined;
}

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

export function needsPrepare(method: ReverificationMethod): method is ReverificationPreparableMethod {
  return method.strategy === 'email_code' || method.strategy === 'phone_code';
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
  preferredSignInStrategy: PreferredSignInStrategy | undefined,
  webAuthnSupported: boolean,
): ReverificationMethod | null {
  return methods[0]?.stage === 'second'
    ? pickStartingSecondFactor(methods)
    : pickStartingFirstFactor(methods, preferredSignInStrategy, webAuthnSupported);
}
