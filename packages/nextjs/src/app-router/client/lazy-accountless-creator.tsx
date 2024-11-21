import React, { useEffect } from 'react';

import type { NextClerkProviderProps } from '../../types';
import { createAccountlessKeysAction } from '../accountless-actions';

export const AccountlessCreateKeys = (props: NextClerkProviderProps) => {
  const { children } = props;
  const [state, fetchKeys] = React.useActionState(createAccountlessKeysAction, null);
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
    claimAccountlessKeysUrl: state?.claimUrl,
    __internal_bypassMissingPk: true,
  } as any);
};
