import * as React from 'react';

import { Tooltip } from '@/ui/elements/Tooltip';

import {
  Badge,
  Box,
  Button,
  Col,
  descriptors,
  Icon,
  localizationKeys,
  SimpleButton,
  Span,
  Text,
} from '../../customizables';
import { Checkmark, Plus } from '../../icons';
import { common } from '../../styledSystem';
import { SubscriptionBadge } from '../Subscriptions/badge';
import type { PricingTableCardData } from './pricing-table-card.types';
import { PricingTableCardHeaderView } from './pricing-table-card-header.view';
import { PricingTableSeatCostView } from './pricing-table-seat-cost.view';

export const PricingTableCardView = (props: PricingTableCardData) => {
  return (
    <Box
      key={props.id}
      elementDescriptor={descriptors.pricingTableCard}
      elementId={descriptors.pricingTableCard.setId(props.slug)}
      sx={t => ({
        display: 'grid',
        gap: 0,
        gridTemplateRows: 'subgrid',
        gridRow: 'span 5',
        background: common.mutedBackground(t),
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha150,
        borderRadius: t.radii.$xl,
        overflow: 'hidden',
        textAlign: 'start',
      })}
      data-variant={props.isCompact ? 'compact' : 'default'}
    >
      <PricingTableCardHeaderView
        {...props.header}
        isCompact={props.isCompact}
        planPeriod={props.planPeriod}
        setPlanPeriod={props.setPlanPeriod}
        badge={
          props.subscriptionStatus ? (
            <SubscriptionBadge subscription={{ status: props.subscriptionStatus }} />
          ) : props.highlighted ? (
            <Badge
              elementDescriptor={descriptors.pricingTableCardBadge}
              colorScheme='secondary'
              localizationKey={localizationKeys('billing.highlightedPlanBadge')}
              data-highlighted-plan
            />
          ) : undefined
        }
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
        {(props.ctaPosition === 'bottom' && !props.collapseFeatures) ||
        (props.ctaPosition === 'top' && props.hasFeatures) ? (
          <Box
            elementDescriptor={descriptors.pricingTableCardFeatures}
            sx={t => ({
              display: 'flex',
              flexDirection: 'column',
              flex: '1',
              padding: props.isCompact ? t.space.$3 : t.space.$4,
              backgroundColor: props.hasFeatures || props.hasSeatFeatures ? t.colors.$colorBackground : 'transparent',
              borderTopWidth: props.hasFeatures || props.hasSeatFeatures ? t.borderWidths.$normal : 0,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha150,
            })}
            data-variant={props.isCompact ? 'compact' : 'default'}
          >
            <CardFeaturesList
              features={props.features}
              showSeatCost={props.showSeatCost}
              seatCost={props.seatCost}
              isCompact={props.isCompact}
              hasMoreFeatures={props.hasMoreFeatures}
              showPlanDetails={props.showPlanDetails}
            />
          </Box>
        ) : null}

        {props.shouldShowFooter ? (
          <Box
            elementDescriptor={descriptors.pricingTableCardFooter}
            sx={t => ({
              marginTop: 'auto',
              padding: props.isCompact ? t.space.$3 : t.space.$4,
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha150,
              order: props.ctaPosition === 'top' ? -1 : undefined,
            })}
          >
            {props.shouldShowFooterNotice ? (
              <Text
                elementDescriptor={descriptors.pricingTableCardFooterNotice}
                variant={props.isCompact ? 'buttonSmall' : 'buttonLarge'}
                localizationKey={props.footerNoticeKey || undefined}
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
                    textVariant={props.isCompact ? 'buttonSmall' : 'buttonLarge'}
                    {...props.footerButtonProps}
                    onClick={event => {
                      props.selectPlan(event);
                    }}
                  />
                </Tooltip.Trigger>
                {props.footerButtonTooltipText ? <Tooltip.Content text={props.footerButtonTooltipText} /> : null}
              </Tooltip.Root>
            )}
          </Box>
        ) : (
          <Box
            sx={t => ({
              backgroundColor: props.hasFeatures ? t.colors.$colorBackground : 'transparent',
            })}
          />
        )}
      </Box>
    </Box>
  );
};

interface CardFeaturesListProps {
  features: PricingTableCardData['features'];
  showSeatCost: PricingTableCardData['showSeatCost'];
  seatCost: PricingTableCardData['seatCost'];
  isCompact: boolean;
  hasMoreFeatures: boolean;
  showPlanDetails: PricingTableCardData['showPlanDetails'];
}

const CardFeaturesList = React.forwardRef<HTMLDivElement, CardFeaturesListProps>((props, ref) => {
  const { features, showSeatCost, seatCost, isCompact, hasMoreFeatures, showPlanDetails } = props;
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
        {showSeatCost ? <PricingTableSeatCostView {...seatCost} /> : null}
        {features.map(feature => (
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
              icon={Checkmark}
              colorScheme='neutral'
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
            gap: t.space.$2,
          })}
        >
          <Icon
            icon={Plus}
            colorScheme='neutral'
            aria-hidden
          />
          <Span localizationKey={localizationKeys('billing.seeAllFeatures')} />
        </SimpleButton>
      )}
    </Box>
  );
});
