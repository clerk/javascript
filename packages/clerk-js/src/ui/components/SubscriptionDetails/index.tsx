import { useClerk, useOrganization } from '@clerk/shared/react';
import type {
  __internal_CheckoutProps,
  __internal_SubscriptionDetailsProps,
  BillingPlanResource,
  BillingSubscriptionItemResource,
} from '@clerk/shared/types';
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
import { LineItems } from '@/ui/elements/LineItems';
import { handleError } from '@/ui/utils/errorHandler';
import { formatDate } from '@/ui/utils/formatDate';

import { SubscriberTypeContext, usePlansContext, useSubscriberTypeContext, useSubscription } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import {
  Button,
  Col,
  descriptors,
  Flex,
  Flow,
  Heading,
  localizationKeys,
  Spinner,
  Text,
  useLocalizations,
} from '../../customizables';
import { SubscriptionBadge } from '../Subscriptions/badge';

const isFreePlan = (plan: BillingPlanResource) => !plan.hasBaseFee;

// We cannot derive the state of confirmation modal from the existence subscription, as it will make the animation laggy when the confirmation closes.
const SubscriptionForCancellationContext = React.createContext<{
  subscription: BillingSubscriptionItemResource | null;
  setSubscription: (subscription: BillingSubscriptionItemResource | null) => void;
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
    <Flow.Root flow='subscriptionDetails'>
      <Flow.Part>
        <Drawer.Content>
          <SubscriptionDetailsContext.Provider value={{ componentName: 'SubscriptionDetails', ...props }}>
            <SubscriberTypeContext.Provider value={props.for}>
              <SubscriptionDetailsInternal {...props} />
            </SubscriberTypeContext.Provider>
          </SubscriptionDetailsContext.Provider>
        </Drawer.Content>
      </Flow.Part>
    </Flow.Root>
  );
};

type UseGuessableSubscriptionResult<Or extends 'throw' | undefined = undefined> = Or extends 'throw'
  ? {
      upcomingSubscription?: BillingSubscriptionItemResource;
      pastDueSubscription?: BillingSubscriptionItemResource;
      activeSubscription?: BillingSubscriptionItemResource;
      anySubscription: BillingSubscriptionItemResource;
      isLoading: boolean;
    }
  : {
      upcomingSubscription?: BillingSubscriptionItemResource;
      pastDueSubscription?: BillingSubscriptionItemResource;
      activeSubscription?: BillingSubscriptionItemResource;
      anySubscription?: BillingSubscriptionItemResource;
      isLoading: boolean;
    };

