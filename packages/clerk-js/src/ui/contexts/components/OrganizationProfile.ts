import { useClerk } from '@clerk/shared/react';
import { createContext, useContext, useMemo } from 'react';

import { ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useEnvironment } from '../../contexts';
import type { NavbarRoute } from '../../elements';
import { useRouter } from '../../router';
import type { OrganizationProfileCtx } from '../../types';
import type { CustomPageContent } from '../../utils';
import { createOrganizationProfileCustomPages } from '../../utils';

type PagesType = {
  routes: NavbarRoute[];
  contents: CustomPageContent[];
  pageToRootNavbarRouteMap: Record<string, NavbarRoute>;
};

export type OrganizationProfileContextType = OrganizationProfileCtx & {
  pages: PagesType;
  navigateAfterLeaveOrganization: () => Promise<unknown>;
  navigateToGeneralPageRoot: () => Promise<unknown>;
  isMembersPageRoot: boolean;
  isGeneralPageRoot: boolean;
  isBillingPageRoot: boolean;
};

export const OrganizationProfileContext = createContext<OrganizationProfileCtx | null>(null);

export const useOrganizationProfileContext = (): OrganizationProfileContextType => {
  const context = useContext(OrganizationProfileContext);
  const { navigate } = useRouter();
  const environment = useEnvironment();
  const clerk = useClerk();

  if (!context || context.componentName !== 'OrganizationProfile') {
    throw new Error('Clerk: useOrganizationProfileContext called outside OrganizationProfile.');
  }

  const { componentName, customPages, ...ctx } = context;

  const pages = useMemo(
    () => createOrganizationProfileCustomPages(customPages || [], clerk, environment),
    [customPages],
  );

  const navigateAfterLeaveOrganization = () =>
    navigate(ctx.afterLeaveOrganizationUrl || environment.displayConfig.afterLeaveOrganizationUrl);

  const isMembersPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS;
  const isGeneralPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.GENERAL;
  const isBillingPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.BILLING;
  const navigateToGeneralPageRoot = () =>
    navigate(isGeneralPageRoot ? '../' : isMembersPageRoot ? './organization-general' : '../organization-general');

  return {
    ...ctx,
    pages,
    navigateAfterLeaveOrganization,
    componentName,
    navigateToGeneralPageRoot,
    isMembersPageRoot,
    isGeneralPageRoot,
    isBillingPageRoot,
  };
};
