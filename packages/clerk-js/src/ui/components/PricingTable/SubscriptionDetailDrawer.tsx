import { useOrganization } from '@clerk/shared/react';
import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriberType,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_CommerceSubscriptionResource,
  ClerkAPIError,
  ClerkRuntimeError,
} from '@clerk/types';
import { useState } from 'react';
import * as React from 'react';

import { usePlansContext } from '../../contexts';
import {
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
  Text,
} from '../../customizables';
import { Alert, Avatar, Drawer, ReversibleContainer } from '../../elements';
import { InformationCircle } from '../../icons';
import { InternalThemeProvider } from '../../styledSystem';
import { formatDate, handleError } from '../../utils';
type DrawerRootProps = React.ComponentProps<typeof Drawer.Root>;

type SubscriptionDetailDrawerProps = {
  isOpen: DrawerRootProps['open'];
  setIsOpen: DrawerRootProps['onOpenChange'];
  portalProps?: DrawerRootProps['portalProps'];
  strategy: DrawerRootProps['strategy'];
  subscription?: __experimental_CommerceSubscriptionResource;
  subscriberType: __experimental_CommerceSubscriberType;
  setPlanPeriod: (p: __experimental_CommerceSubscriptionPlanPeriod) => void;
  onSubscriptionCancel: () => void;
};

