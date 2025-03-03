import type { __experimental_PricingTableProps, CommercePlanResource } from '@clerk/types';

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
  props: __experimental_PricingTableProps;
}

export function PlanCard(props: PlanCardProps) {
  const { plan, period, setPeriod, onSelect } = props;
  const isActivePlan = plan.isActiveForPayer;
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
        elementDescriptor={descriptors.planCardHeader}
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
        <Box>
          <Heading elementDescriptor={descriptors.planCardTitle}>{plan.name}</Heading>
          <Text
            elementDescriptor={descriptors.planCardDescription}
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
                {period === 'month' ? plan.amountFormatted : plan.annualMonthlyAmountFormatted}
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
      <Box
        elementDescriptor={descriptors.planCardFeatures}
        sx={t => ({
          background: hasFeatures
            ? 'transparent'
            : common.mergedColorsBackground(colors.setAlpha(t.colors.$colorBackground, 1), t.colors.$neutralAlpha50),
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
        <Button
          block
          localizationKey={
            isActivePlan ? localizationKeys('commerce_manageMembership') : localizationKeys('commerce_getStarted')
          }
          onClick={() => onSelect(plan)}
        />
      </Box>
    </Box>
  );
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
