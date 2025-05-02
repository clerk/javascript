import { useClerk, useOrganization } from '@clerk/shared/react';
import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_CommerceSubscriptionResource,
  __experimental_PlanDetailsProps,
  ClerkAPIError,
  ClerkRuntimeError,
} from '@clerk/types';
import { useState } from 'react';
import * as React from 'react';

import { PlansContextProvider, SubscriberTypeContext, usePlansContext, useSubscriberTypeContext } from '../../contexts';
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
import { Alert, Avatar, Drawer, SegmentedControl, useDrawerContext } from '../../elements';
import { InformationCircle } from '../../icons';
import { formatDate, handleError } from '../../utils';

export const PlanDetails = (props: __experimental_PlanDetailsProps) => {
  return (
    <SubscriberTypeContext.Provider value={props.subscriberType || 'user'}>
      <PlansContextProvider>
        <_PlanDetails {...props} />
      </PlansContextProvider>
    </SubscriberTypeContext.Provider>
  );
};

const _PlanDetails = ({
  plan,
  onSubscriptionCancel,
  portalRoot,
  planPeriod: _planPeriod = 'month',
}: __experimental_PlanDetailsProps) => {
  const clerk = useClerk();
  const { organization } = useOrganization();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<ClerkRuntimeError | ClerkAPIError | string | undefined>();
  const [planPeriod, setPlanPeriod] = useState<__experimental_CommerceSubscriptionPlanPeriod>(_planPeriod);

  const { setIsOpen } = useDrawerContext();
  const { activeOrUpcomingSubscription, revalidate, buttonPropsForPlan } = usePlansContext();
  const subscriberType = useSubscriberTypeContext();

  if (!plan) {
    return null;
  }

  const subscription = activeOrUpcomingSubscription(plan);

  const handleClose = () => {
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  const features = plan.features;
  const hasFeatures = features.length > 0;
  const cancelSubscription = async () => {
    if (!subscription) {
      return;
    }

    setCancelError(undefined);
    setIsSubmitting(true);

    await subscription
      .cancel({ orgId: subscriberType === 'org' ? organization?.id : undefined })
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

  const openCheckout = () => {
    handleClose();

    // if the plan doesn't support annual, use monthly
    let _planPeriod = planPeriod;
    if (planPeriod === 'annual' && plan.annualMonthlyAmount === 0) {
      _planPeriod = 'month';
    }

    clerk.__internal_openCheckout({
      planId: plan.id,
      planPeriod: _planPeriod,
      subscriberType: subscriberType,
      onSubscriptionComplete: () => {
        revalidate();
      },
      portalRoot,
    });
  };

  return (
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
          plan={plan}
          subscription={subscription}
          planPeriod={planPeriod}
          setPlanPeriod={setPlanPeriod}
          closeSlot={<Drawer.Close />}
        />
      </Drawer.Header>

      {hasFeatures ? (
        <Drawer.Body>
          <Text
            elementDescriptor={descriptors.planDetailCaption}
            variant={'caption'}
            localizationKey={localizationKeys('__experimental_commerce.availableFeatures')}
            colorScheme='secondary'
            sx={t => ({
              padding: t.space.$4,
              paddingBottom: 0,
            })}
          />
          <Box
            elementDescriptor={descriptors.planDetailFeaturesList}
            as='ul'
            role='list'
            sx={t => ({
              display: 'grid',
              rowGap: t.space.$6,
              padding: t.space.$4,
              margin: 0,
            })}
          >
            {features.map(feature => (
              <Box
                key={feature.id}
                elementDescriptor={descriptors.planDetailFeaturesListItem}
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
                <Span elementDescriptor={descriptors.planDetailFeaturesListItemContent}>
                  <Text
                    elementDescriptor={descriptors.planDetailFeaturesListItemTitle}
                    colorScheme='body'
                    sx={t => ({
                      fontWeight: t.fontWeights.$medium,
                    })}
                  >
                    {feature.name}
                  </Text>
                  {feature.description ? (
                    <Text
                      elementDescriptor={descriptors.planDetailFeaturesListItemDescription}
                      colorScheme='secondary'
                      sx={t => ({
                        marginBlockStart: t.space.$0x25,
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

      {plan.amount > 0 ? (
        <Drawer.Footer>
          {subscription ? (
            subscription.canceledAt ? (
              <Button
                block
                textVariant='buttonLarge'
                {...buttonPropsForPlan({ plan })}
                onClick={openCheckout}
              />
            ) : (
              <Button
                block
                variant='bordered'
                colorScheme='secondary'
                textVariant='buttonLarge'
                onClick={() => setShowConfirmation(true)}
                localizationKey={localizationKeys('__experimental_commerce.cancelSubscription')}
              />
            )
          ) : (
            <Button
              block
              textVariant='buttonLarge'
              {...buttonPropsForPlan({ plan })}
              onClick={openCheckout}
            />
          )}
        </Drawer.Footer>
      ) : null}

      {subscription ? (
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
      ) : null}
    </Drawer.Content>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Header
 * -----------------------------------------------------------------------------------------------*/

interface HeaderProps {
  plan: __experimental_CommercePlanResource;
  subscription?: __experimental_CommerceSubscriptionResource;
  planPeriod: __experimental_CommerceSubscriptionPlanPeriod;
  setPlanPeriod: (val: __experimental_CommerceSubscriptionPlanPeriod) => void;
  closeSlot?: React.ReactNode;
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>((props, ref) => {
  const { plan, subscription, closeSlot, planPeriod, setPlanPeriod } = props;

  const { captionForSubscription } = usePlansContext();

  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.planDetailHeader}
      sx={t => ({
        width: '100%',
        padding: t.space.$4,
        position: 'relative',
      })}
    >
      {closeSlot ? (
        <Box
          sx={t => ({
            position: 'absolute',
            top: t.space.$2,
            right: t.space.$2,
          })}
        >
          {closeSlot}
        </Box>
      ) : null}

      {plan.avatarUrl ? (
        <Avatar
          boxElementDescriptor={descriptors.planDetailAvatar}
          size={_ => 40}
          title={plan.name}
          initials={plan.name[0]}
          rounded={false}
          imageUrl={plan.avatarUrl}
          sx={t => ({
            marginBlockEnd: t.space.$3,
          })}
        />
      ) : null}
      {subscription ? (
        <Box
          elementDescriptor={descriptors.planDetailBadgeContainer}
          sx={t => ({
            marginBlockEnd: t.space.$3,
          })}
        >
          {subscription.status === 'active' ? (
            <Badge
              elementDescriptor={descriptors.planDetailBadge}
              localizationKey={localizationKeys('badge__currentPlan')}
              colorScheme={'secondary'}
            />
          ) : (
            <Badge
              elementDescriptor={descriptors.planDetailBadge}
              localizationKey={localizationKeys('badge__upcomingPlan')}
              colorScheme={'primary'}
            />
          )}
        </Box>
      ) : null}

      <Box
        sx={t => ({
          paddingRight: t.space.$10,
        })}
      >
        <Heading
          elementDescriptor={descriptors.planDetailTitle}
          as='h2'
          textVariant='h2'
        >
          {plan.name}
        </Heading>
        {plan.description ? (
          <Text
            elementDescriptor={descriptors.planDetailDescription}
            variant='subtitle'
            colorScheme='secondary'
          >
            {plan.description}
          </Text>
        ) : null}
      </Box>

      {plan.amount > 0 ? (
        <Flex
          elementDescriptor={descriptors.planDetailFeeContainer}
          align='center'
          wrap='wrap'
          sx={t => ({
            marginTop: t.space.$3,
            columnGap: t.space.$1x5,
          })}
        >
          <>
            <Text
              elementDescriptor={descriptors.planDetailFee}
              variant='h1'
              colorScheme='body'
            >
              {plan.currencySymbol}
              {(subscription && subscription.planPeriod === 'annual') || planPeriod === 'annual'
                ? plan.annualMonthlyAmountFormatted
                : plan.amountFormatted}
            </Text>
            <Text
              elementDescriptor={descriptors.planDetailFeePeriod}
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
            {plan.annualMonthlyAmount > 0 ? (
              <Box
                elementDescriptor={descriptors.planDetailFeePeriodNotice}
                sx={[
                  _ => ({
                    width: '100%',
                    display: 'grid',
                    gridTemplateRows:
                      (subscription && subscription.planPeriod === 'annual') || planPeriod === 'annual' ? '1fr' : '0fr',
                  }),
                ]}
                // @ts-ignore - Needed until React 19 support
                inert={
                  (subscription && subscription.planPeriod === 'annual') || planPeriod === 'annual' ? 'true' : undefined
                }
              >
                <Box
                  elementDescriptor={descriptors.planDetailFeePeriodNoticeInner}
                  sx={{
                    overflow: 'hidden',
                    minHeight: 0,
                  }}
                >
                  <Text
                    elementDescriptor={descriptors.planDetailFeePeriodNoticeLabel}
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
        </Flex>
      ) : null}

      {!!subscription && (
        <Text
          elementDescriptor={descriptors.planDetailCaption}
          variant={'caption'}
          localizationKey={captionForSubscription(subscription)}
          colorScheme='secondary'
          sx={t => ({
            marginTop: t.space.$3,
          })}
        />
      )}

      {!subscription && plan.annualMonthlyAmount > 0 ? (
        <Box
          elementDescriptor={descriptors.planDetailPeriodToggle}
          sx={t => ({
            display: 'flex',
            marginTop: t.space.$3,
          })}
        >
          <SegmentedControl.Root
            aria-label='Set pay period'
            value={planPeriod}
            onChange={value => setPlanPeriod(value as __experimental_CommerceSubscriptionPlanPeriod)}
          >
            <SegmentedControl.Button
              value='month'
              // TODO(@Commerce): needs localization
              text='Monthly'
            />
            <SegmentedControl.Button
              value='annual'
              // TODO(@Commerce): needs localization
              text='Annually'
            />
          </SegmentedControl.Root>
        </Box>
      ) : null}
    </Box>
  );
});
