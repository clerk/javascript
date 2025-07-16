import { useClerk, useSession } from '@clerk/shared/react';
import type { CommercePlanResource, CommerceSubscriptionPlanPeriod, PricingTableProps } from '@clerk/types';
import * as React from 'react';

import { Switch } from '@/ui/elements/Switch';
import { Tooltip } from '@/ui/elements/Tooltip';
import { getClosestProfileScrollBox } from '@/ui/utils/getClosestProfileScrollBox';

import { useProtect } from '../../common';
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
import { Check, Plus } from '../../icons';
import { common, InternalThemeProvider } from '../../styledSystem';
import { SubscriptionBadge } from '../Subscriptions/badge';

interface PricingTableDefaultProps {
  plans?: CommercePlanResource[] | null;
  highlightedPlan?: CommercePlanResource['slug'];
  planPeriod: CommerceSubscriptionPlanPeriod;
  setPlanPeriod: (val: CommerceSubscriptionPlanPeriod) => void;
  onSelect: (plan: CommercePlanResource) => void;
  isCompact?: boolean;
  props: PricingTableProps;
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
  plan: CommercePlanResource;
  planPeriod: CommerceSubscriptionPlanPeriod;
  setPlanPeriod: (p: CommerceSubscriptionPlanPeriod) => void;
  onSelect: (plan: CommercePlanResource, event?: React.MouseEvent<HTMLElement>) => void;
  isCompact?: boolean;
  props: PricingTableProps;
}