function useGuessableSubscription<Or extends 'throw' | undefined = undefined>(options?: {
  or?: Or;
}): UseGuessableSubscriptionResult<Or> {
  const { subscriptionItems, isLoading } = useSubscription();
  const activeSubscription = subscriptionItems?.find(sub => sub.status === 'active');
  const upcomingSubscription = subscriptionItems?.find(sub => sub.status === 'upcoming');
  const pastDueSubscription = subscriptionItems?.find(sub => sub.status === 'past_due');

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
  const [subscriptionForCancellation, setSubscriptionForCancellation] =
    useState<BillingSubscriptionItemResource | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const { subscriptionItems, isLoading } = useSubscription();
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
      <Drawer.Header title={localizationKeys('billing.subscriptionDetails.title')} />

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
        {subscriptionItems?.map(subscriptionItem => (
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
  const {
    subscription: selectedSubscription,
    confirmationOpen,
    setConfirmationOpen,
  } = useContext(SubscriptionForCancellationContext);
  const { data: subscription } = useSubscription();
  const { setIsOpen } = useDrawerContext();
  const { onSubscriptionCancel } = useSubscriptionDetailsContext();

  const onOpenChange = useCallback((open: boolean) => setConfirmationOpen(open), [setConfirmationOpen]);

  const cancelSubscription = useCallback(async () => {
    if (!selectedSubscription) {
      return;
    }

    setError(undefined);
    setLoading();

    await selectedSubscription
      .cancel({ orgId: subscriberType === 'organization' ? organization?.id : undefined })
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
  }, [
    selectedSubscription,
    setError,
    setLoading,
    subscriberType,
    organization?.id,
    onSubscriptionCancel,
    setIsOpen,
    setIdle,
  ]);

  // Missing nextPayment means that an upcoming subscription is for the free plan
  if (!subscription?.nextPayment) {
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
                localizationKey={
                  selectedSubscription?.isFreeTrial
                    ? localizationKeys('billing.keepFreeTrial')
                    : localizationKeys('billing.keepSubscription')
                }
              />
            )}
            <Button
              variant='solid'
              colorScheme='danger'
              size='sm'
              textVariant='buttonLarge'
              isLoading={isLoading}
              onClick={() => void cancelSubscription()}
              localizationKey={
                selectedSubscription?.isFreeTrial
                  ? localizationKeys('billing.cancelFreeTrial', {
                      plan: selectedSubscription.plan.name,
                    })
                  : localizationKeys('billing.cancelSubscription')
              }
            />
          </>
        }
      >
        {selectedSubscription ? (
          <>
            <Heading
              elementDescriptor={descriptors.drawerConfirmationTitle}
              as='h2'
              textVariant='h3'
              localizationKey={
                selectedSubscription?.isFreeTrial
                  ? localizationKeys('billing.cancelFreeTrialTitle', {
                      plan: selectedSubscription.plan.name,
                    })
                  : localizationKeys('billing.cancelSubscriptionTitle', {
                      plan: `${selectedSubscription.status === 'upcoming' ? 'upcoming ' : ''}${selectedSubscription.plan.name}`,
                    })
              }
            />
            <Text
              elementDescriptor={descriptors.drawerConfirmationDescription}
              colorScheme='secondary'
              localizationKey={
                selectedSubscription?.isFreeTrial
                  ? localizationKeys('billing.cancelFreeTrialAccessUntil', {
                      plan: selectedSubscription.plan.name,
                      date: selectedSubscription.periodEnd as Date,
                    })
                  : selectedSubscription.status === 'upcoming'
                    ? localizationKeys('billing.cancelSubscriptionNoCharge')
                    : selectedSubscription.status === 'past_due'
                      ? localizationKeys('billing.cancelSubscriptionPastDue')
                      : localizationKeys('billing.cancelSubscriptionAccessUntil', {
                          plan: selectedSubscription.plan.name,
                          // this will always be defined in this state
                          date: selectedSubscription.periodEnd as Date,
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
  const { activeSubscription } = useGuessableSubscription({
    or: 'throw',
  });
  const { data: subscription } = useSubscription();

  if (
    // Missing nextPayment means that an upcoming subscription is for the free plan
    !subscription?.nextPayment ||
    !activeSubscription
  ) {
    return null;
  }

  const { isFreeTrial } = activeSubscription;

  return (
    <LineItems.Root>
      <LineItems.Group>
        <LineItems.Title description={localizationKeys('billing.subscriptionDetails.currentBillingCycle')} />
        <LineItems.Description
          text={
            activeSubscription.planPeriod === 'month'
              ? localizationKeys('billing.monthly')
              : localizationKeys('billing.annually')
          }
        />
      </LineItems.Group>
      <LineItems.Group>
        <LineItems.Title
          description={localizationKeys(
            `billing.subscriptionDetails.${isFreeTrial ? 'firstPaymentOn' : 'nextPaymentOn'}`,
          )}
        />
        <LineItems.Description text={formatDate(subscription.nextPayment.date)} />
      </LineItems.Group>
      <LineItems.Group>
        <LineItems.Title
          description={localizationKeys(
            `billing.subscriptionDetails.${isFreeTrial ? 'firstPaymentAmount' : 'nextPaymentAmount'}`,
          )}
        />
        <LineItems.Description
          prefix={subscription.nextPayment.amount.currency}
          text={`${subscription.nextPayment.amount.currencySymbol}${subscription.nextPayment.amount.amountFormatted}`}
        />
      </LineItems.Group>
    </LineItems.Root>
  );
}

const SubscriptionCardActions = ({ subscription }: { subscription: BillingSubscriptionItemResource }) => {
  const { portalRoot } = useSubscriptionDetailsContext();
  const { __internal_openCheckout } = useClerk();
  const subscriberType = useSubscriberTypeContext();
  const { setIsOpen } = useDrawerContext();
  const { revalidateAll } = usePlansContext();
  const { setSubscription, setConfirmationOpen } = useContext(SubscriptionForCancellationContext);
  const canOrgManageBilling = useProtect(has => has({ permission: 'org:sys_billing:manage' }));
  const canManageBilling = subscriberType === 'user' || canOrgManageBilling;

  const isSwitchable =
    ((subscription.planPeriod === 'month' && Boolean(subscription.plan.annualMonthlyFee)) ||
      subscription.planPeriod === 'annual') &&
    subscription.status !== 'past_due';
  const isFree = isFreePlan(subscription.plan);
  const isCancellable = subscription.canceledAt === null && !isFree;
  const isReSubscribable = subscription.canceledAt !== null && !isFree;

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
                ? localizationKeys('billing.switchToAnnual')
                : localizationKeys('billing.switchToMonthly'),
            onClick: () => {
              openCheckout({
                planId: subscription.plan.id,
                planPeriod: subscription.planPeriod === 'month' ? 'annual' : 'month',
                for: subscriberType,
              });
            },
          }
        : null,
      isCancellable
        ? {
            isDestructive: true,
            label: subscription.isFreeTrial
              ? localizationKeys('billing.cancelFreeTrial', {
                  plan: subscription.plan.name,
                })
              : localizationKeys('billing.cancelSubscription'),
            onClick: () => {
              setSubscription(subscription);
              setConfirmationOpen(true);
            },
          }
        : null,
      isReSubscribable
        ? {
            label: localizationKeys('billing.reSubscribe'),
            onClick: () => {
              openCheckout({
                planId: subscription.plan.id,
                planPeriod: subscription.planPeriod,
                for: subscriberType,
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
    <Flex
      elementDescriptor={descriptors.subscriptionDetailsCardActions}
      gap={2}
      sx={t => ({
        paddingInline: t.space.$3,
        paddingBlock: t.space.$3,
        borderBlockStartWidth: t.borderWidths.$normal,
        borderBlockStartStyle: t.borderStyles.$solid,
        borderBlockStartColor: t.colors.$borderAlpha100,
      })}
    >
      {actions.map((action, index) => (
        <Button
          key={index}
          elementDescriptor={
            action.isDestructive
              ? descriptors.subscriptionDetailsCancelButton
              : descriptors.subscriptionDetailsActionButton
          }
          variant={action.isDestructive ? 'ghost' : 'outline'}
          colorScheme={action.isDestructive ? 'danger' : undefined}
          size='xs'
          textVariant='buttonSmall'
          onClick={action.onClick}
          localizationKey={action.label}
        />
      ))}
    </Flex>
  );
};

// New component for individual subscription cards
const SubscriptionCard = ({ subscription }: { subscription: BillingSubscriptionItemResource }) => {
  const { t } = useLocalizations();

  const fee =
    subscription.planPeriod === 'month'
      ? subscription.plan.fee
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        subscription.plan.annualFee!;

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
            subscription={subscription.isFreeTrial ? { status: 'free_trial' } : subscription}
            elementDescriptor={descriptors.subscriptionDetailsCardBadge}
          />
        </Flex>

        {/* Pricing details */}
        <Flex
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
            {fee.currencySymbol}
            {fee.amountFormatted} /{' '}
            {t(localizationKeys(`billing.${subscription.planPeriod === 'month' ? 'month' : 'year'}`))}
          </Text>
        </Flex>
      </Col>

      {subscription.pastDueAt ? (
        <DetailRow
          label={localizationKeys('billing.subscriptionDetails.pastDueAt')}
          value={formatDate(subscription.pastDueAt)}
        />
      ) : null}

      {subscription.status === 'active' ? (
        <>
          <DetailRow
            label={
              subscription.isFreeTrial
                ? localizationKeys('billing.subscriptionDetails.trialStartedOn')
                : localizationKeys('billing.subscriptionDetails.subscribedOn')
            }
            value={formatDate(subscription.createdAt)}
          />
          {/* The free plan does not have a period end date */}
          {subscription.periodEnd && (
            <DetailRow
              label={
                subscription.canceledAt
                  ? localizationKeys('billing.subscriptionDetails.endsOn')
                  : subscription.isFreeTrial
                    ? localizationKeys('billing.subscriptionDetails.trialEndsOn')
                    : localizationKeys('billing.subscriptionDetails.renewsAt')
              }
              value={formatDate(subscription.periodEnd)}
            />
          )}
        </>
      ) : null}

      {subscription.status === 'upcoming' ? (
        <DetailRow
          label={localizationKeys('billing.subscriptionDetails.beginsOn')}
          value={formatDate(subscription.periodStart)}
        />
      ) : null}

      <SubscriptionCardActions subscription={subscription} />
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
