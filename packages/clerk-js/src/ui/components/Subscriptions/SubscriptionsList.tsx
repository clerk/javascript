import type { __experimental_CommerceSubscriptionResource } from '@clerk/types';

import { usePlansContext } from '../../contexts';
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

  const handleSelectSubscription = (subscription: __experimental_CommerceSubscriptionResource) => {
    handleSelectPlan({
      mode: 'modal', // always modal for now
      plan: subscription.plan,
      planPeriod: subscription.planPeriod,
    });
  };

  return (
    <Table
      tableHeadVisuallyHidden
      sx={t => ({
        'tr > td': {
          paddingInline: t.sizes.$4,
          paddingBlock: t.sizes.$2,
        },
        'tr > th': {
          paddingInline: t.sizes.$4,
          paddingBlock: t.sizes.$2,
        },
      })}
    >
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
                  localizationKey={localizationKeys('__experimental_commerce.month')}
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
                  onClick={() => handleSelectSubscription(subscription)}
                  variant='bordered'
                  colorScheme='secondary'
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
