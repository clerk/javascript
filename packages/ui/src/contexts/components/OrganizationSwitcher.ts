import type { OrganizationResource, UserResource } from '@clerk/shared/types';
import { createContext, useContext } from 'react';

import { useEnvironment } from '../../contexts';
import { useRouter } from '../../router';
import type { OrganizationSwitcherCtx } from '../../types';
import { populateParamFromObject } from '../utils';

export const OrganizationSwitcherContext = createContext<OrganizationSwitcherCtx | null>(null);

export const useOrganizationSwitcherContext = () => {
  const context = useContext(OrganizationSwitcherContext);
  const { navigate } = useRouter();
  const { displayConfig, organizationSettings } = useEnvironment();

  if (!context || context.componentName !== 'OrganizationSwitcher') {
    throw new Error('Clerk: useOrganizationSwitcherContext called outside OrganizationSwitcher.');
  }

  const { componentName, ...ctx } = context;

  const afterCreateOrganizationUrl = ctx.afterCreateOrganizationUrl || displayConfig.afterCreateOrganizationUrl;
  const afterLeaveOrganizationUrl = ctx.afterLeaveOrganizationUrl || displayConfig.afterLeaveOrganizationUrl;

  const navigateCreateOrganization = () => navigate(ctx.createOrganizationUrl || displayConfig.createOrganizationUrl);
  const navigateOrganizationProfile = () =>
    navigate(ctx.organizationProfileUrl || displayConfig.organizationProfileUrl);

  const navigateAfterSelectOrganizationOrPersonal = ({
    organization,
    user,
  }: {
    organization?: OrganizationResource;
    user?: UserResource;
  }) => {
    const redirectUrl = getAfterSelectOrganizationOrPersonalUrl({
      organization,
      user,
    });

    if (redirectUrl) {
      return navigate(redirectUrl);
    }

    return Promise.resolve();
  };

  const getAfterSelectOrganizationOrPersonalUrl = ({
    organization,
    user,
  }: {
    organization?: OrganizationResource;
    user?: UserResource;
  }) => {
    if (typeof ctx.afterSelectPersonalUrl === 'function' && user) {
      return ctx.afterSelectPersonalUrl(user);
    }

    if (typeof ctx.afterSelectOrganizationUrl === 'function' && organization) {
      return ctx.afterSelectOrganizationUrl(organization);
    }

    if (ctx.afterSelectPersonalUrl && user) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectPersonalUrl as string,
        entity: user,
      });
      return parsedUrl;
    }

    if (ctx.afterSelectOrganizationUrl && organization) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectOrganizationUrl as string,
        entity: organization,
      });
      return parsedUrl;
    }

    return;
  };

  const navigateAfterSelectOrganization = (organization: OrganizationResource) =>
    navigateAfterSelectOrganizationOrPersonal({ organization });

  const navigateAfterSelectPersonal = (user: UserResource) => navigateAfterSelectOrganizationOrPersonal({ user });

  const afterSelectOrganizationUrl = (organization: OrganizationResource) =>
    getAfterSelectOrganizationOrPersonalUrl({ organization });
  const afterSelectPersonalUrl = (user: UserResource) => getAfterSelectOrganizationOrPersonalUrl({ user });

  const organizationProfileMode =
    !!ctx.organizationProfileUrl && !ctx.organizationProfileMode ? 'navigation' : ctx.organizationProfileMode;

  const createOrganizationMode =
    !!ctx.createOrganizationUrl && !ctx.createOrganizationMode ? 'navigation' : ctx.createOrganizationMode;

  return {
    ...ctx,
    hidePersonal: organizationSettings.forceOrganizationSelection || ctx.hidePersonal || false,
    organizationProfileMode: organizationProfileMode || 'modal',
    createOrganizationMode: createOrganizationMode || 'modal',
    skipInvitationScreen: ctx.skipInvitationScreen || false,
    afterCreateOrganizationUrl,
    afterLeaveOrganizationUrl,
    navigateOrganizationProfile,
    navigateCreateOrganization,
    navigateAfterSelectOrganization,
    navigateAfterSelectPersonal,
    afterSelectOrganizationUrl,
    afterSelectPersonalUrl,
    componentName,
  };
};
