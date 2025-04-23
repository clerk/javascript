import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_PricingTableProps,
} from '@clerk/types';
import * as React from 'react';

import { usePlansContext } from '../../contexts';
import {
  Badge,
  Box,
  Button,
  descriptors,
  Flex,
  Heading,
  Icon,
  localizationKeys,
  SimpleButton,
  Span,
  Text,
  useAppearance,
} from '../../customizables';
import { Avatar, ReversibleContainer, SegmentedControl } from '../../elements';
import { usePrefersReducedMotion } from '../../hooks';
import { Check, InformationCircle, Minus, Plus } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';
import { common, InternalThemeProvider } from '../../styledSystem';
import { colors } from '../../utils';

interface PricingTableDefaultProps {
  plans?: __experimental_CommercePlanResource[] | null;
  highlightedPlan?: __experimental_CommercePlanResource['slug'];
  planPeriod: __experimental_CommerceSubscriptionPlanPeriod;
  setPlanPeriod: (val: __experimental_CommerceSubscriptionPlanPeriod) => void;
  onSelect: (plan: __experimental_CommercePlanResource) => void;
  isCompact?: boolean;
  props: __experimental_PricingTableProps;
}

export function PricingTableDefault({
  plans,
  planPeriod,
  setPlanPeriod,
  onSelect,
  isCompact,
  props,
}: PricingTableDefaultProps) {
  return (
    <InternalThemeProvider>
      <Box
        elementDescriptor={descriptors.pricingTable}
        sx={t => ({
          // Sets the minimum width a column can be before wrapping
          '--grid-min-size': isCompact ? '11.75rem' : '20rem',
          // Set a max amount of columns before they start wrapping to new rows.
          '--grid-max-columns': 'infinity',
          // Set the default gap, use `--grid-gap-y` to override the row gap
          '--grid-gap': t.space.$4,
          // Derived from the maximum column size based on the grid configuration
          '--max-column-width': '100% / var(--grid-max-columns, infinity) - var(--grid-gap)',
          // Derived from `--max-column-width` and ensures it respects the minimum size and maximum width constraints
          '--column-width': 'max(var(--max-column-width), min(var(--grid-min-size, 10rem), 100%))',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(var(--column-width), 1fr))',
          gap: `var(--grid-gap-y, var(--grid-gap, ${t.space.$4})) var(--grid-gap, ${t.space.$4})`,
          alignItems: 'start',
          width: '100%',
          minWidth: '0',
        })}
        data-variant={isCompact ? 'compact' : 'default'}
      >
        {plans?.map(plan => (
          <Card
            key={plan.id}
            plan={plan}
            planPeriod={planPeriod}
            setPlanPeriod={setPlanPeriod}
            onSelect={onSelect}
            props={props}
            isCompact={isCompact}
          />
        ))}
      </Box>
    </InternalThemeProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Card
 * -----------------------------------------------------------------------------------------------*/

interface CardProps {
  plan: __experimental_CommercePlanResource;
  planPeriod: __experimental_CommerceSubscriptionPlanPeriod;
  setPlanPeriod: (p: __experimental_CommerceSubscriptionPlanPeriod) => void;
  onSelect: (plan: __experimental_CommercePlanResource) => void;
  isCompact?: boolean;
  props: __experimental_PricingTableProps;
}

function Card(props: CardProps) {
  const { plan, planPeriod, setPlanPeriod, onSelect, props: pricingTableProps, isCompact = false } = props;
  const isDefaultLayout = pricingTableProps.layout === 'default';
  const ctaPosition = (isDefaultLayout && pricingTableProps.ctaPosition) || 'top';
  const collapseFeatures = (isDefaultLayout && pricingTableProps.collapseFeatures) || false;
  const { id, slug, isDefault, features } = plan;
  const totalFeatures = features.length;
  const hasFeatures = totalFeatures > 0;

  const { buttonPropsForPlan } = usePlansContext();

  return (
    <Box
      key={id}
      elementDescriptor={descriptors.pricingTableCard}
      elementId={descriptors.pricingTableCard.setId(slug)}
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        background: common.mergedColorsBackground(
          colors.setAlpha(t.colors.$colorBackground, 1),
          t.colors.$neutralAlpha50,
        ),
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$neutralAlpha100,
        boxShadow: !isCompact ? t.shadows.$cardBoxShadow : undefined,
        borderRadius: t.radii.$xl,
        overflow: 'hidden',
        textAlign: 'left',
      })}
      data-variant={isCompact ? 'compact' : 'default'}
    >
      <CardHeader
        plan={plan}
        isCompact={isCompact}
        planPeriod={planPeriod}
        setPlanPeriod={setPlanPeriod}
      />
      <ReversibleContainer reverse={ctaPosition === 'top'}>
        {!collapseFeatures && hasFeatures ? (
          <Box
            elementDescriptor={descriptors.pricingTableCardFeatures}
            sx={t => ({
              display: 'flex',
              flexDirection: 'column',
              flex: '1',
              padding: isCompact ? t.space.$3 : t.space.$4,
              backgroundColor: t.colors.$colorBackground,
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$neutralAlpha100,
            })}
            data-variant={isCompact ? 'compact' : 'default'}
          >
            <CardFeaturesList
              plan={plan}
              isCompact={isCompact}
            />
          </Box>
        ) : null}
        {!isDefault ? (
          <Box
            elementDescriptor={descriptors.pricingTableCardAction}
            sx={t => ({
              marginTop: 'auto',
              padding: isCompact ? t.space.$3 : t.space.$4,
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$neutralAlpha100,
              background: collapseFeatures || !hasFeatures ? t.colors.$colorBackground : undefined,
            })}
          >
            <Button
              block
              textVariant={isCompact ? 'buttonSmall' : 'buttonLarge'}
              {...buttonPropsForPlan({ plan, isCompact })}
              onClick={() => {
                onSelect(plan);
              }}
            />
          </Box>
        ) : null}
      </ReversibleContainer>
    </Box>
  );
}

