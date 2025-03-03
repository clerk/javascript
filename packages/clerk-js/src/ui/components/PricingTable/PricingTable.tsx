import { useClerk } from '@clerk/shared/react';
import type { __experimental_PricingTableProps, CommercePlanResource } from '@clerk/types';
import { useState } from 'react';

import { __experimental_CheckoutContext, usePricingTableContext } from '../../contexts';
import { Badge, Box, Button, Col, descriptors, Flex, Heading, Icon, localizationKeys, Text } from '../../customizables';
import { Avatar } from '../../elements';
import { useFetch } from '../../hooks';
import { Check } from '../../icons';
import { common, InternalThemeProvider } from '../../styledSystem';
import { colors } from '../../utils';
import { __experimental_Checkout } from '../Checkout';
import { PlanDetailBlade } from './PlanDetailBlade';

export const __experimental_PricingTable = (props: __experimental_PricingTableProps) => {
  const { __experimental_commerce } = useClerk();
  const { mode = 'mounted' } = usePricingTableContext();
  const [planPeriod, setPlanPeriod] = useState('month');
  const [selectedPlan, setSelectedPlan] = useState<CommercePlanResource>();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPlanDetail, setShowPlanDetail] = useState(false);

  const { data: plans } = useFetch(__experimental_commerce?.__experimental_billing.getPlans, 'commerce-plans');

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
      <Box
        elementDescriptor={descriptors.planGrid}
        sx={{
          display: 'grid',
          alignItems: 'start',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))',
          gridTemplateRows: 'repeat((4, auto), 1fr))',
          columnGap: '1rem',
          rowGap: '1rem',
        }}
      >
        {plans?.map(plan => {
          const hasFeatures = plan.features.length;
          return (
            <Box
              key={plan.id}
              elementDescriptor={descriptors.planCard}
              elementId={descriptors.planCard.setId(plan.slug)}
              sx={t => ({
                display: 'grid',
                gridRow: 'span 6',
                gridTemplateRows: 'subgrid',
                rowGap: '0',
                backgroundColor: t.colors.$colorBackground,
                borderWidth: t.borderWidths.$normal,
                borderStyle: t.borderStyles.$solid,
                borderColor: t.colors.$neutralAlpha100,
                boxShadow: t.shadows.$cardBoxShadow,
                borderRadius: t.radii.$xl,
                overflow: 'hidden',
              })}
            >
              <Box
                sx={t => ({
                  display: 'grid',
                  gridRow: 'span 4',
                  gridTemplateRows: 'subgrid',
                  gridRowGap: t.space.$2,
                  padding: t.space.$4,
                  background: common.mergedColorsBackground(
                    colors.setAlpha(t.colors.$colorBackground, 1),
                    t.colors.$neutralAlpha50,
                  ),
                  borderBottomWidth: hasFeatures ? t.borderWidths.$normal : '0',
                  borderBottomStyle: t.borderStyles.$solid,
                  borderBottomColor: t.colors.$neutralAlpha100,
                })}
              >
                <Flex
                  align='start'
                  justify='between'
                  sx={{ width: '100%', gridRow: 1 }}
                >
                  <Avatar
                    size={_ => 40}
                    title={plan.name}
                    initials={plan.name[0]}
                    rounded={false}
                    imageUrl={plan.avatarUrl}
                  />
                  <Badge
                    localizationKey={localizationKeys('badge__currentPlan')}
                    sx={t => ({
                      backgroundColor: t.colors.$primary500,
                      color: t.colors.$white,
                    })}
                  />
                </Flex>
                <Box>
                  <Heading>{plan.name}</Heading>
                  <Text
                    variant='subtitle'
                    colorScheme='secondary'
                  >
                    {plan.description}
                  </Text>
                </Box>
                <Box>
                  {plan.hasBaseFee ? (
                    <Flex
                      gap={2}
                      align='center'
                    >
                      <Text variant='h1'>
                        {plan.currencySymbol}
                        {planPeriod === 'month' ? plan.amountFormatted : plan.annualMonthlyAmountFormatted}
                      </Text>
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
                  ) : (
                    <Text
                      variant='h1'
                      localizationKey={localizationKeys('commerce_free')}
                    />
                  )}
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                  }}
                >
                  {plan.hasBaseFee ? (
                    <SegmentedControl
                      selected={planPeriod}
                      setSelected={setPlanPeriod}
                      options={[
                        { label: 'Monthly', value: 'month' },
                        { label: 'Annually', value: 'annual' },
                      ]}
                    />
                  ) : null}
                </Box>
              </Box>
              <Box
                elementDescriptor={descriptors.planCardFeatures}
                sx={t => ({
                  background: hasFeatures
                    ? 'transparent'
                    : common.mergedColorsBackground(
                        colors.setAlpha(t.colors.$colorBackground, 1),
                        t.colors.$neutralAlpha50,
                      ),
                })}
              >
                <Box
                  elementDescriptor={descriptors.planCardFeaturesList}
                  as='ul'
                  sx={t => ({
                    padding: t.space.$4,
                    display: 'grid',
                    rowGap: t.space.$3,
                  })}
                >
                  {plan.features.map(feature => (
                    <Box
                      elementDescriptor={descriptors.planCardFeaturesListItem}
                      elementId={descriptors.planCardFeaturesListItem.setId(feature.slug)}
                      key={feature.id}
                      as='li'
                    >
                      <Flex
                        gap={2}
                        align='baseline'
                      >
                        <Icon
                          icon={Check}
                          colorScheme='neutral'
                          size='sm'
                        />
                        <Text>{feature.description || feature.name}</Text>
                      </Flex>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box
                sx={t => ({
                  padding: t.space.$4,
                  background: common.mergedColorsBackground(
                    colors.setAlpha(t.colors.$colorBackground, 1),
                    t.colors.$neutralAlpha50,
                  ),
                  borderTopWidth: hasFeatures ? t.borderWidths.$normal : '0',
                  borderTopStyle: t.borderStyles.$solid,
                  borderTopColor: t.colors.$neutralAlpha100,
                })}
              >
                <Button block>Get started</Button>
              </Box>
            </Box>
          );
        })}
      </Box>
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
      <__experimental_CheckoutContext.Provider
        value={{
          componentName: 'Checkout',
          mode,
          isShowingBlade: showCheckout,
          handleCloseBlade: () => setShowCheckout(false),
        }}
      >
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <__experimental_Checkout
            planPeriod={planPeriod}
            planId={selectedPlan?.id}
          />
        </div>
      </__experimental_CheckoutContext.Provider>
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
  props: __experimental_PricingTableProps;
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
              <SegmentedControl
                selected={period}
                setSelected={setPeriod}
                options={[
                  { label: 'Monthly', value: 'month' },
                  { label: 'Annually', value: 'annual' },
                ]}
              />
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

type SegmentedControlOption = {
  label: string;
  value: string;
};
type SegmentedControlProps = {
  selected?: string;
  setSelected?: (k: string) => void;
  options: SegmentedControlOption[];
};

const SegmentedControl = ({ selected, setSelected, options }: SegmentedControlProps) => {
  return (
    <Flex
      sx={t => ({
        backgroundColor: t.colors.$neutralAlpha50,
        borderRadius: t.radii.$md,
        boxShadow:
          '0px 0px 0px 1px rgba(0, 0, 0, 0.06), 0px 1px 2px 0px rgba(25, 28, 33, 0.06), 0px 0px 0px 1px rgba(0, 0, 0, 0.06)',
      })}
    >
      {options.map(option => (
        <Button
          key={option.value}
          variant='unstyled'
          textVariant='caption'
          focusRing={false}
          onClick={() => setSelected && setSelected(option.value)}
          sx={t => ({
            padding: `${t.space.$1} ${t.space.$2x5}`,
            backgroundColor: option.value === selected ? t.colors.$colorBackground : 'transparent',
            borderRadius: t.radii.$md,
            boxShadow:
              option.value === selected
                ? `0px 0px 0px 1px var(--color-Generated-Border, rgba(0, 0, 0, 0.06)), 0px 1px 2px 0px rgba(25, 28, 33, 0.06), 0px 0px 2px 0px rgba(0, 0, 0, 0.08)`
                : 'none',
            color: option.value === selected ? t.colors.$colorText : t.colors.$colorTextSecondary,
          })}
        >
          {option.label}
        </Button>
      ))}
    </Flex>
  );
};