export function SubscriptionDetailDrawer({
  isOpen,
  setIsOpen,
  portalProps,
  strategy,
  subscription,
  subscriberType,
  setPlanPeriod,
  onSubscriptionCancel,
}: SubscriptionDetailDrawerProps) {
  const { organization } = useOrganization();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<ClerkRuntimeError | ClerkAPIError | string | undefined>();
  if (!subscription) {
    return null;
  }
  const features = subscription.plan.features;
  const hasFeatures = features.length > 0;
  const cancelSubscription = async () => {
    setCancelError(undefined);
    setIsSubmitting(true);

    await subscription
      .cancel({ orgId: subscriberType === 'org' ? organization?.id : undefined })
      .then(() => {
        setIsSubmitting(false);
        onSubscriptionCancel();
        setIsOpen(false);
      })
      .catch(error => {
        handleError(error, [], setCancelError);
        setIsSubmitting(false);
      });
  };

  return (
    <InternalThemeProvider>
      <Drawer.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        strategy={strategy}
        portalProps={portalProps}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header
            sx={t =>
              !hasFeatures
                ? {
                    flex: 1,
                    borderBottomWidth: 0,
                    background: t.colors.$colorBackground,
                  }
                : null
            }
          >
            <Header
              plan={subscription.plan}
              planPeriod={subscription.planPeriod}
              setPlanPeriod={setPlanPeriod}
              closeSlot={<Drawer.Close />}
            />
          </Drawer.Header>

          {hasFeatures ? (
            <Drawer.Body>
              <Box
                elementDescriptor={descriptors.subscriptionDetailFeaturesList}
                as='ul'
                role='list'
                sx={t => ({
                  display: 'grid',
                  rowGap: t.space.$4,
                  padding: t.space.$4,
                })}
              >
                {features.map(feature => (
                  <Box
                    key={feature.id}
                    elementDescriptor={descriptors.subscriptionDetailFeaturesListItem}
                    as='li'
                    sx={t => ({
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: t.space.$3,
                    })}
                  >
                    {feature.avatarUrl ? (
                      <Avatar
                        size={_ => 24}
                        title={feature.name}
                        initials={feature.name[0]}
                        rounded={false}
                        imageUrl={feature.avatarUrl}
                      />
                    ) : null}
                    <Span elementDescriptor={descriptors.subscriptionDetailFeaturesListItemContent}>
                      <Text
                        elementDescriptor={descriptors.subscriptionDetailFeaturesListItemTitle}
                        colorScheme='body'
                        sx={t => ({
                          fontWeight: t.fontWeights.$medium,
                        })}
                      >
                        {feature.name}
                      </Text>
                      {feature.description ? (
                        <Text
                          elementDescriptor={descriptors.subscriptionDetailFeaturesListItemDescription}
                          colorScheme='secondary'
                          sx={t => ({
                            marginBlockStart: t.space.$0x25,
                            fontSize: t.fontSizes.$xs,
                          })}
                        >
                          {feature.description}
                        </Text>
                      ) : null}
                    </Span>
                  </Box>
                ))}
              </Box>
            </Drawer.Body>
          ) : null}

          <Drawer.Footer>
            <Col gap={2}>
              {subscription.status === 'upcoming' ? (
                <>
                  <Heading
                    elementDescriptor={descriptors.drawerConfirmationTitle}
                    as='h2'
                    textVariant='h3'
                  >
                    {/* TODO(@COMMERCE): needs localization */}
                    Subscription starts {formatDate(new Date(subscription.periodStart), 'short')}
                  </Heading>
                  <Text
                    elementDescriptor={descriptors.drawerConfirmationDescription}
                    colorScheme='secondary'
                  >
                    {/* TODO(@COMMERCE): needs localization */}
                    Your subscription to &ldquo;{subscription.plan.name}&rdquo; begins on{' '}
                    {formatDate(new Date(subscription.periodStart))}. You have access to all your previous plan&rsquo;s
                    features until then.
                  </Text>
                </>
              ) : null}
              <Button
                variant='bordered'
                colorScheme='secondary'
                size='sm'
                textVariant='buttonLarge'
                block
                onClick={() => setShowConfirmation(true)}
                localizationKey={localizationKeys('__experimental_commerce.cancelSubscription')}
              />
            </Col>
          </Drawer.Footer>

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
                    onClick={() => {
                      setCancelError(undefined);
                      setShowConfirmation(false);
                    }}
                    localizationKey={localizationKeys('__experimental_commerce.keepSubscription')}
                  />
                )}
                <Button
                  variant='solid'
                  colorScheme='danger'
                  size='sm'
                  textVariant='buttonLarge'
                  isLoading={isSubmitting}
                  onClick={() => {
                    setCancelError(undefined);
                    setShowConfirmation(false);
                    void cancelSubscription();
                  }}
                  localizationKey={localizationKeys('__experimental_commerce.cancelSubscription')}
                />
              </>
            }
          >
            <Heading
              elementDescriptor={descriptors.drawerConfirmationTitle}
              as='h2'
              textVariant='h3'
            >
              {/* TODO(@COMMERCE): needs localization */}
              Cancel {subscription.status === 'upcoming' ? 'upcoming ' : ''}
              {subscription.plan.name} Subscription?
            </Heading>
            <Text
              elementDescriptor={descriptors.drawerConfirmationDescription}
              colorScheme='secondary'
            >
              {/* TODO(@COMMERCE): needs localization */}
              {subscription.status === 'upcoming' ? (
                <>You will not be charged for this subscription.</>
              ) : (
                <>
                  You can keep using &ldquo;{subscription.plan.name}&rdquo; features until{' '}
                  {formatDate(new Date(subscription.periodEnd))}, after which you will no longer have access.
                </>
              )}
            </Text>
            {cancelError && (
              // TODO(@COMMERCE): needs localization
              <Alert colorScheme='danger'>{typeof cancelError === 'string' ? cancelError : cancelError.message}</Alert>
            )}
          </Drawer.Confirmation>
        </Drawer.Content>
      </Drawer.Root>
    </InternalThemeProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Header
 * -----------------------------------------------------------------------------------------------*/

