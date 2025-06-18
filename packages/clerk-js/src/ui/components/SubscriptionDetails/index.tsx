import { useClerk, useOrganization } from '@clerk/shared/react';
import type {
  __experimental_SubscriptionDetailsProps,
  __internal_CheckoutProps,
  ClerkAPIError,
  ClerkRuntimeError,
  CommerceSubscriptionResource,
} from '@clerk/types';
import * as React from 'react';
import { useState } from 'react';

import { Drawer, useDrawerContext } from '@/ui/elements/Drawer';
import { Check } from '@/ui/icons';
import { common } from '@/ui/styledSystem/common';
import { colors } from '@/ui/utils/colors';
import { handleError } from '@/ui/utils/errorHandler';
import { formatDate } from '@/ui/utils/formatDate';
import { truncateWithEndVisible } from '@/ui/utils/truncateTextWithEndVisible';

import { useProtect } from '../../common';
import { usePlansContext, useSubscriberTypeContext, useSubscriptions } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import {
  Alert,
  Badge,
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Heading,
  Icon,
  localizationKeys,
  Span,
  Spinner,
  Text,
} from '../../customizables';

export const SubscriptionDetails = (props: __experimental_SubscriptionDetailsProps) => {
  return (
    <Drawer.Content>
      <SubscriptionDetailsInternal {...props} />
    </Drawer.Content>
  );
};

