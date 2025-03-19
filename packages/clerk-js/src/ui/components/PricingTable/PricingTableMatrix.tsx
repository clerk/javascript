import type { __experimental_CommercePlanResource } from '@clerk/types';
import * as React from 'react';

import {
  Badge,
  Box,
  Button,
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
import type { ThemableCssProp } from '../../styledSystem';
import type { PlanPeriod } from './PlanCard';

interface PricingTableMatrixProps {
  plans?: __experimental_CommercePlanResource[] | null;
  planPeriod: PlanPeriod;
  setPlanPeriod: (val: PlanPeriod) => void;
}

export function PricingTableMatrix({ plans, planPeriod, setPlanPeriod }: PricingTableMatrixProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedLayout;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;
  const planCardFeePeriodNoticeAnimation: ThemableCssProp = t => ({
    transition: isMotionSafe
      ? `grid-template-rows ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}`
      : 'none',
  });

  if (!plans) {
    return null;
  }

  const getAllFeatures = (plans: __experimental_CommercePlanResource[]) => {
    const featuresSet = new Set<string>();
    plans.forEach(plan => {
      plan.features.forEach(feature => featuresSet.add(feature.name));
    });
    return Array.from(featuresSet);
  };

  return (
    <Box
      role='table'
      sx={{
        isolation: 'isolate',
        // overflowX: 'auto'
      }}
    >
      <Box
        role='rowgroup'
        sx={t => ({
          position: 'sticky',
          top: 0,
          backgroundColor: t.colors.$colorBackground,
          borderBottomWidth: t.borderWidths.$normal,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$neutralAlpha100,
        })}
      >
        <Box
          role='row'
          sx={_ => ({
            display: 'grid',
            gridTemplateColumns: `repeat(${plans.length + 1}, minmax(12.5rem,31.25rem))`,
          })}
        >
          <Box
            role='columnheader'
            sx={t => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              rowGap: t.space.$3,
              paddingBlockEnd: t.space.$12,
            })}
          >
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
          </Box>
          {plans?.map(plan => {
            const highlight = plan.slug === 'basic';
            const planFee =
              plan.annualMonthlyAmount <= 0
                ? plan.amountFormatted
                : planPeriod === 'annual'
                  ? plan.annualMonthlyAmountFormatted
                  : plan.amountFormatted;

            return (
              <Box
                key={plan.slug}
                role='columnheader'
                sx={t => ({
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  flex: 1,
                  borderStartStartRadius: t.radii.$xl,
                  borderStartEndRadius: t.radii.$xl,
                  ...(highlight && {
                    backgroundColor: t.colors.$neutralAlpha25,
                  }),
                })}
              >
                <Box
                  sx={t => ({
                    width: '100%',
                    padding: t.space.$4,
                  })}
                >
                  <Span
                    sx={t => ({
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBlockEnd: t.space.$3,
                    })}
                  >
                    <Avatar
                      size={_ => 40}
                      title={plan.name}
                      initials={plan.name[0]}
                      rounded={false}
                      imageUrl={plan.avatarUrl}
                    />
                    {highlight ? <Badge colorScheme='secondary'>Popular</Badge> : null}
                  </Span>
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
                                <Span localizationKey={localizationKeys('__experimental_commerce.billedAnnually')} />
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
                  >
                    Get started
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
      <Box role='rowgroup'>
        {[
          ...getAllFeatures(plans),
          ...getAllFeatures(plans),
          ...getAllFeatures(plans),
          ...getAllFeatures(plans),
          ...getAllFeatures(plans),
          ...getAllFeatures(plans),
        ].map((f, i) => {
          const renderFeatureSetHeader = i % 6 === 0; // Render header every 6 rows
          return (
            <React.Fragment key={f}>
              {renderFeatureSetHeader ? (
                <Box
                  sx={t => ({
                    // position: 'sticky',
                    // top: height,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${plans.length + 1}, minmax(12.5rem,31.25rem))`,
                    borderBottomWidth: t.borderWidths.$normal,
                    borderBottomStyle: t.borderStyles.$solid,
                    borderBottomColor: t.colors.$neutralAlpha100,
                    backgroundColor: t.colors.$colorBackground,
                  })}
                >
                  <Box
                    sx={t => ({
                      paddingInline: t.space.$3,
                      paddingBlockStart: t.space.$8,
                      paddingBlockEnd: t.space.$3,
                    })}
                  >
                    <Text variant='h3'>Feature set</Text>
                  </Box>
                  {plans.map(plan => {
                    const highlight = plan.slug === 'basic';
                    return (
                      <Box
                        key={plan.slug}
                        sx={t => ({
                          display: 'grid',
                          placeContent: 'center',
                          padding: t.space.$3,
                          ...(highlight && {
                            backgroundColor: t.colors.$neutralAlpha25,
                          }),
                        })}
                      />
                    );
                  })}
                </Box>
              ) : null}
              <Box
                role='row'
                sx={t => ({
                  display: 'grid',
                  gridTemplateColumns: `repeat(${plans.length + 1}, minmax(12.5rem,31.25rem))`,
                  borderBottomWidth: t.borderWidths.$normal,
                  borderBottomStyle: t.borderStyles.$solid,
                  borderBottomColor: t.colors.$neutralAlpha100,
                  ':hover': {
                    backgroundColor: t.colors.$neutralAlpha25,
                  },
                })}
              >
                <Box
                  role='cell'
                  sx={t => ({
                    padding: t.space.$3,
                  })}
                >
                  <Text colorScheme='body'>{f}</Text>
                </Box>
                {plans.map(plan => {
                  const highlight = plan.slug === 'basic';
                  const hasFeature = plan.features.some(feature => feature.name === f);
                  return (
                    <Box
                      key={plan.slug}
                      role='cell'
                      sx={t => ({
                        display: 'grid',
                        placeContent: 'center',
                        padding: t.space.$3,
                        ...(highlight && {
                          backgroundColor: t.colors.$neutralAlpha25,
                        }),
                      })}
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
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
}

// function useMeasure() {
//   const [dimensions, setDimensions] = React.useState({
//     width: null,
//     height: null,
//   });

//   const previousObserver = React.useRef(null);

//   const customRef = React.useCallback((node) => {
//     if (previousObserver.current) {
//       previousObserver.current.disconnect();
//       previousObserver.current = null;
//     }

//     if (node?.nodeType === Node.ELEMENT_NODE) {
//       const observer = new ResizeObserver(([entry]) => {
//         if (entry && entry.borderBoxSize) {
//           const { inlineSize: width, blockSize: height } =
//             entry.borderBoxSize[0];

//           setDimensions({ width, height });
//         }
//       });

//       observer.observe(node);
//       previousObserver.current = observer;
//     }
//   }, []);

//   return [customRef, dimensions];
// }
