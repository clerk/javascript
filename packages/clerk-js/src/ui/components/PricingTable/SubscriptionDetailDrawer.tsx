import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_CommerceSubscriptionResource,
  ClerkAPIError,
  ClerkRuntimeError,
} from '@clerk/types';
import { useState } from 'react';
import * as React from 'react';

import {
  Badge,
  Box,
  Button,
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
import { handleError } from '../../utils';

type DrawerRootProps = React.ComponentProps<typeof Drawer.Root>;

type SubscriptionDetailDrawerProps = {
  isOpen: DrawerRootProps['open'];
  setIsOpen: DrawerRootProps['onOpenChange'];
  portalProps?: DrawerRootProps['portalProps'];
  strategy: DrawerRootProps['strategy'];
  subscription?: __experimental_CommerceSubscriptionResource;
  setPlanPeriod: (p: __experimental_CommerceSubscriptionPlanPeriod) => void;
  onSubscriptionCancel: () => void;
};

export function SubscriptionDetailDrawer({
  isOpen,
  setIsOpen,
  portalProps,
  strategy,
  subscription,
  setPlanPeriod,
  onSubscriptionCancel,
}: SubscriptionDetailDrawerProps) {
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
      .cancel()
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
          <Button
            variant='bordered'
            colorScheme='secondary'
            size='sm'
            textVariant='buttonLarge'
            block
            onClick={() => setShowConfirmation(true)}
          >
            {/* TODO(@COMMERCE): needs localization */}
            Cancel Subscription
          </Button>
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
                >
                  {/* TODO(@COMMERCE): needs localization */}
                  Keep Subscription
                </Button>
              )}
              <Button
                variant='solid'
                colorScheme='danger'
                size='sm'
                textVariant='buttonLarge'
                isLoading={isSubmitting}
                onClick={cancelSubscription}
              >
                {/* TODO(@COMMERCE): needs localization */}
                Cancel Subscription
              </Button>
            </>
          }
        >
          <Heading
            elementDescriptor={descriptors.drawerConfirmationTitle}
            as='h2'
            textVariant='h3'
          >
            {/* TODO(@COMMERCE): needs localization */}
            Cancel {subscription.plan.name} Subscription?
          </Heading>
          <Text
            elementDescriptor={descriptors.drawerConfirmationDescription}
            colorScheme='secondary'
          >
            {/* TODO(@COMMERCE): needs localization */}
            You can keep using &ldquo;{subscription.plan.name}&rdquo; features until [DATE], after which you will no
            longer have access.
          </Text>
          {cancelError && (
            // TODO(@COMMERCE): needs localization
            <Alert colorScheme='danger'>{typeof cancelError === 'string' ? cancelError : cancelError.message}</Alert>
          )}
        </Drawer.Confirmation>
      </Drawer.Content>
    </Drawer.Root>
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
  const { name, avatarUrl, subscriptionIdForCurrentSubscriber, annualMonthlyAmount } = plan;
  const getPlanFee = React.useMemo(() => {
    if (annualMonthlyAmount <= 0) {
      return plan.amountFormatted;
    }
    return planPeriod === 'annual' ? plan.annualMonthlyAmountFormatted : plan.amountFormatted;
  }, [annualMonthlyAmount, planPeriod, plan.amountFormatted, plan.annualMonthlyAmountFormatted]);

  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.subscriptionDetailHeader}
      sx={t => ({
        width: '100%',
        padding: t.space.$4,
      })}
    >
      {avatarUrl || !!subscriptionIdForCurrentSubscriber || closeSlot ? (
        <Box
          elementDescriptor={descriptors.subscriptionDetailAvatarBadgeContainer}
          sx={t => ({
            marginBlockEnd: t.space.$3,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: t.space.$3,
            float: !avatarUrl && !subscriptionIdForCurrentSubscriber ? 'right' : undefined,
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
            {subscriptionIdForCurrentSubscriber ? (
              <Span
                elementDescriptor={descriptors.subscriptionDetailBadgeContainer}
                sx={{
                  flexBasis: closeSlot && avatarUrl ? '100%' : undefined,
                }}
              >
                <Badge
                  elementDescriptor={descriptors.subscriptionDetailBadge}
                  localizationKey={localizationKeys('badge__currentPlan')}
                  colorScheme='secondary'
                />
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
