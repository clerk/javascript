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
import type { ReverificationMethod, ReverificationProps, ReverificationResult } from './reverification.types';
import { pickStartingMethod } from './reverification.utils';

export type ReverificationReadyModel = {
  status: 'ready';
  isActive: boolean;
  supportEmail: string;
  start: () => Promise<ReverificationResult>;
  prepare: (method: ReverificationMethod, verificationStatus: ReverificationResult['status']) => Promise<void>;
  attempt: (
    method: ReverificationMethod,
    value: string,
    verificationStatus: ReverificationResult['status'],
  ) => Promise<ReverificationResult>;
  verifyPasskey: () => Promise<ReverificationResult>;
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
    verifyPasskey: async () => {
      try {
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
          await session.prepareSecondFactorVerification({
            strategy: 'phone_code',
            phoneNumberId: method.phoneNumberId,
          });
          return;
        }
        if (method.strategy === 'email_code') {
          await session.prepareFirstFactorVerification({
            strategy: 'email_code',
            emailAddressId: method.emailAddressId ?? '',
          });
          return;
        }
        if (method.strategy === 'phone_code') {
          await session.prepareFirstFactorVerification({
            strategy: 'phone_code',
            phoneNumberId: method.phoneNumberId ?? '',
          });
        }
      } catch (error) {
        throw toError(error);
      }
    },
    attempt: async (method, value, verificationStatus) => {
      try {
        if (verificationStatus === 'needs_second_factor') {
          const strategy = method.strategy === 'totp' || method.strategy === 'backup_code' ? method.strategy : 'phone_code';
          return handleResponse(await session.attemptSecondFactorVerification({ strategy, code: value }));
        }
        if (method.strategy === 'password') {
          return handleResponse(await session.attemptFirstFactorVerification({ strategy: 'password', password: value }));
        }
        return handleResponse(
          await session.attemptFirstFactorVerification({
            strategy: method.strategy === 'phone_code' ? 'phone_code' : 'email_code',
            code: value,
          }),
        );
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
