import type { __experimental_CommercePlanResource } from '@clerk/types';
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
  useAppearance,
} from '../../customizables';
import { Avatar, SegmentedControl } from '../../elements';
import { usePrefersReducedMotion } from '../../hooks';
import { Check, InformationCircle } from '../../icons';
import { common, InternalThemeProvider, mqu, type ThemableCssProp } from '../../styledSystem';
import { colors } from '../../utils';
import type { PlanPeriod } from './PlanCard';

interface PricingTableMatrixProps {
  plans: __experimental_CommercePlanResource[];
  highlightedPlan?: __experimental_CommercePlanResource['slug'];
  planPeriod: PlanPeriod;
  setPlanPeriod: (val: PlanPeriod) => void;
  onSelect: (plan: __experimental_CommercePlanResource) => void;
}

export function PricingTableMatrix({
  plans = [],
  planPeriod,
  setPlanPeriod,
  onSelect,
  highlightedPlan,
}: PricingTableMatrixProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedLayout;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;

  const planCardFeePeriodNoticeAnimation: ThemableCssProp = t => ({
    transition: isMotionSafe
      ? `grid-template-rows ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}`
      : 'none',
  });

  const highlightBackgroundColor: ThemableCssProp = t => ({
    background: common.mergedColorsBackground(colors.setAlpha(t.colors.$colorBackground, 1), t.colors.$neutralAlpha25),
  });

  const gridTemplateColumns = React.useMemo(() => `repeat(${plans.length + 1}, minmax(9.375rem,1fr))`, [plans.length]);

  const renderBillingCycleControls = React.useMemo(() => plans.some(plan => plan.annualMonthlyAmount > 0), [plans]);

  const getAllFeatures = React.useMemo(() => {
    const featuresSet = new Set<string>();
    plans.forEach(({ features }) => {
      features.forEach(({ name }) => featuresSet.add(name));
    });
    return Array.from(featuresSet);
  }, [plans]);

  if (!plans.length) {
    return null;
  }

  return (
    <InternalThemeProvider>
      <Box
        elementDescriptor={descriptors.pricingTableMatrixRoot}
        sx={{
          position: 'relative',
          minWidth: '100%',
          display: 'grid',
          isolation: 'isolate',
          [mqu.md]: {
            overflowX: 'auto',
          },
        }}
      >
        <Box
          elementDescriptor={descriptors.pricingTableMatrixTable}
          role='table'
        >
          <Box
            elementDescriptor={descriptors.pricingTableMatrixRowGroup}
            role='rowgroup'
            sx={t => ({
              position: 'sticky',
              top: 0,
              borderBottomWidth: t.borderWidths.$normal,
              borderBottomStyle: t.borderStyles.$solid,
              borderBottomColor: t.colors.$neutralAlpha100,
            })}
          >
            <Box
              elementDescriptor={descriptors.pricingTableMatrixRow}
              role='row'
              sx={{
                display: 'grid',
                gridTemplateColumns,
              }}
            >
              <Box
                elementDescriptor={descriptors.pricingTableMatrixColumnHeader}
                role='columnheader'
                sx={t => ({
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-end',
                  rowGap: t.space.$3,
                  paddingBlockEnd: t.space.$12,
                  paddingInlineStart: t.space.$3,
                })}
              >
                {renderBillingCycleControls ? (
                  <>
                    <Text
                      colorScheme='secondary'
                      variant='caption'
                    >
                      Billing cycle
                    </Text>
                    <SegmentedControl.Root
                      aria-label='Set pay period'
                      value={planPeriod}
                      onChange={value => setPlanPeriod(value as PlanPeriod)}
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
                  </>
                ) : null}
              </Box>
              {plans.map(plan => {
                const highlight = plan.slug === highlightedPlan;
                const planFee =
                  plan.annualMonthlyAmount <= 0
                    ? plan.amountFormatted
                    : planPeriod === 'annual'
                      ? plan.annualMonthlyAmountFormatted
                      : plan.amountFormatted;

                return (
                  <Box
                    elementDescriptor={descriptors.pricingTableMatrixColumnHeader}
                    elementId={highlight ? descriptors.pricingTableMatrixColumnHeader.setId('highlighted') : undefined}
                    key={plan.slug}
                    role='columnheader'
                    sx={[
                      t => ({
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        flex: 1,
                        borderStartStartRadius: t.radii.$xl,
                        borderStartEndRadius: t.radii.$xl,
                      }),
                      highlight && highlightBackgroundColor,
                    ]}
                  >
                    <Box
                      sx={t => ({
                        width: '100%',
                        padding: t.space.$4,
                      })}
                    >
                      {plan.avatarUrl || highlight ? (
                        <Span
                          sx={t => ({
                            width: '100%',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            marginBlockEnd: t.space.$3,
                          })}
                        >
                          {plan.avatarUrl ? (
                            <Avatar
                              size={_ => 40}
                              title={plan.name}
                              initials={plan.name[0]}
                              rounded={false}
                              imageUrl={plan.avatarUrl}
                            />
                          ) : null}
                          {/* TODO(@Commerce): needs localization */}
                          {highlight ? <Badge colorScheme='secondary'>Popular</Badge> : null}
                        </Span>
                      ) : null}
                      <Heading textVariant='h3'>{plan.name}</Heading>
                      <Flex
                        align='center'
                        wrap='wrap'
                        sx={t => ({
                          marginTop: t.space.$2,
                          columnGap: t.space.$1x5,
                        })}
                      >
                        {plan.hasBaseFee ? (
                          <>
                            <Text
                              variant='h2'
                              colorScheme='body'
                            >
                              {plan.currencySymbol}
                              {planFee}
                            </Text>
                            <Text
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
                                sx={[
                                  _ => ({
                                    width: '100%',
                                    display: 'grid',
                                    gridTemplateRows: planPeriod === 'annual' ? '1fr' : '0fr',
                                  }),
                                  planCardFeePeriodNoticeAnimation,
                                ]}
                                // @ts-ignore - Needed until React 19 support
                                inert={planPeriod !== 'annual' ? 'true' : undefined}
                              >
                                <Box
                                  sx={{
                                    overflow: 'hidden',
                                    minHeight: 0,
                                  }}
                                >
                                  <Text
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
                                    <Span
                                      localizationKey={localizationKeys('__experimental_commerce.billedAnnually')}
                                    />
                                  </Text>
                                </Box>
                              </Box>
                            ) : null}
                          </>
                        ) : (
                          <Text
                            variant='h2'
                            localizationKey={localizationKeys('__experimental_commerce.free')}
                            colorScheme='body'
                          />
                        )}
                      </Flex>
                    </Box>
                    <Box
                      sx={t => ({
                        width: '100%',
                        marginBlockStart: 'auto',
                        marginBlockEnd: t.space.$8,
                        paddingBlockStart: t.space.$2,
                        paddingBlockEnd: t.space.$4,
                        paddingInline: t.space.$4,
                      })}
                    >
                      <Button
                        block
                        variant='bordered'
                        colorScheme={highlight ? 'primary' : 'secondary'}
                        textVariant='buttonSmall'
                        size='xs'
                        onClick={() => {
                          onSelect(plan);
                        }}
                        localizationKey={
                          plan.isActiveForPayer ? 'Manage' : localizationKeys('__experimental_commerce.getStarted')
                        }
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Box
            elementDescriptor={descriptors.pricingTableMatrixRowGroup}
            role='rowgroup'
            sx={{
              minWidth: '100%',
            }}
          >
            {getAllFeatures.map(feature => {
              return (
                <Box
                  elementDescriptor={descriptors.pricingTableMatrixRow}
                  key={feature}
                  role='row'
                  sx={t => ({
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns,
                    borderBottomWidth: t.borderWidths.$normal,
                    borderBottomStyle: t.borderStyles.$solid,
                    borderBottomColor: t.colors.$neutralAlpha100,
                    ':after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      backgroundColor: t.colors.$neutralAlpha25,
                      opacity: 0,
                    },
                    ':hover:after': {
                      opacity: 1,
                    },
                  })}
                >
                  <Box
                    elementDescriptor={descriptors.pricingTableMatrixCell}
                    role='cell'
                    sx={t => ({
                      padding: t.space.$3,
                    })}
                  >
                    <Text colorScheme='body'>{feature}</Text>
                  </Box>
                  {plans.map(plan => {
                    const highlight = plan.slug === highlightedPlan;
                    const hasFeature = plan.features.some(f => f.name === feature);
                    return (
                      <Box
                        elementDescriptor={descriptors.pricingTableMatrixCell}
                        elementId={highlight ? descriptors.pricingTableMatrixCell.setId('highlighted') : undefined}
                        key={plan.slug}
                        role='cell'
                        sx={[
                          t => ({
                            display: 'grid',
                            placeContent: 'center',
                            padding: t.space.$3,
                          }),
                          highlight && highlightBackgroundColor,
                        ]}
                      >
                        {hasFeature && (
                          <Icon
                            icon={Check}
                            colorScheme='neutral'
                            size='sm'
                            aria-label='Included'
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns,
              }}
            >
              <Box />
              {plans.map(plan => {
                const highlight = plan.slug === highlightedPlan;
                return (
                  <Box
                    key={plan.slug}
                    sx={[
                      t => ({
                        height: t.space.$10,
                        borderEndStartRadius: t.radii.$xl,
                        borderEndEndRadius: t.radii.$xl,
                      }),
                      highlight && highlightBackgroundColor,
                    ]}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </InternalThemeProvider>
  );
}
