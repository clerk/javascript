import { useClerk } from '@clerk/shared/react';

import { PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { usePlansContext } from '../../contexts';
import { Badge, Box, localizationKeys, Span, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../customizables';
import { ThreeDotsMenu } from '../../elements';

export function BillingSubscriptionsList() {
  const { subscriptions, revalidate } = usePlansContext();
  const clerk = useClerk();
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
          <Tr key={subscription.plan.id}>
            <Td>
              <Box
                sx={t => ({
                  display: 'flex',
                  columnGap: t.space.$2,
                })}
              >
                <Text variant='subtitle'>{subscription.plan.name}</Text>
                <Badge
                  colorScheme={subscription.status === 'active' ? 'secondary' : 'primary'}
                  localizationKey={
                    subscription.status === 'active'
                      ? localizationKeys('badge__currentPlan')
                      : localizationKeys('badge__startsAt', { date: subscription.periodStart })
                  }
                />
              </Box>
            </Td>
            <Td>
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
              <ThreeDotsMenu
                actions={[
                  {
                    label: localizationKeys(
                      'userProfile.__experimental_billingPage.subscriptionsSection.actionLabel__default',
                    ),
                    onClick: () => {
                      clerk.__internal_openSubscriptionDetailDrawer({
                        subscription,
                        onSubscriptionCancel: () => revalidate(),
                        portalId: PROFILE_CARD_SCROLLBOX_ID,
                      });
                    },
                  },
                  {
                    label: localizationKeys(
                      'userProfile.__experimental_billingPage.subscriptionsSection.actionLabel__cancel',
                    ),
                    onClick: () => {},
                    isDestructive: true,
                  },
                ]}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
