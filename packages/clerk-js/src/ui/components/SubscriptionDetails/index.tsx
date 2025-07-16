import { useClerk, useOrganization } from '@clerk/shared/react';
import type {
  __internal_CheckoutProps,
  __internal_SubscriptionDetailsProps,
  CommercePlanResource,
  CommerceSubscriptionResource,
} from '@clerk/types';
import * as React from 'react';
import { useCallback, useContext, useState } from 'react';

import { useProtect } from '@/ui/common/Gate';
import {
  SubscriptionDetailsContext,
  useSubscriptionDetailsContext,
} from '@/ui/contexts/components/SubscriptionDetails';
import { Avatar } from '@/ui/elements/Avatar';
import { CardAlert } from '@/ui/elements/Card/CardAlert';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Drawer, useDrawerContext } from '@/ui/elements/Drawer';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/ui/utils/errorHandler';
import { formatDate } from '@/ui/utils/formatDate';

const isFreePlan = (plan: CommercePlanResource) => !plan.hasBaseFee;

import { LineItems } from '@/ui/elements/LineItems';

import { SubscriberTypeContext, usePlansContext, useSubscriberTypeContext, useSubscriptions } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import {
  Button,
  Col,
  descriptors,
  Flex,
  Heading,
  localizationKeys,
  Spinner,
  Text,
  useLocalizations,
} from '../../customizables';
import { SubscriptionBadge } from '../Subscriptions/badge';

// We cannot derive the state of confrimation modal from the existance subscription, as it will make the animation laggy when the confimation closes.
const SubscriptionForCancellationContext = React.createContext<{
  subscription: CommerceSubscriptionResource | null;
  setSubscription: (subscription: CommerceSubscriptionResource | null) => void;
  confirmationOpen: boolean;
  setConfirmationOpen: (confirmationOpen: boolean) => void;
}>({
  confirmationOpen: false,
  setConfirmationOpen: () => {},
  subscription: null,
  setSubscription: () => {},
});

export const SubscriptionDetails = (props: __internal_SubscriptionDetailsProps) => {
  return (
    <Drawer.Content>
      <SubscriptionDetailsContext.Provider value={{ componentName: 'SubscriptionDetails', ...props }}>
        <SubscriberTypeContext.Provider value={props.for}>
          <SubscriptionDetailsInternal {...props} />
        </SubscriberTypeContext.Provider>
      </SubscriptionDetailsContext.Provider>
    </Drawer.Content>
  );
};

type UseGuessableSubscriptionResult<Or extends 'throw' | undefined = undefined> = Or extends 'throw'
  ? {
      upcomingSubscription?: CommerceSubscriptionResource;
      pastDueSubscription?: CommerceSubscriptionResource;
      activeSubscription?: CommerceSubscriptionResource;
      anySubscription: CommerceSubscriptionResource;
      isLoading: boolean;
    }
  : {
      upcomingSubscription?: CommerceSubscriptionResource;
      pastDueSubscription?: CommerceSubscriptionResource;
      activeSubscription?: CommerceSubscriptionResource;
      anySubscription?: CommerceSubscriptionResource;
      isLoading: boolean;
    };

function useGuessableSubscription<Or extends 'throw' | undefined = undefined>(options?: {
  or?: Or;
}): UseGuessableSubscriptionResult<Or> {
  const { data: subscriptions, isLoading } = useSubscriptions();
  const activeSubscription = subscriptions?.find(sub => sub.status === 'active');
  const upcomingSubscription = subscriptions?.find(sub => sub.status === 'upcoming');
  const pastDueSubscription = subscriptions?.find(sub => sub.status === 'past_due');

  if (options?.or === 'throw' && !activeSubscription && !pastDueSubscription) {
    throw new Error('No active or past due subscription found');
  }

  return {
    upcomingSubscription,
    pastDueSubscription,
    activeSubscription: activeSubscription as any, // Type is correct due to the throw above
    anySubscription: (upcomingSubscription || activeSubscription || pastDueSubscription) as any,
    isLoading,
  };
}

