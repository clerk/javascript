import { Fragment } from 'react';

import { FullHeightLoader } from '@/ui/elements/FullHeightLoader';
import { ProfileSection } from '@/ui/elements/Section';
import { common } from '@/ui/styledSystem';

import {
  Box,
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
import { ArrowUpDown, Cog, Files, Plus, Users } from '../../icons';
import { SubscriptionBadge } from './badge';
import type { SubscriptionListItem, SubscriptionsListData, SubscriptionsListProps } from './subscriptions-list.types';

export const SubscriptionsListView = ({
  data,
  title,
  switchPlansLabel,
  newSubscriptionLabel,
  manageSubscriptionLabel,
}: SubscriptionsListProps & { data: SubscriptionsListData }) => (
  <ProfileSection.Root
    id='subscriptionsList'
    title={title}
    centered={false}
    sx={t => ({
      borderTop: 'none',
      paddingTop: t.space.$1,
    })}
  >
    {data.isLoading && data.items.length === 0 ? (
      // Reserve the loaded height (42px card + gap + button) to avoid shifting content on load
      <Box sx={t => ({ height: `calc(${t.space.$1} * 10.5 + ${t.space.$2} + ${t.space.$8})` })}>
        <FullHeightLoader />
      </Box>
    ) : (
      <>
        {data.items.length > 0 && (
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
                    `${data.localizationRoot}.billingPage.subscriptionsListSection.tableHeader__plan`,
                  )}
                />
                <Th
                  localizationKey={localizationKeys(
                    `${data.localizationRoot}.billingPage.subscriptionsListSection.tableHeader__startDate`,
                  )}
                />
              </Tr>
            </Thead>
            <Tbody>
              {data.items.map(item => (
                <SubscriptionItemRow
                  key={item.id}
                  item={item}
                />
              ))}
              {data.overview ? (
                <SubscriptionOverviewRow
                  overview={data.overview}
                  localizationRoot={data.localizationRoot}
                />
              ) : null}
            </Tbody>
          </Table>
        )}

        <ProfileSection.ButtonGroup id='subscriptionsList'>
          {data.billingPlansExist ? (
            <ProfileSection.ArrowButton
              id='subscriptionsList'
              textLocalizationKey={data.items.length > 0 ? switchPlansLabel : newSubscriptionLabel}
              sx={[
                t => ({
                  justifyContent: 'start',
                  height: t.sizes.$8,
                  width: data.isManageButtonVisible ? 'unset' : undefined,
                }),
              ]}
              leftIcon={data.items.length > 0 ? ArrowUpDown : Plus}
              rightIcon={null}
              leftIconSx={t => ({
                width: t.sizes.$4,
                height: t.sizes.$4,
              })}
              onClick={data.onSwitchPlans}
            />
          ) : null}

          {data.isManageButtonVisible ? (
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
              onClick={data.onManage}
            />
          ) : null}
        </ProfileSection.ButtonGroup>
      </>
    )}
  </ProfileSection.Root>
);

function SubscriptionOverviewRow({
  overview,
  localizationRoot,
}: {
  overview: NonNullable<SubscriptionsListData['overview']>;
  localizationRoot: SubscriptionsListData['localizationRoot'];
}) {
  return (
    <Tr sx={t => ({ background: common.mutedBackground(t) })}>
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
            sx={t => ({ color: t.colors.$colorForeground })}
          >
            {overview.amount}
          </Text>
          <Text
            variant='subtitle'
            colorScheme='secondary'
            localizationKey={localizationKeys('badge__renewsAt', { date: overview.date })}
          />
        </Col>
      </Td>
    </Tr>
  );
}

function SubscriptionDiscountRow({ item }: { item: SubscriptionListItem }) {
  const discount = item.discount;
  if (!discount) {
    return null;
  }

  return (
    <Tr sx={t => (item.status === 'upcoming' ? { background: common.mutedBackground(t) } : {})}>
      <Td sx={{ verticalAlign: 'top' }}>
        <Col gap={1}>
          <Text variant='subtitle'>{discount.title}</Text>
          {discount.cyclesRemaining !== null ? (
            <Text
              variant='subtitle'
              colorScheme='secondary'
              localizationKey={localizationKeys('billing.discountCyclesRemaining', {
                cycles: discount.cyclesRemaining,
                period: discount.periodLabel ?? '',
              })}
            />
          ) : null}
        </Col>
      </Td>
      <Td sx={{ textAlign: 'end' }}>
        <Text variant='subtitle'>{discount.amount}</Text>
      </Td>
    </Tr>
  );
}

function SubscriptionItemRow({ item }: { item: SubscriptionListItem }) {
  return (
    <Fragment key={item.id}>
      <Tr sx={t => (item.status === 'upcoming' ? { background: common.mutedBackground(t) } : {})}>
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
                {item.name}
              </Text>
              {item.showBadge ? <SubscriptionBadge subscription={{ status: item.badgeStatus }} /> : null}
            </Flex>

            {item.caption !== null && (
              <Text
                variant='caption'
                colorScheme='secondary'
                localizationKey={item.caption}
              />
            )}
          </Col>
        </Td>
        <Td sx={_ => ({ textAlign: 'end' })}>
          <Text variant='subtitle'>
            {item.feeText}
            {item.hasFee && (
              <Span
                sx={t => ({
                  color: t.colors.$colorMutedForeground,
                  textTransform: 'lowercase',
                  ':before': {
                    content: '"/"',
                    marginInline: t.space.$1,
                  },
                })}
                localizationKey={item.isAnnual ? localizationKeys('billing.year') : localizationKeys('billing.month')}
              />
            )}
          </Text>
        </Td>
      </Tr>
      {item.seats ? (
        <Tr sx={t => (item.status === 'upcoming' ? { background: common.mutedBackground(t) } : {})}>
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
          <Td sx={_ => ({ textAlign: 'end' })}>
            <Col
              gap={1}
              align='end'
            >
              {item.seats.limitAndIncludedLabel ? (
                <Text
                  variant='subtitle'
                  localizationKey={item.seats.limitAndIncludedLabel}
                />
              ) : null}
              {item.seats.paidUsage !== null ? <Text variant='subtitle'>{item.seats.paidUsage}</Text> : null}
            </Col>
          </Td>
        </Tr>
      ) : null}
      <SubscriptionDiscountRow item={item} />
    </Fragment>
  );
}
