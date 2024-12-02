import React, { useEffect } from 'react';

import type { NextClerkProviderProps } from '../../types';
import { createKeylessApplicationAction } from '../accountless-actions';

export const CreateKeylessApplication = (props: NextClerkProviderProps) => {
  const { children } = props;
  const [state, fetchKeys] = React.useActionState(createKeylessApplicationAction, null);
  useEffect(() => {
    React.startTransition(() => {
      fetchKeys();
    });
  }, []);

  if (!React.isValidElement(children)) {
    return children;
  }

  return React.cloneElement(children, {
    key: state?.publishableKey,
    publishableKey: state?.publishableKey,
    __internal_claimKeylessApplicationUrl: state?.claimUrl,
    __internal_bypassMissingPublishableKey: true,
  } as any);
};
