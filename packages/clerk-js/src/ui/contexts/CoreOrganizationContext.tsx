import { OrganizationResource } from '@clerk/types';
import React from 'react';

import { clerkCoreErrorOrganizationIsNotDefined } from '../../core/errors';
import { assertContextExists } from './utils';

type CoreOrganizationContextValue = { value: OrganizationResource | null | undefined };
export const CoreOrganizationContext = React.createContext<CoreOrganizationContextValue | undefined>(undefined);
CoreOrganizationContext.displayName = 'CoreOrganizationContext';

export function useCoreOrganization(): OrganizationResource {
  const context = React.useContext(CoreOrganizationContext);
  assertContextExists(context, 'CoreOrganizationContextProvider');
  if (!context.value) {
    clerkCoreErrorOrganizationIsNotDefined();
  }
  return context.value;
}
