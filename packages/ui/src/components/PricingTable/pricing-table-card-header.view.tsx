import * as React from 'react';

import { Switch } from '@/ui/elements/Switch';

import { Box, descriptors, Flex, Heading, localizationKeys, Text } from '../../customizables';
import type { PricingTableCardHeaderProps } from './pricing-table-card.types';

export const PricingTableCardHeaderView = React.forwardRef<HTMLDivElement, PricingTableCardHeaderProps>(
  (props, ref) => {
    const { isCompact, planPeriod, setPlanPeriod, badge } = props;

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
              {props.name}
            </Heading>
            {badge && badge}
          </Box>
          {!isCompact && props.description ? (
            <Text
              elementDescriptor={descriptors.pricingTableCardDescription}
              variant='subtitle'
              colorScheme='secondary'
              sx={{
                justifySelf: 'flex-start',
              }}
            >
              {props.description}
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
            {props.feeFormatted}
          </Text>
          {!props.isDefault ? (
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
              localizationKey={props.feePeriodText}
            />
          ) : null}
        </Flex>

        <PeriodToggle
          plan={props}
          planPeriod={planPeriod}
          setPlanPeriod={setPlanPeriod}
        />
      </Box>
    );
  },
);

const PeriodToggle = ({
  plan,
  planPeriod,
  setPlanPeriod,
}: {
  plan: PricingTableCardHeaderProps;
  planPeriod: PricingTableCardHeaderProps['planPeriod'];
  setPlanPeriod: PricingTableCardHeaderProps['setPlanPeriod'];
}) => {
  if (!plan.isDefault && plan.hasMonthlyFee && plan.hasAnnualMonthlyFee) {
    return (
      <Box
        elementDescriptor={descriptors.pricingTableCardPeriodToggle}
        sx={t => ({
          marginTop: t.space.$1,
        })}
      >
        <Switch
          isChecked={planPeriod === 'annual'}
          onChange={(checked: boolean) => setPlanPeriod(checked ? 'annual' : 'month')}
          label={localizationKeys('billing.billedAnnually')}
        />
      </Box>
    );
  }

  if (plan.hasAnnualMonthlyFee) {
    return (
      <Text
        elementDescriptor={descriptors.pricingTableCardFeePeriodNotice}
        variant='caption'
        colorScheme='secondary'
        localizationKey={
          plan.isDefault ? localizationKeys('billing.alwaysFree') : localizationKeys('billing.billedAnnuallyOnly')
        }
        sx={t => ({
          justifySelf: 'flex-start',
          alignSelf: 'center',
          marginTop: t.space.$1,
        })}
      />
    );
  }

  return (
    <Text
      elementDescriptor={descriptors.pricingTableCardFeePeriodNotice}
      variant='caption'
      colorScheme='secondary'
      localizationKey={
        plan.isDefault ? localizationKeys('billing.alwaysFree') : localizationKeys('billing.billedMonthlyOnly')
      }
      sx={t => ({
        justifySelf: 'flex-start',
        alignSelf: 'center',
        marginTop: t.space.$1,
      })}
    />
  );
};
