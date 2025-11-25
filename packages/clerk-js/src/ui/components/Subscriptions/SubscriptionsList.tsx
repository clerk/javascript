import type { BillingPlanResource, BillingSubscriptionItemResource } from '@clerk/shared/types';
import { useMemo } from 'react';

import { useProtect } from '@/ui/common/Gate';
import { ProfileSection } from '@/ui/elements/Section';

import {
  normalizeFormatted,
  useEnvironment,
  usePlansContext,
  useSubscriberTypeContext,
  useSubscriberTypeLocalizationRoot,
  useSubscription,
} from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Col, Flex, Icon, localizationKeys, Span, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../customizables';
import { ArrowsUpDown, CogFilled, Plans, Plus } from '../../icons';
import { useRouter } from '../../router';
import { SubscriptionBadge } from './badge';

const isFreePlan = (plan: BillingPlanResource) => !plan.hasBaseFee;

export function SubscriptionsList({
  title,
  switchPlansLabel,
  newSubscriptionLabel,
  manageSubscriptionLabel,
}: {
  title: LocalizationKey;
  switchPlansLabel: LocalizationKey;
  newSubscriptionLabel: LocalizationKey;
  manageSubscriptionLabel: LocalizationKey;
}) {
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const subscriberType = useSubscriberTypeContext();
  const { subscriptionItems } = useSubscription();
  const canManageBilling =
    useProtect(has => has({ permission: 'org:sys_billing:manage' })) || subscriberType === 'user';
  const { navigate } = useRouter();
  const { commerceSettings } = useEnvironment();
  const { openSubscriptionDetails } = usePlansContext();

  const billingPlansExist =
    (commerceSettings.billing.user.hasPaidPlans && subscriberType === 'user') ||
    (commerceSettings.billing.organization.hasPaidPlans && subscriberType === 'organization');

  const hasActiveFreePlan = useMemo(() => {
    return subscriptionItems.some(sub => isFreePlan(sub.plan) && sub.status === 'active');
  }, [subscriptionItems]);

  const isManageButtonVisible = canManageBilling && !hasActiveFreePlan && subscriptionItems.length > 0;

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

      <ProfileSection.ButtonGroup id='subscriptionsList'>
        {billingPlansExist ? (
          <ProfileSection.ArrowButton
            id='subscriptionsList'
            textLocalizationKey={subscriptionItems.length > 0 ? switchPlansLabel : newSubscriptionLabel}
            sx={[
              t => ({
                justifyContent: 'start',
                height: t.sizes.$8,
                width: isManageButtonVisible ? 'unset' : undefined,
              }),
            ]}
            leftIcon={subscriptionItems.length > 0 ? ArrowsUpDown : Plus}
            rightIcon={null}
            leftIconSx={t => ({
              width: t.sizes.$4,
              height: t.sizes.$4,
            })}
            onClick={() => void navigate('plans')}
          />
        ) : null}

        {isManageButtonVisible ? (
          <ProfileSection.ArrowButton
            id='subscriptionsList'
            textLocalizationKey={manageSubscriptionLabel}
            sx={[
              t => ({
                justifyContent: 'start',
                height: t.sizes.$8,
                width: 'unset',
              }),
            ]}
            rightIcon={null}
            leftIcon={CogFilled}
            leftIconSx={t => ({
              width: t.sizes.$4,
              height: t.sizes.$4,
            })}
            onClick={event => openSubscriptionDetails(event)}
          />
        ) : null}
      </ProfileSection.ButtonGroup>
    </ProfileSection.Root>
  );
}

function SubscriptionRow({ subscription, length }: { subscription: BillingSubscriptionItemResource; length: number }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const fee = subscription.planPeriod === 'annual' ? subscription.plan.annualFee! : subscription.plan.fee;
  const { captionForSubscription } = usePlansContext();

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
                  ? localizationKeys('billing.year')
                  : localizationKeys('billing.month')
              }
            />
          )}
        </Text>
      </Td>
    </Tr>
  );
}
