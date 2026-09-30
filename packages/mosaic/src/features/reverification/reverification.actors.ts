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
import type { ReverificationActors } from './reverification.machine';
import type { ReverificationMethod, ReverificationResult, ReverificationStage } from './reverification.types';
import { pickStartingMethod } from './reverification.utils';

function toError(error: unknown): Error {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    return new Error(first?.longMessage || first?.message || error.message);
  }
  return error instanceof Error ? error : new Error('Something went wrong. Please try again.');
}

function toMethod(
  factor: SessionVerificationFirstFactor | SessionVerificationSecondFactor,
  stage: ReverificationStage,
  webAuthnSupported: boolean,
): ReverificationMethod | null {
  if (factor.strategy === 'passkey') {
    if (stage !== 'first' || !webAuthnSupported) {
      return null;
    }
    return { id: 'passkey', stage: 'first', strategy: 'passkey' };
  }

  if (factor.strategy === 'password') {
    if (stage !== 'first') {
      return null;
    }
    return { id: 'password', stage: 'first', strategy: 'password' };
  }

  if (factor.strategy === 'email_code') {
    if (stage !== 'first') {
      return null;
    }
    return {
      id: `email_code:${factor.emailAddressId}`,
      stage: 'first',
      strategy: 'email_code',
      identifier: factor.safeIdentifier,
      emailAddressId: factor.emailAddressId,
    };
  }

  if (factor.strategy === 'phone_code') {
    return {
      id: `phone_code:${factor.phoneNumberId}`,
      stage,
      strategy: 'phone_code',
      identifier: factor.safeIdentifier,
      phoneNumberId: factor.phoneNumberId,
    };
  }

  if (factor.strategy === 'totp' || factor.strategy === 'backup_code') {
    if (stage !== 'second') {
      return null;
    }
    return { id: factor.strategy, stage: 'second', strategy: factor.strategy };
  }

  return null;
}

function toResult(
  resource: SessionVerificationResource,
  preferredSignInStrategy: PreferredSignInStrategy | undefined,
  webAuthnSupported: boolean,
): ReverificationResult {
  if (resource.status === 'complete') {
    return { status: 'complete', methods: [], startingMethod: null };
  }

  const stage: ReverificationStage = resource.status === 'needs_second_factor' ? 'second' : 'first';
  const raw = stage === 'second' ? resource.supportedSecondFactors : resource.supportedFirstFactors;
  const methods = (raw ?? [])
    .map(factor => toMethod(factor, stage, webAuthnSupported))
    .filter((method): method is ReverificationMethod => method !== null);

  return {
    status: resource.status,
    methods,
    startingMethod: pickStartingMethod(methods, preferredSignInStrategy, webAuthnSupported),
  };
}

async function rethrow<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    throw toError(error);
  }
}

export function useReverificationActors(): ReverificationActors {
  const { session } = useSession();
  const clerk = useClerk();
  const environment = useMosaicEnvironment();

  const verifiedSession = () => {
    if (!session) {
      throw new Error('Something went wrong. Please try again.');
    }
    return session;
  };
  const handleResponse = (resource: SessionVerificationResource) =>
    toResult(resource, environment?.displayConfig.preferredSignInStrategy, isWebAuthnSupported());

  return {
    startVerification: level =>
      rethrow(async () =>
        handleResponse(await verifiedSession().startVerification({ level: level ?? 'second_factor' })),
      ),
    prepareFactor: method =>
      rethrow(async () => {
        const current = verifiedSession();
        if (method.strategy === 'email_code') {
          await current.prepareFirstFactorVerification({
            strategy: 'email_code',
            emailAddressId: method.emailAddressId,
          });
        } else if (method.stage === 'second') {
          await current.prepareSecondFactorVerification({
            strategy: 'phone_code',
            phoneNumberId: method.phoneNumberId,
          });
        } else {
          await current.prepareFirstFactorVerification({ strategy: 'phone_code', phoneNumberId: method.phoneNumberId });
        }
      }),
    attemptFactor: ({ method, value }) =>
      rethrow(async () => {
        const current = verifiedSession();
        switch (method.strategy) {
          case 'password':
            return handleResponse(
              await current.attemptFirstFactorVerification({ strategy: 'password', password: value }),
            );
          case 'email_code':
            return handleResponse(
              await current.attemptFirstFactorVerification({ strategy: 'email_code', code: value }),
            );
          case 'phone_code':
            if (method.stage === 'second') {
              return handleResponse(
                await current.attemptSecondFactorVerification({ strategy: 'phone_code', code: value }),
              );
            }
            return handleResponse(
              await current.attemptFirstFactorVerification({ strategy: 'phone_code', code: value }),
            );
          case 'totp':
          case 'backup_code':
            return handleResponse(
              await current.attemptSecondFactorVerification({ strategy: method.strategy, code: value }),
            );
          case 'passkey':
            return handleResponse(await current.verifyWithPasskey());
        }
      }),
    finishVerification: () =>
      rethrow(async () => {
        await clerk.setActive({ session: verifiedSession().id });
      }),
  };
}
