import { useClerk } from '@clerk/shared/react';
import type {
  __internal_PlanDetailsProps,
  ClerkAPIResponseError,
  CommercePlanResource,
  CommerceSubscriptionPlanPeriod,
} from '@clerk/types';
import * as React from 'react';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { Alert } from '@/ui/elements/Alert';
import { Avatar } from '@/ui/elements/Avatar';
import { Drawer } from '@/ui/elements/Drawer';
import { Switch } from '@/ui/elements/Switch';

import { normalizeFormatted, SubscriberTypeContext } from '../../contexts';
import {
  Box,
  Col,
  descriptors,
  Flex,
  Flow,
  Heading,
  localizationKeys,
  Span,
  Spinner,
  Text,
  useLocalizations,
} from '../../customizables';

export const PlanDetails = (props: __internal_PlanDetailsProps) => {
  return (
    <Flow.Root flow='planDetails'>
      <Flow.Part>
        <Drawer.Content>
          <PlanDetailsInternal {...props} />
        </Drawer.Content>
      </Flow.Part>
    </Flow.Root>
  );
};

const BodyFiller = ({ children }: { children: React.ReactNode }) => {
  return (
    <Drawer.Body
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        overflowY: 'auto',
        padding: t.space.$4,
        gap: t.space.$4,
      })}
    >
      {children}
    </Drawer.Body>
  );
};

const PlanDetailsError = ({ error }: { error: ClerkAPIResponseError }) => {
  const { translateError } = useLocalizations();
  return (
    <BodyFiller>
      <Alert
        variant='danger'
        colorScheme='danger'
      >
        {translateError(error.errors[0])}
      </Alert>
    </BodyFiller>
  );
};

const PlanDetailsInternal = ({
  planId,
  plan: initialPlan,
  initialPlanPeriod = 'month',
}: __internal_PlanDetailsProps) => {
  const clerk = useClerk();
  const [planPeriod, setPlanPeriod] = useState<CommerceSubscriptionPlanPeriod>(initialPlanPeriod);

  const {
    data: plan,
    isLoading,
    error,
  } = useSWR<CommercePlanResource, ClerkAPIResponseError>(
    planId || initialPlan ? { type: 'plan', id: planId || initialPlan?.id } : null,
    // @ts-expect-error we are handling it above
    () => clerk.billing.getPlan({ id: planId || initialPlan?.id }),
    {
      fallbackData: initialPlan,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      keepPreviousData: true,
    },
  );

  if (isLoading && !initialPlan) {
    return (
      <BodyFiller>
        <Spinner />
      </BodyFiller>
    );
  }

  if (!plan && error) {
    return <PlanDetailsError error={error} />;
  }

  if (!plan) {
    return null;
  }

  const features = plan.features;
  const hasFeatures = features.length > 0;

  return (
    <SubscriberTypeContext.Provider value={plan.forPayerType === 'org' ? 'organization' : 'user'}>
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
            localizationKey={localizationKeys('commerce.availableFeatures')}
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
    </SubscriberTypeContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Header
 * -----------------------------------------------------------------------------------------------*/

interface HeaderProps {
  plan: CommercePlanResource;
  planPeriod: CommerceSubscriptionPlanPeriod;
  setPlanPeriod: (val: CommerceSubscriptionPlanPeriod) => void;
  closeSlot?: React.ReactNode;
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>((props, ref) => {
  const { plan, closeSlot, planPeriod, setPlanPeriod } = props;

  const fee = useMemo(() => {
    if (plan.annualMonthlyFee.amount <= 0) {
      return plan.fee;
    }
    return planPeriod === 'annual' ? plan.annualMonthlyFee : plan.fee;
  }, [plan, planPeriod]);

  const feeFormatted = React.useMemo(() => {
    return normalizeFormatted(fee.amountFormatted);
  }, [fee.amountFormatted]);

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
            insetInlineEnd: t.space.$2,
          })}
        >
          {closeSlot}
        </Box>
      ) : null}

      <Col
        gap={3}
        elementDescriptor={descriptors.planDetailBadgeAvatarTitleDescriptionContainer}
      >
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
        <Col
          gap={1}
          elementDescriptor={descriptors.planDetailTitleDescriptionContainer}
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
        </Col>
      </Col>

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
            {fee.currencySymbol}
            {feeFormatted}
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
            localizationKey={localizationKeys('commerce.month')}
          />
        </>
      </Flex>

      {plan.annualMonthlyFee.amount > 0 ? (
        <Box
          elementDescriptor={descriptors.planDetailPeriodToggle}
          sx={t => ({
            display: 'flex',
            marginTop: t.space.$3,
          })}
        >
          <Switch
            isChecked={planPeriod === 'annual'}
            onChange={(checked: boolean) => setPlanPeriod(checked ? 'annual' : 'month')}
            label={localizationKeys('commerce.billedAnnually')}
          />
        </Box>
      ) : (
        <Text
          elementDescriptor={descriptors.pricingTableCardFeePeriodNotice}
          variant='caption'
          colorScheme='secondary'
          localizationKey={
            plan.isDefault ? localizationKeys('commerce.alwaysFree') : localizationKeys('commerce.billedMonthlyOnly')
          }
          sx={t => ({
            justifySelf: 'flex-start',
            alignSelf: 'center',
            marginTop: t.space.$3,
          })}
        />
      )}
    </Box>
  );
});