/* -------------------------------------------------------------------------------------------------
 * CardHeader
 * -----------------------------------------------------------------------------------------------*/

interface CardHeaderProps {
  plan: __experimental_CommercePlanResource;
  isCompact?: boolean;
  planPeriod: __experimental_CommerceSubscriptionPlanPeriod;
  setPlanPeriod: (val: __experimental_CommerceSubscriptionPlanPeriod) => void;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>((props, ref) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedLayout;
  const { plan, isCompact, planPeriod, setPlanPeriod } = props;
  const { name, avatarUrl, annualMonthlyAmount } = plan;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;
  const pricingTableCardFeePeriodNoticeAnimation: ThemableCssProp = t => ({
    transition: isMotionSafe
      ? `grid-template-rows ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}`
      : 'none',
  });
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
      elementDescriptor={descriptors.pricingTableCardHeader}
      sx={t => ({
        width: '100%',
        padding: isCompact ? t.space.$3 : t.space.$4,
      })}
      data-variant={isCompact ? 'compact' : 'default'}
    >
      {avatarUrl || showBadge ? (
        <Box
          elementDescriptor={descriptors.pricingTableCardAvatarBadgeContainer}
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
              boxElementDescriptor={descriptors.pricingTableCardAvatar}
              size={_ => 40}
              title={name}
              initials={name[0]}
              rounded={false}
              imageUrl={avatarUrl}
            />
          ) : null}
          <ReversibleContainer reverse={!avatarUrl}>
            {showBadge ? (
              <Span
                elementDescriptor={descriptors.pricingTableCardBadgeContainer}
                sx={{
                  flexBasis: avatarUrl ? '100%' : undefined,
                }}
              >
                {isImplicitlyActive || subscription?.status === 'active' ? (
                  <Badge
                    elementDescriptor={descriptors.pricingTableCardBadge}
                    localizationKey={localizationKeys('badge__currentPlan')}
                    colorScheme={'secondary'}
                  />
                ) : (
                  <Badge
                    elementDescriptor={descriptors.pricingTableCardBadge}
                    localizationKey={localizationKeys('badge__startsAt', {
                      date: subscription?.periodStart,
                    })}
                    colorScheme={'primary'}
                  />
                )}
              </Span>
            ) : null}
          </ReversibleContainer>
        </Box>
      ) : null}
      <Heading
        elementDescriptor={descriptors.pricingTableCardTitle}
        as='h2'
        textVariant={isCompact ? 'h3' : 'h2'}
      >
        {plan.name}
      </Heading>
      {!isCompact && plan.description ? (
        <Text
          elementDescriptor={descriptors.pricingTableCardDescription}
          variant='subtitle'
          colorScheme='secondary'
        >
          {plan.description}
        </Text>
      ) : null}
      <Flex
        elementDescriptor={descriptors.pricingTableCardFeeContainer}
        data-variant={isCompact ? 'compact' : 'default'}
        align='center'
        wrap='wrap'
        sx={t => ({
          marginTop: isCompact ? t.space.$2 : t.space.$3,
          columnGap: t.space.$1x5,
        })}
      >
        {plan.hasBaseFee ? (
          <>
            <Text
              elementDescriptor={descriptors.pricingTableCardFee}
              variant={isCompact ? 'h2' : 'h1'}
              colorScheme='body'
            >
              {plan.currencySymbol}
              {getPlanFee}
            </Text>
            <Text
              elementDescriptor={descriptors.pricingTableCardFeePeriod}
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
                elementDescriptor={descriptors.pricingTableCardFeePeriodNotice}
                sx={[
                  _ => ({
                    width: '100%',
                    display: 'grid',
                    gridTemplateRows: planPeriod === 'annual' ? '1fr' : '0fr',
                  }),
                  pricingTableCardFeePeriodNoticeAnimation,
                ]}
                // @ts-ignore - Needed until React 19 support
                inert={planPeriod !== 'annual' ? 'true' : undefined}
              >
                <Box
                  elementDescriptor={descriptors.pricingTableCardFeePeriodNoticeInner}
                  sx={{
                    overflow: 'hidden',
                    minHeight: 0,
                  }}
                >
                  <Text
                    elementDescriptor={descriptors.pricingTableCardFeePeriodNoticeLabel}
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
            elementDescriptor={descriptors.pricingTableCardFee}
            variant={isCompact ? 'h2' : 'h1'}
            localizationKey={localizationKeys('__experimental_commerce.free')}
            colorScheme='body'
          />
        )}
      </Flex>
      {plan.hasBaseFee && annualMonthlyAmount > 0 && setPlanPeriod ? (
        <Box
          elementDescriptor={descriptors.pricingTableCardPeriodToggle}
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

/* -------------------------------------------------------------------------------------------------
 * CardFeaturesList
 * -----------------------------------------------------------------------------------------------*/

interface CardFeaturesListProps {
  plan: __experimental_CommercePlanResource;
  /**
   * @default false
   */
  isCompact?: boolean;
}

const CardFeaturesList = React.forwardRef<HTMLDivElement, CardFeaturesListProps>((props, ref) => {
  const { plan, isCompact } = props;
  const totalFeatures = plan.features.length;
  const [showAllFeatures, setShowAllFeatures] = React.useState(false);
  const canToggleFeatures = isCompact && totalFeatures > 3;
  const toggleFeatures = () => {
    setShowAllFeatures(prev => !prev);
  };
  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.pricingTableCardFeatures}
      sx={t => ({
        display: 'grid',
        flex: '1',
        rowGap: isCompact ? t.space.$2 : t.space.$3,
      })}
    >
      <Box
        elementDescriptor={descriptors.pricingTableCardFeaturesList}
        data-variant={isCompact ? 'compact' : 'default'}
        as='ul'
        role='list'
        sx={t => ({
          display: 'grid',
          flex: '1',
          rowGap: isCompact ? t.space.$2 : t.space.$3,
        })}
      >
        {plan.features.slice(0, showAllFeatures || !canToggleFeatures ? totalFeatures : 3).map(feature => (
          <Box
            elementDescriptor={descriptors.pricingTableCardFeaturesListItem}
            elementId={descriptors.pricingTableCardFeaturesListItem.setId(feature.slug)}
            key={feature.id}
            as='li'
            sx={t => ({
              display: 'flex',
              alignItems: 'baseline',
              gap: t.space.$2,
            })}
          >
            <Icon
              icon={Check}
              colorScheme='neutral'
              size='sm'
              aria-hidden
              sx={t => ({
                transform: `translateY(${t.space.$0x25})`,
              })}
            />
            <Span elementDescriptor={descriptors.pricingTableCardFeaturesListItemContent}>
              <Text
                elementDescriptor={descriptors.pricingTableCardFeaturesListItemTitle}
                colorScheme='body'
                sx={t => ({
                  fontWeight: t.fontWeights.$normal,
                })}
              >
                {feature.name}
              </Text>
            </Span>
          </Box>
        ))}
      </Box>
      {canToggleFeatures && (
        <SimpleButton
          onClick={toggleFeatures}
          variant='link'
          sx={t => ({
            marginBlockStart: t.space.$2,
            gap: t.space.$1,
          })}
        >
          <Icon
            icon={showAllFeatures ? Minus : Plus}
            colorScheme='neutral'
            size='md'
            aria-hidden
          />
          {/* TODO(@Commerce): needs localization */}
          {showAllFeatures ? 'Hide features' : 'See all features'}
        </SimpleButton>
      )}
    </Box>
  );
});