const SubscriptionDetailsInternal = (props: __internal_SubscriptionDetailsProps) => {
  const { organization: _organization } = useOrganization();
  const [subscriptionForCancellation, setSubscriptionForCancellation] = useState<CommerceSubscriptionResource | null>(
    null,
  );
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const {
    buttonPropsForPlan: _buttonPropsForPlan,
    isDefaultPlanImplicitlyActiveOrUpcoming: _isDefaultPlanImplicitlyActiveOrUpcoming,
  } = usePlansContext();

  const { data: subscriptions, isLoading } = useSubscriptions();
  const { activeSubscription, pastDueSubscription } = useGuessableSubscription();

  if (isLoading) {
    return (
      <Spinner
        sx={{
          margin: 'auto',
        }}
      />
    );
  }

  if (!activeSubscription && !pastDueSubscription) {
    // Should never happen, since Free will always be active
    return null;
  }

  return (
    <SubscriptionForCancellationContext.Provider
      value={{
        subscription: subscriptionForCancellation,
        setSubscription: setSubscriptionForCancellation,
        confirmationOpen,
        setConfirmationOpen,
      }}
    >
      <Drawer.Header title={localizationKeys('commerce.subscriptionDetails.title')} />

      <Drawer.Body
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflowY: 'auto',
          padding: t.space.$4,
          gap: t.space.$4,
        })}
      >
        {/* Subscription Cards */}
        {subscriptions?.map(subscriptionItem => (
          <SubscriptionCard
            key={subscriptionItem.id}
            subscription={subscriptionItem}
            {...props}
          />
        ))}
      </Drawer.Body>

      <SubscriptionDetailsFooter />
    </SubscriptionForCancellationContext.Provider>
  );
};

const SubscriptionDetailsFooter = withCardStateProvider(() => {
  const subscriberType = useSubscriberTypeContext();
  const { organization } = useOrganization();
  const { isLoading, error, setError, setLoading, setIdle } = useCardState();
  const { subscription, confirmationOpen, setConfirmationOpen } = useContext(SubscriptionForCancellationContext);
  const { anySubscription } = useGuessableSubscription({ or: 'throw' });
  const { setIsOpen } = useDrawerContext();
  const { onSubscriptionCancel } = useSubscriptionDetailsContext();

  const onOpenChange = useCallback((open: boolean) => setConfirmationOpen(open), [setConfirmationOpen]);

  const cancelSubscription = useCallback(async () => {
    if (!subscription) {
      return;
    }

    setError(undefined);
    setLoading();

    await subscription
      .cancel({ orgId: subscriberType === 'org' ? organization?.id : undefined })
      .then(() => {
        onSubscriptionCancel?.();
        if (setIsOpen) {
          setIsOpen(false);
        }
      })
      .catch(error => {
        handleError(error, [], setError);
      })
      .finally(() => {
        setIdle();
      });
  }, [subscription, setError, setLoading, subscriberType, organization?.id, onSubscriptionCancel, setIsOpen, setIdle]);

  // If either the active or upcoming subscription is the free plan, then a C1 cannot switch to a different period or cancel the plan
  if (isFreePlan(anySubscription.plan) || anySubscription.status === 'past_due') {
    return null;
  }

  return (
    <Drawer.Footer>
      <SubscriptionDetailsSummary />

      <Drawer.Confirmation
        open={confirmationOpen}
        onOpenChange={onOpenChange}
        actionsSlot={
          <>
            {!isLoading && (
              <Button
                variant='ghost'
                size='sm'
                textVariant='buttonLarge'
                onClick={() => {
                  setIdle();
                  setError(undefined);
                  onOpenChange(false);
                }}
                localizationKey={localizationKeys('commerce.keepSubscription')}
              />
            )}
            <Button
              variant='solid'
              colorScheme='danger'
              size='sm'
              textVariant='buttonLarge'
              isLoading={isLoading}
              onClick={() => void cancelSubscription()}
              localizationKey={localizationKeys('commerce.cancelSubscription')}
            />
          </>
        }
      >
        {subscription ? (
          <>
            <Heading
              elementDescriptor={descriptors.drawerConfirmationTitle}
              as='h2'
              textVariant='h3'
              localizationKey={localizationKeys('commerce.cancelSubscriptionTitle', {
                plan: `${subscription.status === 'upcoming' ? 'upcoming ' : ''}${subscription.plan.name}`,
              })}
            />
            <Text
              elementDescriptor={descriptors.drawerConfirmationDescription}
              colorScheme='secondary'
              localizationKey={
                subscription.status === 'upcoming'
                  ? localizationKeys('commerce.cancelSubscriptionNoCharge')
                  : localizationKeys('commerce.cancelSubscriptionAccessUntil', {
                      plan: subscription.plan.name,
                      // @ts-expect-error this will always be defined in this state
                      date: subscription.periodEndDate,
                    })
              }
            />
            <CardAlert>{error}</CardAlert>
          </>
        ) : null}
      </Drawer.Confirmation>
    </Drawer.Footer>
  );
});

