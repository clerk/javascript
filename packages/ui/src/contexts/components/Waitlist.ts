import { buildURL } from '@clerk/shared/internal/clerk-js/url';
import { createContext, useContext, useMemo } from 'react';

import { useEnvironment, useOptions } from '../../contexts';
import { useRouter } from '../../router';
import type { WaitlistCtx } from '../../types';
import { getInitialValuesFromQueryParams } from '../utils';

const WAITLIST_INITIAL_VALUE_KEYS = ['email_address'];

export type WaitlistContextType = WaitlistCtx & {
  signInUrl: string;
  afterJoinWaitlistUrl?: string;
  initialValues: any;
};

export const WaitlistContext = createContext<WaitlistCtx | null>(null);

export const useWaitlistContext = (): WaitlistContextType => {
  const context = useContext(WaitlistContext);
  const { displayConfig } = useEnvironment();
  const options = useOptions();
  const { queryString } = useRouter();

  const initialValuesFromQueryParams = useMemo(
    () => getInitialValuesFromQueryParams(queryString, WAITLIST_INITIAL_VALUE_KEYS),
    [],
  );

  if (!context || context.componentName !== 'Waitlist') {
    throw new Error('Clerk: useWaitlistContext called outside Waitlist.');
  }

  const { componentName, ...ctx } = context;

  let signInUrl = ctx.signInUrl || options.signInUrl || displayConfig.signInUrl;
  signInUrl = buildURL({ base: signInUrl }, { stringify: true });

  return {
    ...ctx,
    componentName,
    signInUrl,
    initialValues: { ...initialValuesFromQueryParams },
  };
};
