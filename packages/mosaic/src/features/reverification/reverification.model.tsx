import { useClerk, useSession } from '@clerk/shared/react';
import type {
  PreferredSignInStrategy,
  SessionVerificationFirstFactor,
  SessionVerificationResource,
  SessionVerificationSecondFactor,
} from '@clerk/shared/types';
import { isWebAuthnSupported } from '@clerk/shared/webauthn';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useMosaicSupportEmail } from '../../hooks/use-mosaic-support-email';
import type {
  ReverificationMethod,
  ReverificationPreparableMethod,
  ReverificationResult,
  ReverificationStage,
  ReverificationState,
} from './reverification.types';
import { pickStartingMethod } from './reverification.utils';

export type ReverificationActiveModel = {
  status: 'active';
  supportEmail: string;
  start: () => Promise<ReverificationResult>;
  prepare: (method: ReverificationPreparableMethod) => Promise<void>;
  attempt: (method: ReverificationMethod, value: string) => Promise<ReverificationResult>;
  finish: () => Promise<void>;
  cancel: () => void;
};

export type ReverificationModel =
  | { status: 'inactive' }
  | { status: 'loading'; cancel: () => void }
  | ReverificationActiveModel
  | { status: 'retrying' }
  | { status: 'settled' };

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

export function useReverificationModel(reverificationState: ReverificationState): ReverificationModel {
  const { session } = useSession();
  const clerk = useClerk();
  const environment = useMosaicEnvironment();
  const supportEmail = useMosaicSupportEmail();

  if (reverificationState.phase === 'inactive') {
    return { status: 'inactive' };
  }

  if (reverificationState.phase === 'retrying') {
    return { status: 'retrying' };
  }

  if (reverificationState.phase === 'settled') {
    return { status: 'settled' };
  }

  const { level, cancel, complete } = reverificationState;

  if (!session || !environment || supportEmail === undefined) {
    return { status: 'loading', cancel };
  }

  const webAuthnSupported = isWebAuthnSupported();
  const preferredSignInStrategy = environment.displayConfig.preferredSignInStrategy;

  const handleResponse = (resource: SessionVerificationResource) =>
    toResult(resource, preferredSignInStrategy, webAuthnSupported);

  return {
    status: 'active',
    supportEmail,
    start: async () => handleResponse(await session.startVerification({ level: level ?? 'second_factor' })),
    cancel,
    prepare: async method => {
      switch (method.strategy) {
        case 'email_code':
          await session.prepareFirstFactorVerification({
            strategy: 'email_code',
            emailAddressId: method.emailAddressId,
          });
          return;
        case 'phone_code':
          if (method.stage === 'second') {
            await session.prepareSecondFactorVerification({
              strategy: 'phone_code',
              phoneNumberId: method.phoneNumberId,
            });
            return;
          }
          await session.prepareFirstFactorVerification({
            strategy: 'phone_code',
            phoneNumberId: method.phoneNumberId,
          });
          return;
      }
    },
    attempt: async (method, value) => {
      switch (method.strategy) {
        case 'password':
          return handleResponse(
            await session.attemptFirstFactorVerification({ strategy: 'password', password: value }),
          );
        case 'email_code':
          return handleResponse(await session.attemptFirstFactorVerification({ strategy: 'email_code', code: value }));
        case 'phone_code':
          if (method.stage === 'second') {
            return handleResponse(
              await session.attemptSecondFactorVerification({ strategy: 'phone_code', code: value }),
            );
          }
          return handleResponse(await session.attemptFirstFactorVerification({ strategy: 'phone_code', code: value }));
        case 'totp':
        case 'backup_code':
          return handleResponse(
            await session.attemptSecondFactorVerification({ strategy: method.strategy, code: value }),
          );
        case 'passkey':
          return handleResponse(await session.verifyWithPasskey());
      }
    },
    finish: async () => {
      await clerk.setActive({ session: session.id });
      complete();
    },
  };
}
