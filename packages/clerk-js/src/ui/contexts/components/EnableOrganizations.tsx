import { createContext, useContext } from 'react';

import type { EnableOrganizationsCtx } from '../../types';

export type EnableOrganizationsContextType = EnableOrganizationsCtx;

export const EnableOrganizationsContext = createContext<EnableOrganizationsCtx | null>(null);

export const useEnableOrganizations = (): EnableOrganizationsContextType => {
  const context = useContext(EnableOrganizationsContext);

  if (!context || context.componentName !== 'EnableOrganizations') {
    throw new Error(
      'Clerk: useEnableOrganizationsContext called outside of the mounted EnableOrganizations component.',
    );
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
