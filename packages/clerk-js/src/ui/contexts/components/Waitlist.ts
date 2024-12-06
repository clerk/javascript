import { createContext, useContext } from 'react';

import { buildURL } from '../../../utils';
import { useEnvironment, useOptions } from '../../contexts';
import type { WaitlistCtx } from '../../types';

export type WaitlistContextType = WaitlistCtx & {
  signInUrl: string;
  afterJoinWaitlistUrl?: string;
};

export const WaitlistContext = createContext<WaitlistCtx | null>(null);

export const useWaitlistContext = (): WaitlistContextType => {
  const context = useContext(WaitlistContext);
  const { displayConfig } = useEnvironment();
  const options = useOptions();

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
  };
};
