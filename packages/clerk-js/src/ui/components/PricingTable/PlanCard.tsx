import type { __experimental_PricingTableProps, CommercePlanResource } from '@clerk/types';
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
} from '../../customizables';
import { Avatar, SegmentedControl } from '../../elements';
import { Check, InformationCircle } from '../../icons';
import { common } from '../../styledSystem';
import { colors } from '../../utils';

interface PlanCardProps {
  plan: CommercePlanResource;
  period: string;
  setPeriod: (k: string) => void;
  onSelect: (plan: CommercePlanResource) => void;
  isCompact?: boolean;
  props: __experimental_PricingTableProps;
}

export function PlanCard(props: PlanCardProps) {
  const { plan, period, setPeriod, onSelect, props: pricingTableProps, isCompact = false } = props;
  const { ctaPosition = 'top', collapseFeatures = false } = pricingTableProps;
  const totalFeatures = plan.features.length;
  const hasFeatures = totalFeatures > 0;
  const isActivePlan = plan.isActiveForPayer;
  return (
    <Box
      key={plan.id}
      elementDescriptor={[descriptors.planCard, isCompact ? descriptors.planCardCompact : descriptors.planCardDefault]}
      elementId={descriptors.planCard.setId(plan.slug)}
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
    >
      <Box
        elementDescriptor={descriptors.planCardHeader}
        sx={t => ({
          padding: isCompact ? t.space.$3 : t.space.$4,
        })}
      >
        <Flex
          elementDescriptor={descriptors.planCardAvatarContainer}
          align='start'
          justify='between'
          sx={{ width: '100%' }}
        >
          <Avatar
            boxElementDescriptor={descriptors.planCardAvatar}
            size={_ => 40}
            title={plan.name}
            initials={plan.name[0]}
            rounded={false}
            imageUrl={plan.avatarUrl}
          />
          {isActivePlan ? (
            <Badge
              localizationKey={localizationKeys('badge__currentPlan')}
              colorScheme='secondary'
            />
          ) : null}
        </Flex>
        <Heading
          elementDescriptor={descriptors.planCardTitle}
          as='h2'
          textVariant={isCompact ? 'h3' : 'h2'}
          sx={t => ({
            marginTop: t.space.$3,
          })}
        >
          {plan.name}
        </Heading>
        {!isCompact && plan.description ? (
          <Text
            elementDescriptor={descriptors.planCardDescription}
            variant='subtitle'
            colorScheme='secondary'
          >
            {plan.description}
          </Text>
        ) : null}
        <Flex
          elementDescriptor={descriptors.planCardFeeContainer}
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
                elementDescriptor={descriptors.planCardFee}
                variant={isCompact ? 'h2' : 'h1'}
                colorScheme='body'
              >
                {plan.currencySymbol}
                {period === 'month' ? plan.amountFormatted : plan.annualMonthlyAmountFormatted}
              </Text>
              <Text
                elementDescriptor={descriptors.planCardFeePeriod}
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
              <Box
                elementDescriptor={descriptors.planCardFeePeriodNotice}
                sx={t => ({
                  width: '100%',
                  display: 'grid',
                  gridTemplateRows: period === 'annual' ? '1fr' : '0fr',
                  transition: `grid-template-rows ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}`,
                })}
                // @ts-ignore - Needed until React 19 support
                inert={period !== 'annual' ? 'true' : undefined}
              >
                <Box
                  elementDescriptor={descriptors.planCardFeePeriodNoticeInner}
                  sx={{
                    overflow: 'hidden',
                    minHeight: 0,
                  }}
                >
                  <Text
                    elementDescriptor={descriptors.planCardFeePeriodNoticeLabel}
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
                    <Span localizationKey={localizationKeys('commerce.billedAnnually')} />
                  </Text>
                </Box>
              </Box>
            </>
          ) : (
            <Text
              elementDescriptor={descriptors.planCardFee}
              variant={isCompact ? 'h2' : 'h1'}
              localizationKey={localizationKeys('commerce.free')}
              colorScheme='body'
            />
          )}
        </Flex>
        {plan.hasBaseFee ? (
          <Box
            elementDescriptor={descriptors.planCardPeriodToggle}
            sx={t => ({
              display: 'flex',
              marginTop: t.space.$3,
            })}
          >
            <SegmentedControl.Root
              aria-label='Set pay period'
              value={period}
              onChange={setPeriod}
            >
              <SegmentedControl.Button value='month'>Monthly</SegmentedControl.Button>
              <SegmentedControl.Button value='annual'>Annually</SegmentedControl.Button>
            </SegmentedControl.Root>
          </Box>
        ) : null}
      </Box>
      <ReversibleContainer reverse={ctaPosition === 'top'}>
        {!collapseFeatures && hasFeatures ? (
          <Box
            elementDescriptor={descriptors.planCardFeatures}
            sx={t => ({
              display: 'flex',
              flex: '1',
              padding: isCompact ? t.space.$3 : t.space.$4,
              backgroundColor: t.colors.$colorBackground,
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$neutralAlpha100,
            })}
          >
            <Box
              elementDescriptor={descriptors.planCardFeaturesList}
              as='ul'
              role='list'
              sx={t => ({
                display: 'grid',
                flex: '1',
                rowGap: isCompact ? t.space.$2 : t.space.$3,
                maskImage: isCompact && totalFeatures >= 3 ? 'linear-gradient(rgba(0,0,0,1), transparent)' : undefined,
              })}
            >
              {plan.features.slice(0, isCompact ? 3 : plan.features.length).map(feature => (
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
                      aria-hidden
                    />
                    <Text colorScheme='body'>{feature.description || feature.name}</Text>
                  </Flex>
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}
        <Box
          elementDescriptor={descriptors.planCardAction}
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
            variant={isCompact ? 'bordered' : 'solid'}
            colorScheme={isCompact ? 'secondary' : 'primary'}
            localizationKey={
              isActivePlan ? localizationKeys('commerce.manageMembership') : localizationKeys('commerce.getStarted')
            }
            onClick={() => onSelect(plan)}
          />
        </Box>
      </ReversibleContainer>
    </Box>
  );
}

function ReversibleContainer(props: React.PropsWithChildren<{ reverse?: boolean }>) {
  const { children, reverse } = props;
  return <>{reverse ? React.Children.toArray(children).reverse() : children}</>;
}