function SubscriptionDetailsSummary() {
  const { anySubscription, activeSubscription, upcomingSubscription } = useGuessableSubscription({
    or: 'throw',
  });

  if (!activeSubscription) {
    return null;
  }

  return (
    <LineItems.Root>
      <LineItems.Group>
        <LineItems.Title description={localizationKeys('commerce.subscriptionDetails.currentBillingCycle')} />
        <LineItems.Description
          text={
            activeSubscription.planPeriod === 'month'
              ? localizationKeys('commerce.monthly')
              : localizationKeys('commerce.annually')
          }
        />
      </LineItems.Group>
      <LineItems.Group>
        <LineItems.Title description={localizationKeys('commerce.subscriptionDetails.nextPaymentOn')} />
        <LineItems.Description
          text={
            upcomingSubscription
              ? formatDate(upcomingSubscription.periodStartDate)
              : anySubscription.periodEndDate
                ? formatDate(anySubscription.periodEndDate)
                : '-'
          }
        />
      </LineItems.Group>
      <LineItems.Group>
        <LineItems.Title description={localizationKeys('commerce.subscriptionDetails.nextPaymentAmount')} />
        <LineItems.Description
          prefix={anySubscription.plan.currency}
          text={`${anySubscription.plan.currencySymbol}${
            anySubscription.planPeriod === 'month'
              ? anySubscription.plan.amountFormatted
              : anySubscription.plan.annualAmountFormatted
          }`}
        />
      </LineItems.Group>
    </LineItems.Root>
  );
}

const SubscriptionCardActions = ({ subscription }: { subscription: CommerceSubscriptionResource }) => {
  const { portalRoot } = useSubscriptionDetailsContext();
  const { __internal_openCheckout } = useClerk();
  const subscriberType = useSubscriberTypeContext();
  const { setIsOpen } = useDrawerContext();
  const { revalidateAll } = usePlansContext();
  const { setSubscription, setConfirmationOpen } = useContext(SubscriptionForCancellationContext);
  const canOrgManageBilling = useProtect(has => has({ permission: 'org:sys_billing:manage' }));
  const canManageBilling = subscriberType === 'user' || canOrgManageBilling;

  const isSwitchable =
    ((subscription.planPeriod === 'month' && subscription.plan.annualMonthlyAmount > 0) ||
      subscription.planPeriod === 'annual') &&
    subscription.status !== 'past_due';
  const isFree = isFreePlan(subscription.plan);
  const isCancellable = subscription.canceledAtDate === null && !isFree && subscription.status !== 'past_due';
  const isReSubscribable = subscription.canceledAtDate !== null && !isFree;

  const openCheckout = useCallback(
    (params?: __internal_CheckoutProps) => {
      if (setIsOpen) {
        setIsOpen(false);
      }

      __internal_openCheckout({
        ...params,
        onSubscriptionComplete: () => {
          void revalidateAll();
        },
        portalRoot,
      });
    },
    [__internal_openCheckout, revalidateAll, portalRoot, setIsOpen],
  );

  const actions = React.useMemo(() => {
    if (!canManageBilling) {
      return [];
    }

    return [
      isSwitchable
        ? {
            label:
              subscription.planPeriod === 'month'
                ? localizationKeys('commerce.switchToAnnualWithAnnualPrice', {
                    price: subscription.plan.annualAmountFormatted,
                    currency: subscription.plan.currencySymbol,
                  })
                : localizationKeys('commerce.switchToMonthlyWithPrice', {
                    price: subscription.plan.amountFormatted,
                    currency: subscription.plan.currencySymbol,
                  }),
            onClick: () => {
              openCheckout({
                planId: subscription.plan.id,
                planPeriod: subscription.planPeriod === 'month' ? 'annual' : 'month',
                subscriberType,
              });
            },
          }
        : null,
      isCancellable
        ? {
            isDestructive: true,
            label: localizationKeys('commerce.cancelSubscription'),
            onClick: () => {
              setSubscription(subscription);
              setConfirmationOpen(true);
            },
          }
        : null,
      isReSubscribable
        ? {
            label: localizationKeys('commerce.reSubscribe'),
            onClick: () => {
              openCheckout({
                planId: subscription.plan.id,
                planPeriod: subscription.planPeriod,
                subscriberType,
              });
            },
          }
        : null,
    ].filter(a => a !== null);
  }, [
    isSwitchable,
    subscription,
    isCancellable,
    openCheckout,
    subscriberType,
    setSubscription,
    canManageBilling,
    isReSubscribable,
    setConfirmationOpen,
  ]);

  if (actions.length === 0) {
    return null;
  }

  return (
    <ThreeDotsMenu
      variant='bordered'
      actions={actions}
    />
  );
};