function Card(props: CardProps) {
  const { plan, planPeriod, setPlanPeriod, onSelect, props: pricingTableProps, isCompact = false } = props;
  const clerk = useClerk();
  const { isSignedIn } = useSession();
  const { mode = 'mounted', ctaPosition: ctxCtaPosition } = usePricingTableContext();
  const subscriberType = useSubscriberTypeContext();

  const ctaPosition = pricingTableProps.ctaPosition || ctxCtaPosition || 'bottom';
  const collapseFeatures = pricingTableProps.collapseFeatures || false;
  const { id, slug } = plan;

  const canManageBilling = useProtect(
    has => has({ permission: 'org:sys_billing:manage' }) || subscriberType === 'user',
  );
  const { buttonPropsForPlan, activeOrUpcomingSubscriptionBasedOnPlanPeriod } = usePlansContext();

  const showPlanDetails = (event?: React.MouseEvent<HTMLElement>) => {
    const portalRoot = getClosestProfileScrollBox(mode, event);

    clerk.__internal_openPlanDetails({
      plan,
      initialPlanPeriod: planPeriod,
      portalRoot,
    });
  };

  const subscription = React.useMemo(
    () => activeOrUpcomingSubscriptionBasedOnPlanPeriod(plan, planPeriod),
    [plan, planPeriod, activeOrUpcomingSubscriptionBasedOnPlanPeriod],
  );

  const hasFeatures = plan.features.length > 0;
  const showStatusRow = !!subscription;

  let shouldShowFooter = false;
  let shouldShowFooterNotice = false;

  if (!subscription) {
    shouldShowFooter = true;
    shouldShowFooterNotice = false;
  } else if (subscription.status === 'upcoming') {
    shouldShowFooter = true;
    shouldShowFooterNotice = true;
  } else if (subscription.status === 'active') {
    if (subscription.canceledAtDate) {
      shouldShowFooter = true;
      shouldShowFooterNotice = false;
    } else if (planPeriod !== subscription.planPeriod && plan.annualMonthlyAmount > 0) {
      shouldShowFooter = true;
      shouldShowFooterNotice = false;
    } else {
      shouldShowFooter = false;
      shouldShowFooterNotice = false;
    }
  } else {
    shouldShowFooter = false;
    shouldShowFooterNotice = false;
  }

  return (
    <Box
      key={id}
      elementDescriptor={descriptors.pricingTableCard}
      elementId={descriptors.pricingTableCard.setId(slug)}
      sx={t => ({
        display: 'grid',
        gap: 0,
        gridTemplateRows: 'subgrid',
        gridRow: 'span 5',
        background: common.mutedBackground(t),
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha100,
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
        badge={showStatusRow ? <SubscriptionBadge subscription={subscription} /> : undefined}
      />
      <Box
        elementDescriptor={descriptors.pricingTableCardBody}
        sx={{
          display: 'grid',
          gridTemplateRows: 'subgrid',
          gridRow: 'span 2',
          gap: 0,
        }}
      >
        {(ctaPosition === 'bottom' && !collapseFeatures) || (ctaPosition === 'top' && hasFeatures) ? (
          <Box
            elementDescriptor={descriptors.pricingTableCardFeatures}
            sx={t => ({
              // gridRow: shouldShowFooter ? 'auto' : 'span 2',
              display: 'flex',
              flexDirection: 'column',
              flex: '1',
              padding: isCompact ? t.space.$3 : t.space.$4,
              backgroundColor: hasFeatures ? t.colors.$colorBackground : 'transparent',
              borderTopWidth: hasFeatures ? t.borderWidths.$normal : 0,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha100,
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

        {shouldShowFooter ? (
          <Box
            elementDescriptor={descriptors.pricingTableCardFooter}
            sx={t => ({
              marginTop: 'auto',
              padding: isCompact ? t.space.$3 : t.space.$4,
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha100,
              order: ctaPosition === 'top' ? -1 : undefined,
            })}
          >
            {shouldShowFooterNotice && subscription ? (
              <Text
                elementDescriptor={descriptors.pricingTableCardFooterNotice}
                variant={isCompact ? 'buttonSmall' : 'buttonLarge'}
                localizationKey={localizationKeys('badge__startsAt', {
                  date: subscription?.periodStartDate,
                })}
                colorScheme='secondary'
                sx={t => ({
                  paddingBlock: t.space.$1x5,
                  textAlign: 'center',
                })}
              />
            ) : (
              <Tooltip.Root>
                <Tooltip.Trigger sx={{ width: '100%' }}>
                  <Button
                    elementDescriptor={descriptors.pricingTableCardFooterButton}
                    block
                    textVariant={isCompact ? 'buttonSmall' : 'buttonLarge'}
                    {...buttonPropsForPlan({ plan, isCompact, selectedPlanPeriod: planPeriod })}
                    onClick={event => {
                      onSelect(plan, event);
                    }}
                  />
                </Tooltip.Trigger>
                {isSignedIn && !canManageBilling && (
                  <Tooltip.Content
                    text={localizationKeys('organizationProfile.plansPage.alerts.noPermissionsToManageBilling')}
                  />
                )}
              </Tooltip.Root>
            )}
          </Box>
        ) : (
          <Box
            sx={t => ({
              backgroundColor: hasFeatures ? t.colors.$colorBackground : 'transparent',
            })}
          />
        )}
      </Box>
    </Box>
  );
}

/* -------------------------------------------------------------------------------------------------
 * CardHeader
 * -----------------------------------------------------------------------------------------------*/

interface CardHeaderProps {
  plan: CommercePlanResource;
  isCompact?: boolean;
  planPeriod: CommerceSubscriptionPlanPeriod;
  setPlanPeriod: (val: CommerceSubscriptionPlanPeriod) => void;
  badge?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>((props, ref) => {
  const { plan, isCompact, planPeriod, setPlanPeriod, badge } = props;
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
      <Box elementDescriptor={descriptors.pricingTableCardTitleContainer}>
        <Box
          sx={t => ({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: t.space.$0x25,
          })}
        >
          <Heading
            elementDescriptor={descriptors.pricingTableCardTitle}
            as='h2'
            textVariant={isCompact ? 'h3' : 'h2'}
          >
            {name}
          </Heading>
          {badge && badge}
        </Box>
        {!isCompact && plan.description ? (
          <Text
            elementDescriptor={descriptors.pricingTableCardDescription}
            variant='subtitle'
            colorScheme='secondary'
            sx={{
              justifySelf: 'flex-start',
            }}
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
            localizationKey={localizationKeys('commerce.month')}
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
            marginTop: t.space.$1,
          })}
        />
      )}
    </Box>
  );
});

/* -------------------------------------------------------------------------------------------------
 * CardFeaturesList
 * -----------------------------------------------------------------------------------------------*/

interface CardFeaturesListProps {
  plan: CommercePlanResource;
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
            paddingBlock: t.space.$1,
            gap: t.space.$1,
          })}
        >
          <Icon
            icon={Plus}
            colorScheme='neutral'
            size='md'
            aria-hidden
          />
          <Span localizationKey={localizationKeys('commerce.seeAllFeatures')} />
        </SimpleButton>
      )}
    </Box>
  );
});
