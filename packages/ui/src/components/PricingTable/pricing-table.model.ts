import { __internal_useOrganizationBase, useClerk, usePortalRoot, useSession, useUser } from '@clerk/shared/react';
import type { PricingTableProps } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import { organizationExceedsPlanSeatLimit } from '@/ui/utils/billingPlanSeats';
import { getClosestProfileScrollBox } from '@/ui/utils/getClosestProfileScrollBox';

import {
  usePaymentMethods,
  usePlans,
  usePlansContext,
  usePricingTableContext,
  useSubscriberTypeContext,
  useSubscription,
} from '../../contexts';
import type { PricingTableModel } from './pricing-table.types';

export const usePricingTableModel = (props: PricingTableProps): PricingTableModel => {
  const clerk = useClerk();
  const getContainer = usePortalRoot();
  const { user } = useUser();
  const { session } = useSession();
  const organization = __internal_useOrganizationBase();
  const subscriberType = useSubscriberTypeContext();
  const { mode = 'mounted', signInMode = 'redirect', highlightedPlan } = usePricingTableContext();
  const isCompact = mode === 'modal';
  const { data: subscription, subscriptionItems } = useSubscription({ keepPreviousData: false });
  const { data: plans } = usePlans({ keepPreviousData: false });
  const { revalidateAll } = usePlansContext();
  usePaymentMethods();

  const actor = user?.id;
  const sessionId = session?.id;
  const subject = subscriberType === 'organization' ? organization?.id : actor;
  const scopeKey = JSON.stringify([actor, sessionId, subscriberType, subject]);
  const plansToRender = clerk.isSignedIn && !subscription ? [] : plans;
  const current = useRef({ scopeKey, plans: plansToRender, version: 0 });
  const scopeVersion = current.current.version + (current.current.scopeKey === scopeKey ? 0 : 1);
  current.current = { scopeKey, plans: plansToRender, version: scopeVersion };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const isCurrentScope = () =>
    current.current.scopeKey === scopeKey &&
    current.current.version === scopeVersion &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    (subscriberType === 'organization' ? clerk.organization?.id : clerk.user?.id) === subject;
  const findPlan = (planId: string) =>
    mounted.current && isCurrentScope() ? current.current.plans.find(plan => plan.id === planId) : undefined;
  const canSelectPlan = (plan: (typeof plans)[number]) =>
    !!actor &&
    !!sessionId &&
    (subscriberType === 'user' ||
      (!!subject &&
        !!clerk.session?.checkAuthorization({ permission: 'org:sys_billing:manage' }) &&
        !!clerk.organization &&
        !organizationExceedsPlanSeatLimit(plan, clerk.organization)));
  const upcoming = isCompact ? subscriptionItems.find(item => item.status === 'upcoming') : undefined;
  const active = isCompact
    ? subscriptionItems.find(item => !item.canceledAt && item.status === 'active' && !item.plan.isDefault)
    : undefined;

  return {
    scopeKey,
    isFlowReady: clerk.isSignedIn ? !!subscription : plans.length > 0,
    useMatrix: mode !== 'modal' && 'layout' in props && props.layout === 'matrix',
    highlightedPlan,
    isCompact,
    planIds: plansToRender.map(plan => plan.id),
    defaultPlanPeriod: upcoming?.planPeriod ?? active?.planPeriod ?? 'annual',
    selectPlan: (planId, period, event) => {
      const plan = findPlan(planId);
      if (!plan) {
        return false;
      }
      if (!clerk.isSignedIn) {
        if (signInMode === 'modal') {
          void clerk.openSignIn({ getContainer });
        } else {
          void clerk.redirectToSignIn();
        }
        return true;
      }
      if (!canSelectPlan(plan)) {
        return false;
      }
      const planPeriod =
        period === 'annual' ? (plan.annualMonthlyFee ? 'annual' : 'month') : plan.fee ? 'month' : 'annual';
      let completed = false;
      let closed = false;
      clerk.__internal_openCheckout({
        planId: plan.id,
        planPeriod,
        for: subscriberType,
        appearance: props.checkoutProps?.appearance,
        newSubscriptionRedirectUrl: props.newSubscriptionRedirectUrl,
        portalRoot: getClosestProfileScrollBox(mode, event),
        onSubscriptionComplete: () => {
          if (!completed && isCurrentScope()) {
            completed = true;
            void revalidateAll();
          }
        },
        onClose: () => {
          if (!closed && isCurrentScope()) {
            closed = true;
            void clerk.setActive({ session: sessionId });
          }
        },
      });
      return true;
    },
    showPlanDetails: (planId, period, event) => {
      const plan = findPlan(planId);
      if (!plan) {
        return false;
      }
      clerk.__internal_openPlanDetails({
        plan,
        initialPlanPeriod: period,
        portalRoot: getClosestProfileScrollBox(mode, event),
      });
      return true;
    },
  };
};
