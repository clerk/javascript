import type { CommerceSubscriptionResource } from '@clerk/types';

import { useProtect } from '../../common';
import { usePlansContext, useSubscriberTypeContext, useSubscriptions } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
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
import { ProfileSection } from '../../elements';
import { ArrowsUpDown, CogFilled, Plans, Plus } from '../../icons';
import { useRouter } from '../../router';

export function SubscriptionsList({
  title,
  arrowButtonText,
  arrowButtonEmptyText,
}: {
  title: LocalizationKey;
  arrowButtonText: LocalizationKey;
  arrowButtonEmptyText: LocalizationKey;
}) {
  const { handleSelectPlan, captionForSubscription, canManageSubscription } = usePlansContext();
  const subscriberType = useSubscriberTypeContext();
  const { data: subscriptions } = useSubscriptions();
  const canManageBilling = useProtect(
    has => has({ permission: 'org:sys_billing:manage' }) || subscriberType === 'user',
  );
  const { navigate } = useRouter();
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

  const sortedSubscriptions = subscriptions.sort((a, b) => {
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
    <ProfileSection.Root
      id='subscriptionsList'
      title={title}
      centered={false}
      sx={t => ({
        borderTop: 'none',
        paddingTop: t.space.$1,
      })}
    >
      {subscriptions.length > 0 && (
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
                              ? localizationKeys('badge__activePlan')
                              : localizationKeys('badge__upcomingPlan')
                          }
                        />
                      ) : null}
                    </Flex>
                    {(!subscription.plan.isDefault || subscription.status === 'upcoming') && (
                      <Text
                        variant='caption'
                        colorScheme='secondary'
                        localizationKey={captionForSubscription(subscription)}
                      />
                    )}
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
                      ? subscription.plan.annualAmountFormatted
                      : subscription.plan.amountFormatted}
                    {(subscription.plan.amount > 0 || subscription.plan.annualAmount > 0) && (
                      <Span
                        sx={t => ({
                          color: t.colors.$colorTextSecondary,
                          textTransform: 'lowercase',
                          ':before': {
                            content: '"/"',
                            marginInline: t.space.$1,
                          },
                        })}
                        localizationKey={
                          subscription.planPeriod === 'annual'
                            ? localizationKeys('commerce.year')
                            : localizationKeys('commerce.month')
                        }
                      />
                    )}
                  </Text>
                </Td>
                <Td
                  sx={_ => ({
                    textAlign: 'right',
                  })}
                >
                  {canManageSubscription({ subscription }) && subscription.id && !subscription.plan.isDefault && (
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
      )}

      <ProfileSection.ArrowButton
        id='subscriptionsList'
        textLocalizationKey={subscriptions.length > 0 ? arrowButtonText : arrowButtonEmptyText}
        sx={[
          t => ({
            justifyContent: 'start',
            height: t.sizes.$8,
          }),
        ]}
        leftIcon={subscriptions.length > 0 ? ArrowsUpDown : Plus}
        leftIconSx={t => ({
          width: t.sizes.$4,
          height: t.sizes.$4,
        })}
        onClick={() => void navigate('plans')}
      />
    </ProfileSection.Root>
  );
}
