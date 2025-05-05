import type { CommerceSubscriptionResource } from '@clerk/types';

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

export function SubscriptionsList() {
  const { subscriptions, handleSelectPlan, captionForSubscription, canManageSubscription } = usePlansContext();
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
        {subscriptions.map(subscription => (
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
                  {subscriptions.length > 1 || !!subscription.canceledAt ? (
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
              </Text>
            </Td>
            <Td
              sx={_ => ({
                textAlign: 'right',
              })}
            >
              {canManageSubscription({ subscription }) && (
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
