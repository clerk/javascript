import type { CommerceSubscriptionItemResource } from '@clerk/types';
import { useMemo } from 'react';

import { ProfileSection } from '@/ui/elements/Section';

import { useProtect } from '../../common';
import {
  normalizeFormatted,
  useEnvironment,
  usePlansContext,
  useSubscriberTypeContext,
  useSubscriberTypeLocalizationRoot,
  useSubscription,
} from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import {
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
import { ArrowsUpDown, CogFilled, Plans, Plus } from '../../icons';
import { useRouter } from '../../router';
import { SubscriptionBadge } from './badge';

export function SubscriptionsList({
  title,
  arrowButtonText,
  arrowButtonEmptyText,
}: {
  title: LocalizationKey;
  arrowButtonText: LocalizationKey;
  arrowButtonEmptyText: LocalizationKey;
}) {
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const subscriberType = useSubscriberTypeContext();
  const { subscriptionItems } = useSubscription();
  const { navigate } = useRouter();
  const { commerceSettings } = useEnvironment();

  const sortedSubscriptions = useMemo(
    () =>
      subscriptionItems.sort((a, b) => {
        // always put active subscriptions first
        if (a.status === 'active' && b.status !== 'active') {
          return -1;
        }

        if (b.status === 'active' && a.status !== 'active') {
          return 1;
        }

        return 1;
      }),
    [subscriptionItems],
  );

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
      {subscriptionItems.length > 0 && (
        <Table tableHeadVisuallyHidden>
          <Thead>
            <Tr>
              <Th
                localizationKey={localizationKeys(
                  `${localizationRoot}.billingPage.subscriptionsListSection.tableHeader__plan`,
                )}
              />
              <Th
                localizationKey={localizationKeys(
                  `${localizationRoot}.billingPage.subscriptionsListSection.tableHeader__startDate`,
                )}
              />
              <Th
                localizationKey={localizationKeys(
                  `${localizationRoot}.billingPage.subscriptionsListSection.tableHeader__edit`,
                )}
              />
            </Tr>
          </Thead>
          <Tbody>
            {sortedSubscriptions.map(subscription => (
              <SubscriptionRow
                key={subscription.id}
                subscription={subscription}
                length={sortedSubscriptions.length}
              />
            ))}
          </Tbody>
        </Table>
      )}

      {(commerceSettings.billing.user.hasPaidPlans && subscriberType === 'user') ||
      (commerceSettings.billing.organization.hasPaidPlans && subscriberType === 'organization') ? (
        <ProfileSection.ArrowButton
          id='subscriptionsList'
          textLocalizationKey={subscriptionItems.length > 0 ? arrowButtonText : arrowButtonEmptyText}
          sx={[
            t => ({
              justifyContent: 'start',
              height: t.sizes.$8,
            }),
          ]}
          leftIcon={subscriptionItems.length > 0 ? ArrowsUpDown : Plus}
          leftIconSx={t => ({
            width: t.sizes.$4,
            height: t.sizes.$4,
          })}
          onClick={() => void navigate('plans')}
        />
      ) : null}
    </ProfileSection.Root>
  );
}

function SubscriptionRow({ subscription, length }: { subscription: CommerceSubscriptionItemResource; length: number }) {
  const subscriberType = useSubscriberTypeContext();
  const canManageBilling =
    useProtect(has => has({ permission: 'org:sys_billing:manage' })) || subscriberType === 'user';
  const fee = subscription.planPeriod === 'annual' ? subscription.plan.annualFee : subscription.plan.fee;
  const { captionForSubscription, openSubscriptionDetails } = usePlansContext();

  const feeFormatted = useMemo(() => {
    return normalizeFormatted(fee.amountFormatted);
  }, [fee.amountFormatted]);
  return (
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
            {subscription.isFreeTrial || length > 1 || !!subscription.canceledAt ? (
              <SubscriptionBadge subscription={subscription.isFreeTrial ? { status: 'free_trial' } : subscription} />
            ) : null}
          </Flex>

          {(!subscription.plan.isDefault || subscription.status === 'upcoming') && (
            // here
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
          {fee.currencySymbol}
          {feeFormatted}
          {fee.amount > 0 && (
            <Span
              sx={t => ({
                color: t.colors.$colorMutedForeground,
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
        <Button
          aria-label='Manage subscription'
          onClick={event => openSubscriptionDetails(event)}
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
      </Td>
    </Tr>
  );
}
