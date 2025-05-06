import type { CommercePlanResource, CommerceSubscriptionResource } from '@clerk/types';

import { useProtect } from '../../common';
import { usePlansContext, useSubscriberTypeContext } from '../../contexts';
import {
  Badge,
  Button,
  Col,
  Flex,
  Icon,
  localizationKeys,
  Span,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '../../customizables';
import { CogFilled, Plans } from '../../icons';

// TODO(commerce): This will probably need to handled by FAPI
function includeFreeToSubscriptionsLint(subscriptions: CommerceSubscriptionResource[], plans: CommercePlanResource[]) {
  const cancelledSubscription = subscriptions.find(sub => sub.canceledAt && sub.status === 'active');
  const hasUpcomingSubscription = subscriptions.some(sub => sub.status === 'upcoming');
  const freePlan = plans?.find(plan => plan.hasBaseFee === false && plan.amount === 0);

  if (cancelledSubscription && !hasUpcomingSubscription && freePlan) {
    return [
      ...subscriptions,
      {
        plan: freePlan,
        periodStart: cancelledSubscription.periodEnd,
        status: 'upcoming',
      } as CommerceSubscriptionResource,
    ];
  }

  return subscriptions;
}

export function SubscriptionsList() {
  const { subscriptions, plans, handleSelectPlan, captionForSubscription, canManageSubscription } = usePlansContext();
  const subscriberType = useSubscriberTypeContext();
  const canManageBilling = useProtect(
    has => has({ permission: 'org:sys_billing:manage' }) || subscriberType === 'user',
  );
  const handleSelectSubscription = (
    subscription: CommerceSubscriptionResource,
    event?: React.MouseEvent<HTMLElement>,
  ) => {
    handleSelectPlan({
      mode: 'modal', // always modal for now
      plan: subscription.plan,
      planPeriod: subscription.planPeriod,
      event,
    });
  };

  const subscriptionsWithUpcomingFreePlan = includeFreeToSubscriptionsLint(subscriptions, plans);

  const sortedSubscriptions = subscriptionsWithUpcomingFreePlan.sort((a, b) => {
    // alway put active subscriptions first
    if (a.status === 'active' && b.status !== 'active') {
      return -1;
    }

    if (b.status === 'active' && a.status !== 'active') {
      return 1;
    }

    return 1;
  });

  return (
    <Table tableHeadVisuallyHidden>
      <Thead>
        <Tr>
          <Th>Plan</Th>
          <Th>Start date</Th>
          <Th>Edit</Th>
        </Tr>
      </Thead>
      <Tbody>
        {sortedSubscriptions.map(subscription => (
          <Tr key={subscription.id}>
            <Td>
              <Col gap={1}>
                <Flex
                  align='center'
                  gap={1}
                >
                  <Icon
                    icon={Plans}
                    sx={t => ({
                      width: t.sizes.$4,
                      height: t.sizes.$4,
                      opacity: t.opacity.$inactive,
                    })}
                  />
                  <Text
                    variant='subtitle'
                    sx={t => ({ marginRight: t.sizes.$1 })}
                  >
                    {subscription.plan.name}
                  </Text>
                  {sortedSubscriptions.length > 1 || !!subscription.canceledAt ? (
                    <Badge
                      colorScheme={subscription.status === 'active' ? 'secondary' : 'primary'}
                      localizationKey={
                        subscription.status === 'active'
                          ? localizationKeys('badge__currentPlan')
                          : localizationKeys('badge__upcomingPlan')
                      }
                    />
                  ) : null}
                </Flex>
                <Text
                  variant='caption'
                  colorScheme='secondary'
                  localizationKey={captionForSubscription(subscription)}
                />
              </Col>
            </Td>
            <Td
              sx={_ => ({
                textAlign: 'right',
              })}
            >
              <Text variant='subtitle'>
                {subscription.plan.currencySymbol}
                {subscription.planPeriod === 'annual'
                  ? subscription.plan.annualMonthlyAmountFormatted
                  : subscription.plan.amountFormatted}
                {subscription.plan.amount > 0 && (
                  <Span
                    sx={t => ({
                      color: t.colors.$colorTextSecondary,
                      textTransform: 'lowercase',
                      ':before': {
                        content: '"/"',
                        marginInline: t.space.$1,
                      },
                    })}
                    localizationKey={localizationKeys('commerce.month')}
                  />
                )}
              </Text>
            </Td>
            <Td
              sx={_ => ({
                textAlign: 'right',
              })}
            >
              {canManageSubscription({ subscription }) && subscription.id && (
                <Button
                  aria-label='Manage subscription'
                  onClick={event => handleSelectSubscription(subscription, event)}
                  variant='bordered'
                  colorScheme='secondary'
                  isDisabled={!canManageBilling}
                  sx={t => ({
                    width: t.sizes.$6,
                    height: t.sizes.$6,
                  })}
                >
                  <Icon
                    icon={CogFilled}
                    sx={t => ({
                      width: t.sizes.$4,
                      height: t.sizes.$4,
                      opacity: t.opacity.$inactive,
                    })}
                  />
                </Button>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
