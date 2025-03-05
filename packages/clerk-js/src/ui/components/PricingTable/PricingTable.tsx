import { useClerk } from '@clerk/shared/react';
import type { CommercePlanResource, PricingTableProps } from '@clerk/types';
import { useState } from 'react';

import { CheckoutContext, usePricingTableContext } from '../../contexts';
import { Badge, Button, Col, Flex, Heading, Icon, localizationKeys, Text } from '../../customizables';
import { Avatar, SegmentedControl } from '../../elements';
import { useFetch } from '../../hooks';
import { Check } from '../../icons';
import { InternalThemeProvider } from '../../styledSystem';
import { Checkout } from '../Checkout';
import { PlanDetailBlade } from './PlanDetailBlade';

export const PricingTable = (props: PricingTableProps) => {
  const { commerce } = useClerk();
  const { mode = 'mounted' } = usePricingTableContext();
  const [planPeriod, setPlanPeriod] = useState('month');
  const [selectedPlan, setSelectedPlan] = useState<CommercePlanResource>();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPlanDetail, setShowPlanDetail] = useState(false);

  const { data: plans } = useFetch(commerce?.billing.getPlans, 'commerce-plans');

  const selectPlan = (plan: CommercePlanResource) => {
    setSelectedPlan(plan);
    if (plan.isActiveForPayer) {
      setShowPlanDetail(true);
    } else {
      setShowCheckout(true);
    }
  };

  return (
    <InternalThemeProvider>
      <Flex
        gap={4}
        align='start'
        sx={{ width: '100%' }}
      >
        {plans?.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            period={planPeriod}
            setPeriod={setPlanPeriod}
            onSelect={selectPlan}
            props={props}
          />
        ))}
      </Flex>
      <CheckoutContext.Provider
        value={{
          componentName: 'Checkout',
          mode,
          isShowingBlade: showCheckout,
          handleCloseBlade: () => setShowCheckout(false),
        }}
      >
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <Checkout
            planPeriod={planPeriod}
            planId={selectedPlan?.id}
          />
        </div>
      </CheckoutContext.Provider>
      <PlanDetailBlade
        isOpen={showPlanDetail}
        handleClose={() => setShowPlanDetail(false)}
        plan={selectedPlan}
      />
    </InternalThemeProvider>
  );
};

const PlanCard = ({
  plan,
  period,
  setPeriod,
  onSelect,
  props,
}: {
  plan: CommercePlanResource;
  period: string;
  setPeriod: (k: string) => void;
  onSelect: (plan: CommercePlanResource) => void;
  props: PricingTableProps;
}) => {
  const { ctaPosition = 'bottom', collapseFeatures = false } = props;
  const { mode = 'mounted' } = usePricingTableContext();
  const compact = mode === 'modal';
  const isActivePlan = plan.isActiveForPayer;

  return (
    <Col
      sx={t => ({
        flex: 1,
        borderRadius: t.radii.$md,
        backgroundColor: t.colors.$neutralAlpha50,
        boxShadow: t.shadows.$tableBodyShadow,
        maxWidth: 320,
        width: compact ? 'auto' : 320,
      })}
    >
      <Col
        justify='center'
        align='start'
        gap={3}
        sx={t => ({
          padding: compact ? t.space.$3 : t.space.$4,
          borderBottomWidth: t.borderWidths.$normal,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$neutralAlpha50,
        })}
      >
        <Flex
          align='start'
          justify='between'
          sx={_ => ({ width: '100%' })}
        >
          <Avatar
            size={_ => 40}
            title={plan.name}
            initials={plan.name[0]}
            rounded={false}
            imageUrl={plan.avatarUrl}
          />
          {isActivePlan && (
            <Badge
              localizationKey={localizationKeys('badge__currentPlan')}
              sx={t => ({
                backgroundColor: t.colors.$primary500,
                color: t.colors.$white,
              })}
            />
          )}
        </Flex>
        <Col
          align='start'
          gap={2}
        >
          <Col>
            <Heading textVariant={compact ? 'h3' : 'h2'}>{plan.name}</Heading>
            {!compact && (
              <Text
                variant='subtitle'
                colorScheme='secondary'
              >
                {plan.description}
              </Text>
            )}
          </Col>

          {plan.hasBaseFee ? (
            <>
              <Flex
                gap={2}
                align='baseline'
              >
                <Heading textVariant={compact ? 'h2' : 'h1'}>
                  {plan.currencySymbol}
                  {period === 'month' ? plan.amountFormatted : plan.annualMonthlyAmountFormatted}
                </Heading>
                <Flex
                  gap={1}
                  align='baseline'
                >
                  <Text
                    variant='caption'
                    colorScheme='secondary'
                  >
                    /
                  </Text>
                  <Text
                    variant='caption'
                    colorScheme='secondary'
                    sx={{ textTransform: 'lowercase' }}
                    localizationKey={localizationKeys('commerce_month')}
                  />
                </Flex>
              </Flex>
              <SegmentedControl.Root
                aria-label='Choose period'
                value={period}
                onChange={setPeriod}
              >
                <SegmentedControl.Button value='month'>Monthly</SegmentedControl.Button>
                <SegmentedControl.Button value='annual'>Annually</SegmentedControl.Button>
              </SegmentedControl.Root>
            </>
          ) : (
            <Heading
              textVariant={compact ? 'h2' : 'h1'}
              localizationKey={localizationKeys('commerce_free')}
            />
          )}
        </Col>
      </Col>
      {plan.features.length > 0 && !collapseFeatures && (
        <Col
          gap={compact ? 2 : 3}
          align='start'
          sx={t => ({
            order: ctaPosition === 'top' ? 2 : 1,
            backgroundColor: t.colors.$colorBackground,
            padding: compact ? t.space.$3 : t.space.$4,
          })}
        >
          {plan.features.map(feature => (
            <Flex
              gap={2}
              align='baseline'
              key={feature.id}
            >
              <Icon
                icon={Check}
                colorScheme='neutral'
                size='sm'
              />
              <Text>{feature.description ?? feature.name}</Text>
            </Flex>
          ))}
        </Col>
      )}
      <Flex
        align='center'
        sx={t => ({
          order: ctaPosition === 'top' ? 1 : 2,
          padding: compact ? t.space.$3 : t.space.$4,
          borderTopWidth: t.borderWidths.$normal,
          borderTopStyle: t.borderStyles.$solid,
          borderTopColor: t.colors.$neutralAlpha50,
        })}
      >
        <Button
          colorScheme={isActivePlan ? 'light' : 'primary'}
          size='sm'
          textVariant={compact ? 'buttonSmall' : 'buttonLarge'}
          sx={{
            width: '100%',
          }}
          localizationKey={
            isActivePlan ? localizationKeys('commerce_manageMembership') : localizationKeys('commerce_getStarted')
          }
          onClick={() => onSelect(plan)}
        />
      </Flex>
    </Col>
  );
};