const SubscriptionDetailsInternal = ({ onSubscriptionCancel, portalRoot }: __experimental_SubscriptionDetailsProps) => {
  const clerk = useClerk();
  const { organization: _organization } = useOrganization();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<ClerkRuntimeError | ClerkAPIError | string | undefined>();

  const { setIsOpen } = useDrawerContext();
  const {
    revalidateAll,
    buttonPropsForPlan: _buttonPropsForPlan,
    isDefaultPlanImplicitlyActiveOrUpcoming: _isDefaultPlanImplicitlyActiveOrUpcoming,
  } = usePlansContext();
  const subscriberType = useSubscriberTypeContext();
  const canManageBilling = useProtect(
    has => has({ permission: 'org:sys_billing:manage' }) || subscriberType === 'user',
  );

  const { data: subscriptions, isLoading } = useSubscriptions();

  if (isLoading) {
    return (
      <Spinner
        sx={{
          margin: 'auto',
        }}
      />
    );
  }

  const handleClose = () => {
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  const cancelSubscription = async (subscription: CommerceSubscriptionResource) => {
    setCancelError(undefined);
    setIsSubmitting(true);

    await subscription
      .cancel(
        // { orgId: subscriberType === 'org' ? organization?.id : undefined }
        {},
      )
      .then(() => {
        setIsSubmitting(false);
        onSubscriptionCancel?.();
        handleClose();
      })
      .catch(error => {
        handleError(error, [], setCancelError);
        setIsSubmitting(false);
      });
  };

  const openCheckout = (params?: __internal_CheckoutProps) => {
    handleClose();

    clerk.__internal_openCheckout({
      ...params,
      onSubscriptionComplete: () => {
        void revalidateAll();
      },
      portalRoot,
    });
  };

  // Mock data for demonstration - in real implementation this would come from the subscriptions data
  const activeSubscription = subscriptions?.find(sub => sub.status === 'active');
  const upcomingSubscription = subscriptions?.find(sub => sub.status === 'upcoming');

  if (!activeSubscription) {
    // Should never happen, but just in case
    return null;
  }

  const subscription = upcomingSubscription || activeSubscription;

  return (
    <>
      <Drawer.Header title='Subscription' />

      <Drawer.Body>
        <Col
          gap={4}
          sx={t => ({
            padding: t.space.$4,
            overflowY: 'auto',
          })}
        >
          {/* Subscription Cards */}
          {subscriptions?.map(subscriptionItem => (
            <SubscriptionCard
              key={subscriptionItem.id}
              subscription={subscriptionItem}
            />
          ))}
        </Col>

        {/* Billing Information */}

        <Col
          gap={3}
          as='ul'
          sx={t => ({
            marginTop: 'auto',
            paddingBlock: t.space.$4,
            borderTopWidth: t.borderWidths.$normal,
            borderTopStyle: t.borderStyles.$solid,
            borderTopColor: t.colors.$neutralAlpha100,
          })}
        >
          <SummaryItem>
            <SummmaryItemLabel>
              <Text colorScheme='secondary'>Current billing cycle</Text>
            </SummmaryItemLabel>
            <SummmaryItemValue>
              <Text colorScheme='secondary'>{activeSubscription.planPeriod === 'month' ? 'Monthly' : 'Annually'}</Text>
            </SummmaryItemValue>
          </SummaryItem>
          <SummaryItem>
            <SummmaryItemLabel>
              <Text colorScheme='secondary'>Next payment on</Text>
            </SummmaryItemLabel>
            <SummmaryItemValue>
              <Text colorScheme='secondary'>
                {upcomingSubscription
                  ? formatDate(upcomingSubscription.periodStart)
                  : formatDate(subscription.periodEnd)}
              </Text>
            </SummmaryItemValue>
          </SummaryItem>
          <SummaryItem>
            <SummmaryItemLabel>
              <Text>Next payment amount</Text>
            </SummmaryItemLabel>
            <SummmaryItemValue>
              <Text>
                {`${subscription.plan.currencySymbol}${subscription.planPeriod === 'month' ? subscription.plan.amountFormatted : subscription.plan.annualAmountFormatted}`}
              </Text>
            </SummmaryItemValue>
          </SummaryItem>
        </Col>
      </Drawer.Body>

      {/* If either the active or upcoming subscription is the free plan, then a C1 cannot switch to a different period or cancel the plan */}
      {!subscription?.plan.isDefault ? (
        <Drawer.Footer>
          <Col gap={4}>
            {subscription.planPeriod === 'month' && subscription.plan.annualMonthlyAmount > 0 && (
              <Button
                block
                variant='bordered'
                colorScheme='secondary'
                textVariant='buttonLarge'
                isDisabled={!canManageBilling}
                // onClick={() => openCheckout({ planPeriod: 'annual' })}
                onClick={() => {
                  openCheckout({
                    planId: subscription.plan.id,
                    planPeriod: subscription.planPeriod === 'month' ? 'annual' : 'month',
                    subscriberType: subscriberType,
                  });
                }}
                localizationKey={
                  subscription.planPeriod === 'month'
                    ? localizationKeys('commerce.switchToAnnual')
                    : localizationKeys('commerce.switchToMonthly')
                }
              />
            )}

            <Button
              block
              variant='bordered'
              colorScheme='danger'
              textVariant='buttonLarge'
              isDisabled={!canManageBilling}
              onClick={() => setShowConfirmation(true)}
              localizationKey={localizationKeys('commerce.cancelSubscription')}
            />
          </Col>

          <Drawer.Confirmation
            open={showConfirmation}
            onOpenChange={setShowConfirmation}
            actionsSlot={
              <>
                {!isSubmitting && (
                  <Button
                    variant='ghost'
                    size='sm'
                    textVariant='buttonLarge'
                    isDisabled={!canManageBilling}
                    onClick={() => {
                      setCancelError(undefined);
                      setShowConfirmation(false);
                    }}
                    localizationKey={localizationKeys('commerce.keepSubscription')}
                  />
                )}
                <Button
                  variant='solid'
                  colorScheme='danger'
                  size='sm'
                  textVariant='buttonLarge'
                  isLoading={isSubmitting}
                  isDisabled={!canManageBilling}
                  onClick={() => {
                    setCancelError(undefined);
                    setShowConfirmation(false);
                    void cancelSubscription(subscription);
                  }}
                  localizationKey={localizationKeys('commerce.cancelSubscription')}
                />
              </>
            }
          >
            <Heading
              elementDescriptor={descriptors.drawerConfirmationTitle}
              as='h2'
              textVariant='h3'
              localizationKey={localizationKeys('commerce.cancelSubscriptionTitle', {
                plan: `${subscription.status === 'upcoming' ? 'upcoming ' : ''}${subscription.plan.name}`,
              })}
            />
            <Text
              elementDescriptor={descriptors.drawerConfirmationDescription}
              colorScheme='secondary'
              localizationKey={
                subscription.status === 'upcoming'
                  ? localizationKeys('commerce.cancelSubscriptionNoCharge')
                  : localizationKeys('commerce.cancelSubscriptionAccessUntil', {
                      plan: subscription.plan.name,
                      date: subscription.periodEnd,
                    })
              }
            />
            {cancelError && (
              <Alert colorScheme='danger'>{typeof cancelError === 'string' ? cancelError : cancelError.message}</Alert>
            )}
          </Drawer.Confirmation>
        </Drawer.Footer>
      ) : null}
    </>
  );
};

// New component for individual subscription cards
const SubscriptionCard = ({ subscription }: { subscription: CommerceSubscriptionResource }) => {
  const isActive = subscription.status === 'active';

  return (
    <Col
      sx={t => ({
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$neutralAlpha100,
        borderRadius: t.radii.$md,
      })}
    >
      <Col
        gap={3}
        sx={t => ({
          padding: t.space.$3,
        })}
      >
        {/* Header with name and badge */}
        <Flex
          justify='between'
          align='center'
        >
          <Text
            sx={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
            }}
          >
            {subscription.plan.name}
          </Text>
          <Badge
            colorScheme={isActive ? 'secondary' : 'primary'}
            localizationKey={isActive ? localizationKeys('badge__activePlan') : localizationKeys('badge__upcomingPlan')}
          />
        </Flex>

        {/* Pricing details */}
        <Box
          elementDescriptor={descriptors.statementSectionContentDetailsList}
          as='ul'
          sx={t => ({
            margin: 0,
            padding: 0,
            borderWidth: t.borderWidths.$normal,
            borderStyle: t.borderStyles.$solid,
            borderColor: t.colors.$neutralAlpha100,
            borderRadius: t.radii.$md,
            overflow: 'hidden',
          })}
        >
          <PriceItem
            labelIcon={subscription.planPeriod === 'month' ? Check : undefined}
            label='Monthly price'
            value={`${subscription.plan.currencySymbol}${subscription.plan.amountFormatted} / mo`}
          />
          <PriceItem
            labelIcon={subscription.planPeriod === 'annual' ? Check : undefined}
            label='Annual discount'
            value={`${subscription.plan.currencySymbol}${subscription.plan.annualMonthlyAmountFormatted} / mo`}
          />
        </Box>
      </Col>

      {isActive ? (
        <>
          <DetailRow
            label='Subscribed on'
            // TODO: Use localization for dates
            value={formatDate(subscription.createdAt)}
          />
          <DetailRow
            label={subscription.canceledAt ? 'Ends on' : 'Renews at'}
            value={formatDate(subscription.periodEnd)}
          />
        </>
      ) : (
        <DetailRow
          label='Begins on'
          value={formatDate(subscription.periodStart)}
        />
      )}
    </Col>
  );
};

