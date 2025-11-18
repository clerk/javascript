import type { OrganizationResource, UserResource } from '@clerk/shared/types';
import { createContext, useContext } from 'react';

import { useEnvironment } from '../../contexts';
import { useRouter } from '../../router';
import type { OrganizationListCtx } from '../../types';
import { populateParamFromObject } from '../utils';

export const OrganizationListContext = createContext<OrganizationListCtx | null>(null);

export const useOrganizationListContext = () => {
  const context = useContext(OrganizationListContext);
  const { navigate } = useRouter();
  const { displayConfig, organizationSettings } = useEnvironment();

  if (!context || context.componentName !== 'OrganizationList') {
    throw new Error('Clerk: useOrganizationListContext called outside OrganizationList.');
  }

  const { componentName, ...ctx } = context;

  const afterCreateOrganizationUrl = ctx.afterCreateOrganizationUrl || displayConfig.afterCreateOrganizationUrl;

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

  const navigateAfterSelectOrganizationOrPersonal = ({
    organization,
    user,
  }: {
    organization?: OrganizationResource;
    user?: UserResource;
  }) => {
    if (typeof ctx.afterSelectPersonalUrl === 'function' && user) {
      return navigate(ctx.afterSelectPersonalUrl(user));
    }

    if (typeof ctx.afterSelectOrganizationUrl === 'function' && organization) {
      return navigate(ctx.afterSelectOrganizationUrl(organization));
    }

    if (ctx.afterSelectPersonalUrl && user) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectPersonalUrl as string,
        entity: user,
      });
      return navigate(parsedUrl);
    }

    if (ctx.afterSelectOrganizationUrl && organization) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectOrganizationUrl as string,
        entity: organization,
      });
      return navigate(parsedUrl);
    }

    return Promise.resolve();
  };

  const navigateAfterSelectOrganization = (organization: OrganizationResource) =>
    navigateAfterSelectOrganizationOrPersonal({ organization });
  const navigateAfterSelectPersonal = (user: UserResource) => navigateAfterSelectOrganizationOrPersonal({ user });

  return {
    ...ctx,
    afterCreateOrganizationUrl,
    skipInvitationScreen: ctx.skipInvitationScreen || false,
    hideSlug: ctx.hideSlug || false,
    hidePersonal: organizationSettings.forceOrganizationSelection || ctx.hidePersonal || false,
    navigateAfterCreateOrganization,
    navigateAfterSelectOrganization,
    navigateAfterSelectPersonal,
    componentName,
  };
};