// New component for individual subscription cards
const SubscriptionCard = ({ subscription }: { subscription: CommerceSubscriptionResource }) => {
  const { t } = useLocalizations();

  return (
    <Col
      elementDescriptor={descriptors.subscriptionDetailsCard}
      sx={t => ({
        borderRadius: t.radii.$md,
        boxShadow: t.shadows.$tableBodyShadow,
      })}
    >
      <Col
        elementDescriptor={descriptors.subscriptionDetailsCardBody}
        gap={3}
        sx={t => ({
          padding: t.space.$3,
        })}
      >
        {/* Header with name and badge */}
        <Flex
          elementDescriptor={descriptors.subscriptionDetailsCardHeader}
          align='center'
          gap={2}
        >
          {subscription.plan.avatarUrl ? (
            <Avatar
              boxElementDescriptor={descriptors.planDetailAvatar}
              size={_ => 40}
              title={subscription.plan.name}
              rounded={false}
              imageUrl={subscription.plan.avatarUrl}
            />
          ) : null}

          <Text
            elementDescriptor={descriptors.subscriptionDetailsCardTitle}
            variant='h2'
            sx={t => ({
              fontSize: t.fontSizes.$lg,
              fontWeight: t.fontWeights.$semibold,
              color: t.colors.$colorForeground,
              marginInlineEnd: 'auto',
            })}
          >
            {subscription.plan.name}
          </Text>
          <SubscriptionBadge
            subscription={subscription}
            elementDescriptor={descriptors.subscriptionDetailsCardBadge}
          />
        </Flex>

        {/* Pricing details */}
        <Flex
          elementDescriptor={descriptors.subscriptionDetailsCardActions}
          justify='between'
          align='center'
        >
          <Text
            variant='body'
            colorScheme='secondary'
            sx={t => ({
              fontWeight: t.fontWeights.$medium,
              textTransform: 'lowercase',
            })}
          >
            {subscription.planPeriod === 'month'
              ? `${subscription.plan.currencySymbol}${subscription.plan.amountFormatted} / ${t(localizationKeys('commerce.month'))}`
              : `${subscription.plan.currencySymbol}${subscription.plan.annualAmountFormatted} / ${t(localizationKeys('commerce.year'))}`}
          </Text>

          <SubscriptionCardActions subscription={subscription} />
        </Flex>
      </Col>

      {subscription.pastDueAt ? (
        <DetailRow
          label={localizationKeys('commerce.subscriptionDetails.pastDueAt')}
          value={formatDate(subscription.pastDueAt)}
        />
      ) : null}

      {subscription.status === 'active' ? (
        <>
          <DetailRow
            label={localizationKeys('commerce.subscriptionDetails.subscribedOn')}
            value={formatDate(subscription.createdAt)}
          />
          {/* The free plan does not have a period end date */}
          {subscription.periodEndDate && (
            <DetailRow
              label={
                subscription.canceledAtDate
                  ? localizationKeys('commerce.subscriptionDetails.endsOn')
                  : localizationKeys('commerce.subscriptionDetails.renewsAt')
              }
              value={formatDate(subscription.periodEndDate)}
            />
          )}
        </>
      ) : null}

      {subscription.status === 'upcoming' ? (
        <DetailRow
          label={localizationKeys('commerce.subscriptionDetails.beginsOn')}
          value={formatDate(subscription.periodStartDate)}
        />
      ) : null}
    </Col>
  );
};

// Helper component for detail rows
const DetailRow = ({ label, value }: { label: LocalizationKey; value: string }) => (
  <Flex
    elementDescriptor={descriptors.subscriptionDetailsDetailRow}
    justify='between'
    align='center'
    sx={t => ({
      paddingInline: t.space.$3,
      paddingBlock: t.space.$3,
      borderBlockStartWidth: t.borderWidths.$normal,
      borderBlockStartStyle: t.borderStyles.$solid,
      borderBlockStartColor: t.colors.$borderAlpha100,
    })}
  >
    <Text
      elementDescriptor={descriptors.subscriptionDetailsDetailRowLabel}
      localizationKey={label}
    />
    <Text
      elementDescriptor={descriptors.subscriptionDetailsDetailRowValue}
      colorScheme='secondary'
    >
      {value}
    </Text>
  </Flex>
);
