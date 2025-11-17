import type { OrganizationResource } from '@clerk/shared/types';
import { createContext, useContext } from 'react';

import { useEnvironment } from '../../contexts';
import { useRouter } from '../../router';
import type { CreateOrganizationCtx } from '../../types';
import { populateParamFromObject } from '../utils';

export const CreateOrganizationContext = createContext<CreateOrganizationCtx | null>(null);

export const useCreateOrganizationContext = () => {
  const context = useContext(CreateOrganizationContext);
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();

  if (!context || context.componentName !== 'CreateOrganization') {
    throw new Error('Clerk: useCreateOrganizationContext called outside CreateOrganization.');
  }

  const { componentName, ...ctx } = context;

  const navigateAfterCreateOrganization = (organization: OrganizationResource) => {
    if (typeof ctx.afterCreateOrganizationUrl === 'function') {
      return navigate(ctx.afterCreateOrganizationUrl(organization));
    }

    if (ctx.afterCreateOrganizationUrl) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterCreateOrganizationUrl,
        entity: organization,
      });
      return navigate(parsedUrl);
    }

    return navigate(displayConfig.afterCreateOrganizationUrl);
  };

  return {
    ...ctx,
    skipInvitationScreen: ctx.skipInvitationScreen || false,
    navigateAfterCreateOrganization,
    componentName,
  };
};
