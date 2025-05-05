import { useClerk } from '@clerk/shared/react';
import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_PricingTableProps,
} from '@clerk/types';
import * as React from 'react';

import { usePlansContext, usePricingTableContext, useSubscriberTypeContext } from '../../contexts';
import {
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Heading,
  Icon,
  localizationKeys,
  SimpleButton,
  Span,
  Text,
} from '../../customizables';
import { Switch } from '../../elements';
import { Check, Plus } from '../../icons';
import { common, InternalThemeProvider } from '../../styledSystem';
import { colors, getClosestProfileScrollBox } from '../../utils';
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
          gridTemplateRows: 'auto 1fr',
          gap: `var(--grid-gap-y, var(--grid-gap, ${t.space.$4})) var(--grid-gap, ${t.space.$4})`,
          alignItems: 'stretch',
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
  onSelect: (plan: __experimental_CommercePlanResource, event?: React.MouseEvent<HTMLElement>) => void;
  isCompact?: boolean;
  props: __experimental_PricingTableProps;
}

function Card(props: CardProps) {
  const { plan, planPeriod, setPlanPeriod, onSelect, props: pricingTableProps, isCompact = false } = props;
  const clerk = useClerk();
  const { mode = 'mounted', ctaPosition: ctxCtaPosition } = usePricingTableContext();
  const subscriberType = useSubscriberTypeContext();

  const ctaPosition = pricingTableProps.ctaPosition || ctxCtaPosition || 'bottom';
  const collapseFeatures = pricingTableProps.collapseFeatures || false;
  const { id, slug } = plan;

  const { buttonPropsForPlan, isDefaultPlanImplicitlyActiveOrUpcoming, activeOrUpcomingSubscription, subscriptions } =
    usePlansContext();

  const subscription = activeOrUpcomingSubscription(plan);
  const isImplicitlyActiveOrUpcoming = isDefaultPlanImplicitlyActiveOrUpcoming && plan.isDefault;

  const showStatusRow = !!subscription || isImplicitlyActiveOrUpcoming;

  const showPlanDetails = (event?: React.MouseEvent<HTMLElement>) => {
    const portalRoot = getClosestProfileScrollBox(mode, event);

    clerk.__internal_openPlanDetails({
      plan,
      subscriberType,
      planPeriod,
      portalRoot,
    });
  };

  return (
    <Box
      key={id}
      elementDescriptor={descriptors.pricingTableCard}
      elementId={descriptors.pricingTableCard.setId(slug)}
      sx={t => ({
        display: 'grid',
        gap: 0,
        gridTemplateRows: 'subgrid',
        gridRow: 'span 4',
        background: common.mergedColorsBackground(
          colors.setAlpha(t.colors.$colorBackground, 1),
          t.colors.$neutralAlpha50,
        ),
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$neutralAlpha100,
        boxShadow: !isCompact ? t.shadows.$cardBoxShadow : t.shadows.$tableBodyShadow,
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {!collapseFeatures ? (
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
              showPlanDetails={showPlanDetails}
            />
          </Box>
        ) : null}

        {showStatusRow && (
          <Box
            sx={t => ({
              padding: t.space.$1,
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$neutralAlpha100,
            })}
          >
            {subscription?.status === 'active' || (isImplicitlyActiveOrUpcoming && subscriptions.length === 0) ? (
              <Text
                elementDescriptor={descriptors.pricingTableCardBadge}
                variant='caption'
                colorScheme='body'
                localizationKey={localizationKeys('badge__currentPlan')}
                sx={{ textAlign: 'center' }}
              />
            ) : (
              <Text
                elementDescriptor={descriptors.pricingTableCardBadge}
                variant='caption'
                colorScheme='body'
                localizationKey={
                  subscription
                    ? localizationKeys('badge__startsAt', {
                        date: subscription.periodStart,
                      })
                    : localizationKeys('badge__upcomingPlan')
                }
                sx={{ textAlign: 'center' }}
              />
            )}
          </Box>
        )}

        {(!plan.isDefault || !isDefaultPlanImplicitlyActiveOrUpcoming) && (
          <Box
            elementDescriptor={descriptors.pricingTableCardAction}
            sx={t => ({
              marginTop: 'auto',
              padding: isCompact ? t.space.$3 : t.space.$4,
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$neutralAlpha100,
              background: undefined,
              order: ctaPosition === 'top' ? -1 : undefined,
            })}
          >
            <Button
              block
              textVariant={isCompact ? 'buttonSmall' : 'buttonLarge'}
              {...buttonPropsForPlan({ plan, isCompact })}
              onClick={event => {
                onSelect(plan, event);
              }}
            />
          </Box>
        )}
      </Box>
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
  const { plan, isCompact, planPeriod, setPlanPeriod } = props;
  const { name, annualMonthlyAmount } = plan;

  const getPlanFee = React.useMemo(() => {
    if (annualMonthlyAmount <= 0) {
      return plan.amountFormatted;
    }
    return planPeriod === 'annual' ? plan.annualMonthlyAmountFormatted : plan.amountFormatted;
  }, [annualMonthlyAmount, planPeriod, plan.amountFormatted, plan.annualMonthlyAmountFormatted]);

  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.pricingTableCardHeader}
      sx={t => ({
        width: '100%',
        padding: isCompact ? t.space.$3 : t.space.$4,
        display: 'grid',
        gap: t.space.$1,
        gridRow: 'span 3',
        gridTemplateRows: 'subgrid',
      })}
      data-variant={isCompact ? 'compact' : 'default'}
    >
      <Box>
        <Heading
          elementDescriptor={descriptors.pricingTableCardTitle}
          as='h2'
          textVariant={isCompact ? 'h3' : 'h2'}
        >
          {name}
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
      </Box>

      <Flex
        elementDescriptor={descriptors.pricingTableCardFeeContainer}
        data-variant={isCompact ? 'compact' : 'default'}
        align='center'
        wrap='wrap'
        sx={t => ({
          columnGap: t.space.$1,
          marginTop: t.space.$1,
        })}
      >
        <Text
          elementDescriptor={descriptors.pricingTableCardFee}
          variant={isCompact ? 'h2' : 'h1'}
          colorScheme='body'
        >
          {plan.currencySymbol}
          {getPlanFee}
        </Text>
        {!plan.isDefault ? (
          <Text
            elementDescriptor={descriptors.pricingTableCardFeePeriod}
            variant='caption'
            colorScheme='secondary'
            sx={t => ({
              textTransform: 'lowercase',
              ':before': {
                content: '"/"',
                marginInlineEnd: t.space.$0x25,
              },
            })}
            localizationKey={localizationKeys('__experimental_commerce.month')}
          />
        ) : null}
      </Flex>

      {annualMonthlyAmount > 0 && setPlanPeriod ? (
        <Box
          elementDescriptor={descriptors.pricingTableCardPeriodToggle}
          sx={t => ({
            marginTop: t.space.$1,
          })}
        >
          <Switch
            checked={planPeriod === 'annual'}
            onChange={(checked: boolean) => setPlanPeriod(checked ? 'annual' : 'month')}
            title={localizationKeys('__experimental_commerce.billedAnnually')}
          />
        </Box>
      ) : (
        <Text
          elementDescriptor={descriptors.pricingTableCardFeePeriodNotice}
          variant='caption'
          colorScheme='secondary'
          localizationKey={
            plan.isDefault
              ? localizationKeys('__experimental_commerce.alwaysFree')
              : localizationKeys('__experimental_commerce.billedMonthlyOnly')
          }
          sx={{
            alignSelf: 'center',
          }}
        />
      )}
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
  showPlanDetails: (event?: React.MouseEvent<HTMLElement>) => void;
}

const CardFeaturesList = React.forwardRef<HTMLDivElement, CardFeaturesListProps>((props, ref) => {
  const { plan, isCompact, showPlanDetails } = props;

  const totalFeatures = plan.features.length;
  const hasMoreFeatures = isCompact ? totalFeatures > 3 : totalFeatures > 8;

  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.pricingTableCardFeatures}
      sx={t => ({
        display: 'grid',
        flex: 1,
        rowGap: isCompact ? t.space.$2 : t.space.$3,
      })}
    >
      <Col
        elementDescriptor={descriptors.pricingTableCardFeaturesList}
        data-variant={isCompact ? 'compact' : 'default'}
        as='ul'
        role='list'
        sx={t => ({
          flex: '1',
          rowGap: isCompact ? t.space.$2 : t.space.$3,
          margin: 0,
          padding: 0,
        })}
      >
        {plan.features.slice(0, hasMoreFeatures ? (isCompact ? 3 : 8) : totalFeatures).map(feature => (
          <Box
            elementDescriptor={descriptors.pricingTableCardFeaturesListItem}
            elementId={descriptors.pricingTableCardFeaturesListItem.setId(feature.slug)}
            key={feature.id}
            as='li'
            sx={t => ({
              display: 'flex',
              alignItems: 'baseline',
              gap: t.space.$2,
              margin: 0,
              padding: 0,
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
      </Col>
      {hasMoreFeatures && (
        <SimpleButton
          onClick={event => showPlanDetails(event)}
          variant='link'
          sx={t => ({
            marginBlockStart: 'auto',
            paddingBlockStart: t.space.$2,
            gap: t.space.$1,
          })}
        >
          <Icon
            icon={Plus}
            colorScheme='neutral'
            size='md'
            aria-hidden
          />
          <Span localizationKey={localizationKeys('__experimental_commerce.seeAllFeatures')} />
        </SimpleButton>
      )}
    </Box>
  );
});
