import { useSelectedLayoutSegments } from 'next/navigation';
import React, { useEffect } from 'react';

import type { NextClerkProviderProps } from '../../types';
import { createOrReadKeylessAction } from '../keyless-actions';

export const KeylessCreatorOrReader = (props: NextClerkProviderProps) => {
  const { children } = props;
  const segments = useSelectedLayoutSegments();
  const isNotFoundRoute = segments[0]?.startsWith('/_not-found') || false;
  const [state, fetchKeys] = React.useActionState(createOrReadKeylessAction, null);
  useEffect(() => {
    if (isNotFoundRoute) {
      return;
    }
    React.startTransition(() => {
      fetchKeys();
    });
  }, [isNotFoundRoute]);

  if (!React.isValidElement(children)) {
    return children;
  }

  return React.cloneElement(children, {
    key: state?.publishableKey,
    publishableKey: state?.publishableKey,
    __internal_keyless_claimKeylessApplicationUrl: state?.claimUrl,
    __internal_keyless_copyInstanceKeysUrl: state?.apiKeysUrl,
    __internal_bypassMissingPublishableKey: true,
  } as any);
};