// Helper component for detail rows
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <Flex
    justify='between'
    align='center'
    sx={t => ({
      paddingInline: t.space.$3,
      paddingBlock: t.space.$3,
      borderBlockStartWidth: t.borderWidths.$normal,
      borderBlockStartStyle: t.borderStyles.$solid,
      borderBlockStartColor: t.colors.$neutralAlpha100,
    })}
  >
    <Text>{label}</Text>
    <Text colorScheme='secondary'>{value}</Text>
  </Flex>
);

function PriceItem({
  labelIcon,
  label,
  valueCopyable: _valueCopyable = false,
  value,
  valueTruncated = false,
}: {
  icon?: React.ReactNode;
  label: string | LocalizationKey;
  labelIcon?: React.ComponentType;
  value: string | LocalizationKey;
  valueTruncated?: boolean;
  valueCopyable?: boolean;
}) {
  return (
    <Box
      elementDescriptor={descriptors.statementSectionContentDetailsListItem}
      as='li'
      sx={t => ({
        margin: 0,
        background: common.mergedColorsBackground(
          colors.setAlpha(t.colors.$colorBackground, 1),
          t.colors.$neutralAlpha50,
        ),
        display: 'flex',
        '&:not(:first-of-type)': {
          borderBlockStartWidth: t.borderWidths.$normal,
          borderBlockStartStyle: t.borderStyles.$solid,
          borderBlockStartColor: t.colors.$neutralAlpha100,
        },
        '&:first-of-type #test': {
          borderTopLeftRadius: t.radii.$md,
          borderTopRightRadius: t.radii.$md,
        },
        '&:last-of-type #test': {
          borderBottomLeftRadius: t.radii.$md,
          borderBottomRightRadius: t.radii.$md,
        },
      })}
    >
      <Flex
        justify='center'
        align='center'
        sx={t => ({
          width: t.space.$8,
          paddingInline: t.space.$2,
          paddingBlock: t.space.$1x5,
        })}
      >
        {labelIcon ? (
          <Icon
            icon={labelIcon}
            size='xs'
            colorScheme='neutral'
          />
        ) : null}
      </Flex>

      <Box
        id='test'
        sx={t => ({
          flex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          background: t.colors.$colorBackground,
          paddingInline: t.space.$2,
          paddingBlock: t.space.$1x5,
          marginBlock: -1,
          marginInline: -1,
          boxShadow: `inset 0px 0px 0px ${t.borderWidths.$normal} ${t.colors.$neutralAlpha100}`,
        })}
      >
        <Span
          elementDescriptor={descriptors.statementSectionContentDetailsListItemLabelContainer}
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            gap: t.space.$1x5,
          })}
        >
          <Text
            variant='caption'
            colorScheme='secondary'
            elementDescriptor={descriptors.statementSectionContentDetailsListItemLabel}
            localizationKey={label}
          />
        </Span>
        <Span
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            gap: t.space.$0x25,
            color: t.colors.$colorTextSecondary,
          })}
        >
          {typeof value === 'string' ? (
            <Text
              colorScheme='secondary'
              variant='caption'
              elementDescriptor={descriptors.statementSectionContentDetailsListItemValue}
            >
              {valueTruncated ? truncateWithEndVisible(value) : value}
            </Text>
          ) : (
            <Text
              elementDescriptor={descriptors.statementSectionContentDetailsListItemValue}
              colorScheme='secondary'
              variant='caption'
              localizationKey={value}
            />
          )}
        </Span>
      </Box>
    </Box>
  );
}

function SummaryItem(props: React.PropsWithChildren) {
  return (
    <Box
      elementDescriptor={descriptors.statementSectionContentDetailsListItem}
      as='li'
      sx={t => ({
        paddingInline: t.space.$4,
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      })}
    >
      {props.children}
    </Box>
  );
}

function SummmaryItemLabel(props: React.PropsWithChildren) {
  return (
    <Span
      elementDescriptor={descriptors.statementSectionContentDetailsListItemLabelContainer}
      sx={t => ({
        display: 'flex',
        alignItems: 'center',
        gap: t.space.$1x5,
      })}
    >
      {props.children}
    </Span>
  );
}

function SummmaryItemValue(props: React.PropsWithChildren) {
  return (
    <Span
      elementDescriptor={descriptors.statementSectionContentDetailsListItemLabelContainer}
      sx={t => ({
        display: 'flex',
        alignItems: 'center',
        gap: t.space.$0x25,
      })}
    >
      {props.children}
    </Span>
  );
}
