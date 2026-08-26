import type { Without } from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';
import React from 'react';

import type { NextClerkProviderProps } from '../../types';
import { canUseKeyless } from '../../utils/feature-flags';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { deleteKeylessAction } from '../keyless-actions';

export async function getKeylessStatus(
  params: Without<NextClerkProviderProps, '__internal_invokeMiddlewareOnAuthStateChange' | 'children'>,
) {
  if (!canUseKeyless) {
    return { runningWithClaimedKeys: false };
  }

  const storedKeys = await import('../../server/keyless-node.js')
    .then(mod => mod.keyless().readKeys() ?? null)
    .catch(() => null);
  if (!storedKeys) {
    return { runningWithClaimedKeys: false };
  }

  if (!params.publishableKey) {
    const { clerkDevelopmentCache } = await import('../../server/keyless-log-cache.js');
    clerkDevelopmentCache?.log({
      cacheKey: `${storedKeys.publishableKey}_stored`,
      msg: `[Clerk]: Found existing keyless-mode keys in .clerk/.tmp/keyless.json. Copy the publishableKey and secretKey into .env.local (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY) to keep using that application, or claim it at ${storedKeys.claimUrl}`,
    });
    return { runningWithClaimedKeys: false };
  }

  return { runningWithClaimedKeys: params.publishableKey === storedKeys.publishableKey };
}

type KeylessProviderProps = PropsWithChildren<{
  rest: Without<NextClerkProviderProps, '__internal_invokeMiddlewareOnAuthStateChange' | 'children'>;
  __internal_scriptsSlot?: React.ReactNode;
}>;

export const KeylessProvider = async (props: KeylessProviderProps) => {
  const { rest, __internal_scriptsSlot, children } = props;

  const storedKeys = await import('../../server/keyless-node.js')
    .then(mod => mod.keyless().readKeys() ?? null)
    .catch(() => null);

  if (!storedKeys) {
    return (
      <ClientClerkProvider
        {...mergeNextClerkPropsWithEnv(rest)}
        disableKeyless
        __internal_scriptsSlot={__internal_scriptsSlot}
      >
        {children}
      </ClientClerkProvider>
    );
  }

  try {
    const keylessService = await import('../../server/keyless-node.js').then(mod => mod.keyless());
    const { completeClaimedOnboarding } = await import('@clerk/shared/keyless');
    await completeClaimedOnboarding(storedKeys.publishableKey, keylessService);
  } catch {
    // noop
  }

  return (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv({
        ...rest,
        __internal_keyless_claimKeylessApplicationUrl: storedKeys.claimUrl,
        __internal_keyless_copyInstanceKeysUrl: storedKeys.apiKeysUrl,
        __internal_keyless_dismissPrompt: deleteKeylessAction,
      })}
      __internal_scriptsSlot={__internal_scriptsSlot}
    >
      {children}
    </ClientClerkProvider>
  );
};
