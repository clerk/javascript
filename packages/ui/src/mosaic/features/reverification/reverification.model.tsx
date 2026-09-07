import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useSession } from '@clerk/shared/react';
import type {
  PreferredSignInStrategy,
  SessionVerificationFirstFactor,
  SessionVerificationResource,
  SessionVerificationSecondFactor,
} from '@clerk/shared/types';
import { isWebAuthnSupported } from '@clerk/shared/webauthn';

import { useMosaicEnvironment } from '../../hooks/useMosaicEnvironment';
import type {
  ReverificationFactorStatus,
  ReverificationMethod,
  ReverificationProps,
  ReverificationResult,
} from './reverification.types';
import { pickStartingMethod } from './reverification.utils';

export type ReverificationReadyModel = {
  status: 'ready';
  isActive: boolean;
  supportEmail: string;
  start: () => Promise<ReverificationResult>;
  prepare: (method: ReverificationMethod, verificationStatus: ReverificationFactorStatus) => Promise<void>;
  attempt: (
    method: ReverificationMethod,
    value: string,
    verificationStatus: ReverificationFactorStatus,
  ) => Promise<ReverificationResult>;
  verifyPasskey: (verificationStatus: ReverificationFactorStatus) => Promise<ReverificationResult>;
  finish: () => Promise<void>;
  cancel: () => void;
};

export type ReverificationModel = { status: 'loading'; isActive: boolean } | ReverificationReadyModel;

function toError(error: unknown): Error {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    return new Error(first?.longMessage || first?.message || error.message);
  }
  return error instanceof Error ? error : new Error('Something went wrong. Please try again.');
}

// This only happens if there is a bug in the controller
function incompatible(action: 'prepare' | 'attempt' | 'verify', subject: string, status: string): Error {
  return new Error(`Cannot ${action} ${subject} when verification is ${status}.`);
}

function requireFactorId(value: string | undefined, strategy: 'email_code' | 'phone_code'): string {
  if (!value) {
    throw new Error(
      strategy === 'email_code'
        ? 'Cannot prepare email_code without an email address.'
        : 'Cannot prepare phone_code without a phone number.',
    );
  }
  return value;
}

function toMethod(
  factor: SessionVerificationFirstFactor | SessionVerificationSecondFactor,
  webAuthnSupported: boolean,
): ReverificationMethod | null {
  if (factor.strategy === 'passkey' && !webAuthnSupported) {
    return null;
  }

  if (factor.strategy === 'email_code') {
    return {
      id: `email_code:${factor.emailAddressId}`,
      strategy: 'email_code',
      identifier: factor.safeIdentifier,
      emailAddressId: factor.emailAddressId,
    };
  }

  if (factor.strategy === 'phone_code') {
    return {
      id: `phone_code:${factor.phoneNumberId}`,
      strategy: 'phone_code',
      identifier: factor.safeIdentifier,
      phoneNumberId: factor.phoneNumberId,
    };
  }

  switch (factor.strategy) {
    case 'password':
    case 'passkey':
    case 'totp':
    case 'backup_code':
      return { id: factor.strategy, strategy: factor.strategy };
    default:
      return null;
  }
}

function toResult(
  resource: SessionVerificationResource,
  preferredSignInStrategy: PreferredSignInStrategy | undefined,
  webAuthnSupported: boolean,
): ReverificationResult {
  const raw =
    resource.status === 'needs_second_factor' ? resource.supportedSecondFactors : resource.supportedFirstFactors;
  const methods = (raw ?? [])
    .map(factor => toMethod(factor, webAuthnSupported))
    .filter((method): method is ReverificationMethod => method !== null);

  return {
    status: resource.status,
    methods,
    startingMethod: pickStartingMethod(methods, resource.status, preferredSignInStrategy, webAuthnSupported),
  };
}

export function useReverificationModel(props: ReverificationProps): ReverificationModel {
  const { session } = useSession();
  const clerk = useClerk();
  const environment = useMosaicEnvironment();
  const { isActive, cancel, complete, level } = props;

  if (!session || !environment) {
    return { status: 'loading', isActive };
  }

  const webAuthnSupported = isWebAuthnSupported();
  const preferredSignInStrategy = environment.displayConfig.preferredSignInStrategy;

  const handleResponse = (resource: SessionVerificationResource) =>
    toResult(resource, preferredSignInStrategy, webAuthnSupported);

  return {
    status: 'ready',
    isActive,
    supportEmail: environment.displayConfig.supportEmail ?? '',
    start: async () => {
      try {
        return handleResponse(await session.startVerification({ level: level ?? 'first_factor' }));
      } catch (error) {
        throw toError(error);
      }
    },
    verifyPasskey: async verificationStatus => {
      try {
        if (verificationStatus !== 'needs_first_factor') {
          throw incompatible('verify', 'passkey', verificationStatus);
        }
        return handleResponse(await session.verifyWithPasskey());
      } catch (error) {
        throw toError(error);
      }
    },
    cancel: () => {
      cancel?.();
    },
    prepare: async (method, verificationStatus) => {
      try {
        if (verificationStatus === 'needs_second_factor') {
          switch (method.strategy) {
            case 'phone_code':
              await session.prepareSecondFactorVerification({
                strategy: 'phone_code',
                phoneNumberId: requireFactorId(method.phoneNumberId, 'phone_code'),
              });
              return;
            case 'totp':
            case 'backup_code':
              return;
            default:
              throw incompatible('prepare', method.strategy, verificationStatus);
          }
        }

        switch (method.strategy) {
          case 'email_code':
            await session.prepareFirstFactorVerification({
              strategy: 'email_code',
              emailAddressId: requireFactorId(method.emailAddressId, 'email_code'),
            });
            return;
          case 'phone_code':
            await session.prepareFirstFactorVerification({
              strategy: 'phone_code',
              phoneNumberId: requireFactorId(method.phoneNumberId, 'phone_code'),
            });
            return;
          case 'password':
          case 'passkey':
            return;
          default:
            throw incompatible('prepare', method.strategy, verificationStatus);
        }
      } catch (error) {
        throw toError(error);
      }
    },
    attempt: async (method, value, verificationStatus) => {
      try {
        if (verificationStatus === 'needs_second_factor') {
          switch (method.strategy) {
            case 'phone_code':
            case 'totp':
            case 'backup_code':
              return handleResponse(
                await session.attemptSecondFactorVerification({ strategy: method.strategy, code: value }),
              );
            default:
              throw incompatible('attempt', method.strategy, verificationStatus);
          }
        }

        switch (method.strategy) {
          case 'password':
            return handleResponse(
              await session.attemptFirstFactorVerification({ strategy: 'password', password: value }),
            );
          case 'email_code':
          case 'phone_code':
            return handleResponse(
              await session.attemptFirstFactorVerification({ strategy: method.strategy, code: value }),
            );
          default:
            throw incompatible('attempt', method.strategy, verificationStatus);
        }
      } catch (error) {
        throw toError(error);
      }
    },
    finish: async () => {
      try {
        try {
          await clerk.setActive({ session: session.id });
        } finally {
          complete?.();
        }
      } catch (error) {
        throw toError(error);
      }
    },
  };
}
