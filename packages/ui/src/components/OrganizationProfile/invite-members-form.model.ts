import { useClerk, useOrganization, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import { useEnvironment, usePlansContext, useSubscription } from '@/contexts';
import { useFetchRoles } from '@/ui/hooks/useFetchRoles';
import {
  getPaidSeatsUnitTier,
  getSeatUnitPrice,
  organizationAndInvitationsExceedsPurchasedSeats,
} from '@/ui/utils/billingPlanSeats';

export type InviteMembersParams = {
  emailAddresses: string[];
  role: string;
};

export const useInviteMembersFormModel = (onSuccess?: () => void) => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization, invitations } = useOrganization({
    invitations: {
      pageSize: 10,
      keepPreviousData: false,
    },
  });
  const { data: subscription, subscriptionItems } = useSubscription({ keepPreviousData: false });
  const { handleSelectPlan } = usePlansContext();
  const { organizationSettings } = useEnvironment();
  const { options, isLoading, hasRoleSetMigration } = useFetchRoles();
  const activeSubscriptionItem = subscription?.subscriptionItems.find(item => item.status === 'active');
  const seatUnitPrice = activeSubscriptionItem ? getSeatUnitPrice(activeSubscriptionItem.plan) : null;
  const isPerSeatCostPlan = Boolean(seatUnitPrice && getPaidSeatsUnitTier(seatUnitPrice));
  const defaultRole =
    organizationSettings.domains.defaultRole || (options?.length === 1 ? options[0].value : undefined);

  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const organizationId = organization?.id;
  const sourceKey = JSON.stringify([actor, sessionId, clientId, organizationId]);
  const current = useRef({ sourceKey, version: 0, clerk });
  const sourceChanged = current.current.sourceKey !== sourceKey || current.current.clerk !== clerk;
  const version = current.current.version + (sourceChanged ? 1 : 0);
  current.current = { sourceKey, version, clerk };
  const mounted = useRef(true);
  const latest = useRef<{
    organization: typeof organization;
    invitations: typeof invitations;
    subscriptionItems: typeof subscriptionItems;
    handleSelectPlan: typeof handleSelectPlan;
    onSuccess: typeof onSuccess;
  }>();
  latest.current = { organization, invitations, subscriptionItems, handleSelectPlan, onSuccess };
  useSafeLayoutEffect(() => {
    mounted.current = true;
    latest.current = { organization, invitations, subscriptionItems, handleSelectPlan, onSuccess };
    return () => {
      mounted.current = false;
      latest.current = undefined;
    };
  }, []);
  const canRun = () =>
    mounted.current &&
    !!actor &&
    !!organizationId &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId &&
    clerk.organization?.id === organizationId &&
    current.current.version === version;

  const inviteMembers = async (params: InviteMembersParams, canContinue = () => true) => {
    const isCurrent = () => canRun() && canContinue();
    if (!isCurrent() || !latest.current?.organization) {
      return;
    }
    try {
      await latest.current.organization.inviteMembers(params);
      if (!isCurrent()) {
        return;
      }
      await latest.current?.invitations?.revalidate?.();
      if (isCurrent()) {
        latest.current?.onSuccess?.();
      }
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
    }
  };

  const openSandboxCheckout = async (
    params: InviteMembersParams,
    portalRoot: HTMLElement | null | undefined,
    canContinue = () => true,
  ) => {
    const isCurrent = () => canRun() && canContinue();
    const active = latest.current;
    if (!isCurrent() || !active?.organization) {
      return;
    }
    const seatsQuantity =
      active.organization.membersCount + active.organization.pendingInvitationsCount + params.emailAddresses.length;
    try {
      const { data: plans } = await clerk.billing.getPlans({
        for: 'organization',
        orgId: organizationId,
        minSeats: seatsQuantity,
        pageSize: 500,
      });
      if (!isCurrent()) {
        return;
      }
      const checkoutSubscriptionItem = latest.current?.subscriptionItems.find(
        item => item.status === 'active' || item.status === 'past_due',
      );
      const checkoutPlan =
        plans.find(plan => plan.id === checkoutSubscriptionItem?.plan.id) ??
        plans.find(plan => !plan.isDefault) ??
        plans[0];
      clerk.__internal_openCheckout({
        for: 'organization',
        planId: checkoutPlan?.id,
        planPeriod: checkoutSubscriptionItem?.planPeriod ?? (checkoutPlan?.fee ? 'month' : 'annual'),
        seatsQuantity,
        priceId: checkoutSubscriptionItem?.priceId,
        portalRoot,
      });
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
    }
  };

  const openSeatCheckout = async (
    seatsQuantity: number | undefined,
    portalRoot: HTMLElement | null | undefined,
    onSubscriptionComplete: () => void,
    canContinue = () => true,
  ) => {
    const isCurrent = () => canRun() && canContinue();
    if (!isCurrent()) {
      return undefined;
    }
    try {
      const { data: plans } = await clerk.billing.getPlans({
        for: 'organization',
        orgId: organizationId,
        minSeats: seatsQuantity,
        pageSize: 500,
      });
      if (!isCurrent()) {
        return undefined;
      }
      if (plans.length === 0) {
        return 'contact-support' as const;
      }
      const currentItem = latest.current?.subscriptionItems.find(
        item => item.status === 'active' || item.status === 'past_due',
      );
      if (currentItem) {
        const supportsSeats = plans.some(
          plan =>
            plan.id === currentItem.plan.id && plan.availablePrices?.some(price => price.id === currentItem.priceId),
        );
        if (supportsSeats) {
          let completed = false;
          latest.current?.handleSelectPlan({
            mode: 'modal',
            plan: currentItem.plan,
            planPeriod: currentItem.planPeriod,
            seatsQuantity,
            priceId: currentItem.priceId,
            portalRoot,
            onSubscriptionComplete: () => {
              if (!completed && isCurrent()) {
                completed = true;
                onSubscriptionComplete();
              }
            },
          });
          return 'checkout' as const;
        }
      }
      return 'change-plan' as const;
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
      return undefined;
    }
  };

  return {
    scopeKey: JSON.stringify([sourceKey, version]),
    canRun,
    hasOrganization: Boolean(organization),
    roles: options,
    isRoleLoading: isLoading,
    hasRoleSetMigration,
    defaultRole,
    isPerSeatCostPlan,
    mustPurchaseSeats: (emailCount: number) =>
      isPerSeatCostPlan &&
      Boolean(
        organization &&
        organizationAndInvitationsExceedsPurchasedSeats(activeSubscriptionItem, organization, emailCount),
      ),
    inviteMembers,
    openSandboxCheckout,
    openSeatCheckout,
  };
};
