import type { __experimental_PricingTableProps, CommercePlanResource } from '@clerk/types';
import * as React from 'react';

import { Badge, Box, Button, descriptors, Flex, Heading, Icon, localizationKeys, Text } from '../../customizables';
import { Avatar } from '../../elements';
import { Check } from '../../icons';
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
  const { ctaPosition = 'bottom', collapseFeatures = false } = pricingTableProps;
  const hasFeatures = plan.features.length > 0;
  const isActivePlan = plan.isActiveForPayer;
  return (
    <Box
      key={plan.id}
      elementDescriptor={descriptors.planCard}
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
        boxShadow: t.shadows.$cardBoxShadow,
        borderRadius: t.radii.$xl,
        overflow: 'hidden',
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
              sx={t => ({
                backgroundColor: t.colors.$primary500,
                color: t.colors.$white,
              })}
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
        {!isCompact ? (
          <Text
            elementDescriptor={descriptors.planCardDescription}
            variant='subtitle'
            colorScheme='secondary'
            aria-hidden={plan.description ? undefined : 'true'}
          >
            {plan.description ? plan.description : '\u00A0'}
          </Text>
        ) : null}
        <Flex
          elementDescriptor={descriptors.planCardFeeContainer}
          gap={2}
          align='center'
          sx={t => ({
            marginTop: t.space.$3,
          })}
        >
          {plan.hasBaseFee ? (
            <>
              <Text
                elementDescriptor={descriptors.planCardFee}
                variant={isCompact ? 'h2' : 'h1'}
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
                localizationKey={localizationKeys('commerce_month')}
              />
            </>
          ) : (
            <Text
              elementDescriptor={descriptors.planCardFee}
              variant={isCompact ? 'h2' : 'h1'}
              localizationKey={localizationKeys('commerce_free')}
            />
          )}
        </Flex>
        <Box
          elementDescriptor={descriptors.planCardPeriodToggle}
          sx={t => ({
            display: 'flex',
            minHeight: t.space.$6,
            marginTop: t.space.$3,
          })}
        >
          {plan.hasBaseFee ? (
            <SegmentedControl
              selected={period}
              setSelected={setPeriod}
              options={[
                { label: 'Monthly', value: 'month' },
                { label: 'Annually', value: 'annual' },
              ]}
            />
          ) : null}
        </Box>
      </Box>
      <ReversibleContainer reverse={ctaPosition === 'top'}>
        {!collapseFeatures && hasFeatures ? (
          <Box
            elementDescriptor={descriptors.planCardFeatures}
            sx={t => ({
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
              sx={t => ({
                display: 'grid',
                rowGap: isCompact ? t.space.$2 : t.space.$3,
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
            size={isCompact ? 'xs' : 'sm'}
            localizationKey={
              isActivePlan ? localizationKeys('commerce_manageMembership') : localizationKeys('commerce_getStarted')
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
