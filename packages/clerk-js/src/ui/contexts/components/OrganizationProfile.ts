import { useClerk } from '@clerk/shared/react';
import { createContext, useContext, useMemo } from 'react';

import type { NavbarRoute } from '@/ui/elements/Navbar';
import type { CustomPageContent } from '@/ui/utils/createCustomPages';
import { createOrganizationProfileCustomPages } from '@/ui/utils/createCustomPages';

import { ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useRouter } from '../../router';
import type { OrganizationProfileCtx } from '../../types';
import { useEnvironment } from '../EnvironmentContext';
import { useStatements, useSubscription } from './Plans';

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
  isAPIKeysPageRoot: boolean;
  shouldShowBilling: boolean;
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

  const subscription = useSubscription();
  const statements = useStatements();

  const hasNonFreeSubscription = subscription.data?.subscriptionItems.some(item => item.plan.hasBaseFee);

  // TODO(@BILLING): Remove this when C1s can disable user billing seperately from the organization billing.
  const shouldShowBilling =
    // The instance has at lease one visible plan the C2 can choose
    environment.commerceSettings.billing.organization.hasPaidPlans ||
    // The C2 has a subscription, it can be active or past due, or scheduled for cancellation.
    hasNonFreeSubscription ||
    // The C2 had a subscription in the past
    Boolean(statements.data.length > 0);

  const pages = useMemo(
    () => createOrganizationProfileCustomPages(customPages || [], clerk, shouldShowBilling, environment),
    [customPages, shouldShowBilling],
  );

  const navigateAfterLeaveOrganization = () =>
    navigate(ctx.afterLeaveOrganizationUrl || environment.displayConfig.afterLeaveOrganizationUrl);

  const isMembersPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS;
  const isGeneralPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.GENERAL;
  const isBillingPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.BILLING;
  const isAPIKeysPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.API_KEYS;
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
    isAPIKeysPageRoot,
    shouldShowBilling,
  };
};
