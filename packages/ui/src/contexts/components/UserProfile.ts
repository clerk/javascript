import { useClerk, useUser } from '@clerk/shared/react';
import { createContext, useContext, useMemo } from 'react';

import type { NavbarRoute } from '@/ui/elements/Navbar';
import type { CustomPageContent } from '@/ui/utils/createCustomPages';
import { createUserProfileCustomPages } from '@/ui/utils/createCustomPages';

import type { ParsedQueryString } from '../../router';
import { useRouter } from '../../router';
import type { UserProfileCtx } from '../../types';
import { useEnvironment } from '../EnvironmentContext';
import { useStatements, useSubscription } from './Plans';

type PagesType = {
  routes: NavbarRoute[];
  contents: CustomPageContent[];
  pageToRootNavbarRouteMap: Record<string, NavbarRoute>;
};

export type UserProfileContextType = UserProfileCtx & {
  queryParams: ParsedQueryString;
  authQueryString: string | null;
  pages: PagesType;
  shouldAllowIdentificationCreation: boolean;
  shouldShowBilling: boolean;
};

export const UserProfileContext = createContext<UserProfileCtx | null>(null);

export const useUserProfileContext = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  const { queryParams } = useRouter();
  const clerk = useClerk();
  const environment = useEnvironment();
  const { user } = useUser();

  const subscription = useSubscription();
  const statements = useStatements();

  const hasNonFreeSubscription = subscription.data?.subscriptionItems.some(item => item.plan.hasBaseFee);

  // TODO(@BILLING): Remove this when C1s can disable user billing seperately from the organization billing.
  const shouldShowBilling =
    // The instance has at lease one visible plan the C2 can choose
    environment.commerceSettings.billing.user.hasPaidPlans ||
    // The C2 has a subscription, it can be active or past due, or scheduled for cancellation.
    hasNonFreeSubscription ||
    // The C2 had a subscription in the past
    Boolean(statements.data.length > 0);

  if (!context || context.componentName !== 'UserProfile') {
    throw new Error('Clerk: useUserProfileContext called outside of the mounted UserProfile component.');
  }

  const { componentName, customPages, ...ctx } = context;

  const pages = useMemo(() => {
    return createUserProfileCustomPages(customPages || [], clerk, shouldShowBilling, environment);
  }, [customPages, shouldShowBilling]);

  const shouldAllowIdentificationCreation = useMemo(() => {
    const { enterpriseSSO } = environment.userSettings;
    const showEnterpriseAccounts = user && enterpriseSSO.enabled;

    return (
      !showEnterpriseAccounts ||
      !user?.enterpriseAccounts.some(
        enterpriseAccount =>
          enterpriseAccount.active && enterpriseAccount.enterpriseConnection?.disableAdditionalIdentifications,
      )
    );
  }, [user, environment.userSettings.enterpriseSSO]);

  return {
    ...ctx,
    pages,
    componentName,
    queryParams,
    authQueryString: '',
    shouldAllowIdentificationCreation,
    shouldShowBilling,
  };
};