interface HeaderProps {
  plan: __experimental_CommercePlanResource;
  isActivePlan?: boolean;
  planPeriod: __experimental_CommerceSubscriptionPlanPeriod;
  setPlanPeriod: (val: __experimental_CommerceSubscriptionPlanPeriod) => void;
  closeSlot?: React.ReactNode;
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>((props, ref) => {
  const { plan, planPeriod, closeSlot } = props;
  const { name, avatarUrl, annualMonthlyAmount } = plan;
  const getPlanFee = React.useMemo(() => {
    if (annualMonthlyAmount <= 0) {
      return plan.amountFormatted;
    }
    return planPeriod === 'annual' ? plan.annualMonthlyAmountFormatted : plan.amountFormatted;
  }, [annualMonthlyAmount, planPeriod, plan.amountFormatted, plan.annualMonthlyAmountFormatted]);

  const { activeOrUpcomingSubscription, isDefaultPlanImplicitlyActive } = usePlansContext();
  const subscription = activeOrUpcomingSubscription(plan);
  const isImplicitlyActive = isDefaultPlanImplicitlyActive && plan.isDefault;

  const showBadge = !!subscription || isImplicitlyActive;

  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.subscriptionDetailHeader}
      sx={t => ({
        width: '100%',
        padding: t.space.$4,
      })}
    >
      {avatarUrl || showBadge || closeSlot ? (
        <Box
          elementDescriptor={descriptors.subscriptionDetailAvatarBadgeContainer}
          sx={t => ({
            marginBlockEnd: t.space.$3,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: t.space.$3,
            float: !avatarUrl && !showBadge ? 'right' : undefined,
          })}
        >
          {avatarUrl ? (
            <Avatar
              boxElementDescriptor={descriptors.subscriptionDetailAvatar}
              size={_ => 40}
              title={name}
              initials={name[0]}
              rounded={false}
              imageUrl={avatarUrl}
            />
          ) : null}
          <ReversibleContainer reverse={!avatarUrl}>
            {closeSlot}
            {showBadge ? (
              <Span
                elementDescriptor={descriptors.subscriptionDetailBadgeContainer}
                sx={{
                  flexBasis: closeSlot && avatarUrl ? '100%' : undefined,
                }}
              >
                {isImplicitlyActive || subscription?.status === 'active' ? (
                  <Badge
                    elementDescriptor={descriptors.pricingTableCardBadge}
                    localizationKey={localizationKeys('badge__currentPlan')}
                    colorScheme={'primary'}
                  />
                ) : (
                  <Badge
                    elementDescriptor={descriptors.pricingTableCardBadge}
                    localizationKey={localizationKeys('badge__startsAt', {
                      date: subscription?.periodStart,
                    })}
                    colorScheme={'secondary'}
                  />
                )}
              </Span>
            ) : null}
          </ReversibleContainer>
        </Box>
      ) : null}
      <Heading
        elementDescriptor={descriptors.subscriptionDetailTitle}
        as='h2'
        textVariant='h2'
      >
        {plan.name}
      </Heading>
      {plan.description ? (
        <Text
          elementDescriptor={descriptors.subscriptionDetailDescription}
          variant='subtitle'
          colorScheme='secondary'
        >
          {plan.description}
        </Text>
      ) : null}
      <Flex
        elementDescriptor={descriptors.subscriptionDetailFeeContainer}
        align='center'
        wrap='wrap'
        sx={t => ({
          marginTop: t.space.$3,
          columnGap: t.space.$1x5,
        })}
      >
        {plan.hasBaseFee ? (
          <>
            <Text
              elementDescriptor={descriptors.subscriptionDetailFee}
              variant='h1'
              colorScheme='body'
            >
              {plan.currencySymbol}
              {getPlanFee}
            </Text>
            <Text
              elementDescriptor={descriptors.subscriptionDetailFeePeriod}
              variant='caption'
              colorScheme='secondary'
              sx={t => ({
                textTransform: 'lowercase',
                ':before': {
                  content: '"/"',
                  marginInlineEnd: t.space.$1,
                },
              })}
              localizationKey={localizationKeys('__experimental_commerce.month')}
            />
            {annualMonthlyAmount > 0 ? (
              <Box
                elementDescriptor={descriptors.subscriptionDetailFeePeriodNotice}
                sx={[
                  _ => ({
                    width: '100%',
                    display: 'grid',
                    gridTemplateRows: planPeriod === 'annual' ? '1fr' : '0fr',
                  }),
                ]}
                // @ts-ignore - Needed until React 19 support
                inert={planPeriod !== 'annual' ? 'true' : undefined}
              >
                <Box
                  elementDescriptor={descriptors.subscriptionDetailFeePeriodNoticeInner}
                  sx={{
                    overflow: 'hidden',
                    minHeight: 0,
                  }}
                >
                  <Text
                    elementDescriptor={descriptors.subscriptionDetailFeePeriodNoticeLabel}
                    variant='caption'
                    colorScheme='secondary'
                    sx={t => ({
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      columnGap: t.space.$1,
                    })}
                  >
                    <Icon
                      icon={InformationCircle}
                      colorScheme='neutral'
                      size='sm'
                      aria-hidden
                    />{' '}
                    <Span localizationKey={localizationKeys('__experimental_commerce.billedAnnually')} />
                  </Text>
                </Box>
              </Box>
            ) : null}
          </>
        ) : (
          <Text
            elementDescriptor={descriptors.subscriptionDetailFee}
            variant='h1'
            localizationKey={localizationKeys('__experimental_commerce.free')}
            colorScheme='body'
          />
        )}
      </Flex>
    </Box>
  );
});
