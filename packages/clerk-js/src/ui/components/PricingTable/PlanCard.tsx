import type { __experimental_CommercePlanResource, __experimental_PricingTableProps } from '@clerk/types';
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
  SimpleButton,
  Span,
  Text,
  useAppearance,
} from '../../customizables';
import { Avatar, SegmentedControl } from '../../elements';
import { usePrefersReducedMotion } from '../../hooks';
import { Check, InformationCircle, Minus, Plus } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';
import { common } from '../../styledSystem';
import { colors } from '../../utils';

interface PlanCardProps {
  plan: __experimental_CommercePlanResource;
  period: string;
  setPeriod: (k: string) => void;
  onSelect: (plan: __experimental_CommercePlanResource) => void;
  isCompact?: boolean;
  props: __experimental_PricingTableProps;
}

export function PlanCard(props: PlanCardProps) {
  const { plan, period, setPeriod, onSelect, props: pricingTableProps, isCompact = false } = props;
  const { ctaPosition = 'top', collapseFeatures = false } = pricingTableProps;
  const [showAllFeatures, setShowAllFeatures] = React.useState(false);
  const totalFeatures = plan.features.length;
  const hasFeatures = totalFeatures > 0;
  const canToggleFeatures = isCompact && totalFeatures > 3;
  const isActivePlan = plan.isActiveForPayer;
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: appearanceAnimations } = useAppearance().parsedLayout;
  const planCardFeePeriodNoticeAnimation: ThemableCssProp = t => ({
    transition:
      appearanceAnimations && !prefersReducedMotion
        ? `grid-template-rows ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}`
        : 'none',
  });

  const toggleFeatures = () => {
    setShowAllFeatures(prev => !prev);
  };

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
                localizationKey={localizationKeys('__experimental_commerce.month')}
              />
              <Box
                elementDescriptor={descriptors.planCardFeePeriodNotice}
                sx={[
                  _ => ({
                    width: '100%',
                    display: 'grid',
                    gridTemplateRows: period === 'annual' ? '1fr' : '0fr',
                  }),
                  planCardFeePeriodNoticeAnimation,
                ]}
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
                    <Span localizationKey={localizationKeys('__experimental_commerce.billedAnnually')} />
                  </Text>
                </Box>
              </Box>
            </>
          ) : (
            <Text
              elementDescriptor={descriptors.planCardFee}
              variant={isCompact ? 'h2' : 'h1'}
              localizationKey={localizationKeys('__experimental_commerce.free')}
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
              flexDirection: 'column',
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
              })}
            >
              {plan.features.slice(0, showAllFeatures ? totalFeatures : 3).map(feature => (
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
                {showAllFeatures ? 'Hide features' : 'See all features'}
              </SimpleButton>
            )}
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
            variant={isActivePlan ? 'bordered' : 'solid'}
            colorScheme={isActivePlan ? 'secondary' : 'primary'}
            localizationKey={
              isActivePlan
                ? localizationKeys('__experimental_commerce.manageMembership')
                : localizationKeys('__experimental_commerce.getStarted')
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
