import type { BillingSubscriptionItemResource, BillingSubscriptionResource } from '@clerk/shared/types';
import { Fragment, useMemo } from 'react';

import { useProtect } from '@/ui/common/Gate';
import { ProfileSection } from '@/ui/elements/Section';
import { common } from '@/ui/styledSystem';
import { getSeatLimitAndIncludedSeatsLocalizationKey } from '@/ui/utils/billingPlanSeats';
import { isManageableSubscriptionItem } from '@/ui/utils/billingSubscription';

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
  useLocalizations,
} from '../../customizables';
import { ArrowUpDown, Cog, Files, Plus, Users } from '../../icons';
import { useRouter } from '../../router';
import { SubscriptionBadge } from './badge';

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
  const { subscriptionItems, data: subscription } = useSubscription();
  const canManageBilling =
    useProtect(has => has({ permission: 'org:sys_billing:manage' })) || subscriberType === 'user';
  const { navigate } = useRouter();
  const { commerceSettings } = useEnvironment();
  const { openSubscriptionDetails } = usePlansContext();

  const billingPlansExist =
    (commerceSettings.billing.user.hasPaidPlans && subscriberType === 'user') ||
    (commerceSettings.billing.organization.hasPaidPlans && subscriberType === 'organization');

  const hasManageableSubscription = useMemo(
    () => subscriptionItems.some(isManageableSubscriptionItem),
    [subscriptionItems],
  );

  const isManageButtonVisible = canManageBilling && hasManageableSubscription;

  const sortedSubscriptionItems = useMemo(
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
        <Table
          sx={t => ({
            overflow: 'hidden',
            'tr > td': {
              paddingTop: t.space.$3,
              paddingBottom: t.space.$3,
              paddingInlineStart: t.space.$3,
              paddingInlineEnd: t.space.$3,
            },
          })}
          tableHeadVisuallyHidden
        >
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
            {sortedSubscriptionItems.map(subscriptionItem => (
              <SubscriptionItemRow
                key={subscriptionItem.id}
                subscriptionItem={subscriptionItem}
                length={sortedSubscriptionItems.length}
              />
            ))}
            {subscription?.nextPayment ? (
              <SubscriptionOverviewRow
                nextPayment={subscription.nextPayment}
                localizationRoot={localizationRoot}
              />
            ) : null}
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
            leftIcon={subscriptionItems.length > 0 ? ArrowUpDown : Plus}
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
            leftIcon={Cog}
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

function SubscriptionOverviewRow({
  nextPayment,
  localizationRoot,
}: {
  nextPayment: NonNullable<BillingSubscriptionResource['nextPayment']>;
  localizationRoot: ReturnType<typeof useSubscriberTypeLocalizationRoot>;
}) {
  if (!nextPayment.totals) {
    return null;
  }

  return (
    <Tr
      sx={t => ({
        background: common.mutedBackground(t),
      })}
    >
      <Td sx={{ verticalAlign: 'top' }}>
        <Text
          variant='subtitle'
          localizationKey={localizationKeys(`${localizationRoot}.billingPage.subscriptionsListSection.overview`)}
        />
      </Td>
      <Td sx={{ textAlign: 'end' }}>
        <Col
          gap={1}
          align='end'
        >
          <Text
            variant='h2'
            sx={t => ({
              color: t.colors.$colorForeground,
            })}
          >
            {nextPayment.totals.grandTotal.currencySymbol}
            {nextPayment.totals.grandTotal.amountFormatted}
          </Text>
          <Text
            variant='subtitle'
            colorScheme='secondary'
            localizationKey={localizationKeys('badge__renewsAt', {
              date: nextPayment.date,
            })}
          />
        </Col>
      </Td>
    </Tr>
  );
}

function SubscriptionItemRow({
  subscriptionItem,
  length,
}: {
  subscriptionItem: BillingSubscriptionItemResource;
  length: number;
}) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const fee = subscriptionItem.planPeriod === 'annual' ? subscriptionItem.plan.annualFee! : subscriptionItem.plan.fee!;
  const { captionForSubscription } = usePlansContext();
  const { t } = useLocalizations();

  const feeFormatted = useMemo(() => {
    return normalizeFormatted(fee.amountFormatted);
  }, [fee.amountFormatted]);

  const subItemSeatsQty = subscriptionItem.seats?.quantity;
  const seatsTotalTier = subscriptionItem.seats?.tiers?.find(t => t.total.amount > 0);
  const monthLabel = t(localizationKeys('billing.month')).toLowerCase();
  const seatLimitAndIncludedSeatsLocalizationKey = getSeatLimitAndIncludedSeatsLocalizationKey(subscriptionItem.plan);

  return (
    <Fragment key={subscriptionItem.id}>
      <Tr
        sx={t => {
          if (subscriptionItem.status === 'upcoming') {
            return {
              background: common.mutedBackground(t),
            };
          }

          return {};
        }}
      >
        <Td>
          <Col gap={1}>
            <Flex
              align='center'
              gap={1}
            >
              <Icon
                icon={Files}
                sx={t => ({
                  width: t.sizes.$4,
                  height: t.sizes.$4,
                  opacity: t.opacity.$inactive,
                  color: t.colors.$colorMutedForeground,
                })}
              />
              <Text
                variant='subtitle'
                sx={t => ({ marginInlineEnd: t.sizes.$1 })}
              >
                {subscriptionItem.plan.name}
              </Text>
              {subscriptionItem.isFreeTrial || length > 1 || !!subscriptionItem.canceledAt ? (
                <SubscriptionBadge
                  subscription={subscriptionItem.isFreeTrial ? { status: 'free_trial' } : subscriptionItem}
                />
              ) : null}
            </Flex>

            {(!subscriptionItem.plan.isDefault || subscriptionItem.status === 'upcoming') && (
              // here
              <Text
                variant='caption'
                colorScheme='secondary'
                localizationKey={captionForSubscription(subscriptionItem)}
              />
            )}
          </Col>
        </Td>
        <Td
          sx={_ => ({
            textAlign: 'end',
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
                  subscriptionItem.planPeriod === 'annual'
                    ? localizationKeys('billing.year')
                    : localizationKeys('billing.month')
                }
              />
            )}
          </Text>
        </Td>
      </Tr>
      {typeof subItemSeatsQty !== 'undefined' ? (
        <Tr
          sx={t => {
            if (subscriptionItem.status === 'upcoming') {
              return {
                background: common.mutedBackground(t),
              };
            }

            return {};
          }}
        >
          <Td sx={{ verticalAlign: 'top' }}>
            <Col gap={1}>
              <Flex
                align='center'
                gap={1}
              >
                <Icon
                  icon={Users}
                  sx={t => ({
                    width: t.sizes.$4,
                    height: t.sizes.$4,
                    opacity: t.opacity.$inactive,
                    color: t.colors.$colorMutedForeground,
                  })}
                />
                <Text
                  variant='subtitle'
                  sx={t => ({ marginInlineEnd: t.sizes.$1 })}
                  localizationKey={localizationKeys('billing.seats')}
                />
              </Flex>
            </Col>
          </Td>
          <Td
            sx={_ => ({
              textAlign: 'end',
            })}
          >
            <Col
              gap={1}
              align='end'
            >
              {seatLimitAndIncludedSeatsLocalizationKey ? (
                <Text
                  variant='subtitle'
                  localizationKey={seatLimitAndIncludedSeatsLocalizationKey}
                />
              ) : null}
              {seatsTotalTier && seatsTotalTier.quantity ? (
                <Text variant='subtitle'>
                  {t(
                    localizationKeys('organizationProfile.billingPage.subscriptionsListSection.paidSeatsUsage', {
                      seatsQuantity: seatsTotalTier.quantity,
                      amount: `${seatsTotalTier.feePerBlock.currencySymbol}${seatsTotalTier.feePerBlock.amountFormatted} / ${monthLabel}`,
                    }),
                  )}
                </Text>
              ) : null}
            </Col>
          </Td>
        </Tr>
      ) : null}
    </Fragment>
  );
}
