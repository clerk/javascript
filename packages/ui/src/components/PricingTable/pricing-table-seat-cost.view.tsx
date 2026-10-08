import { Tooltip } from '@/ui/elements/Tooltip';

import { Box, descriptors, Icon, Span, Text } from '../../customizables';
import { UserCircle, Users } from '../../icons';
import type { PricingTableSeatCostData } from './pricing-table-card.types';

export const PricingTableSeatCostView = ({ seatRows }: PricingTableSeatCostData) => {
  if (!seatRows?.length) {
    return null;
  }

  return (
    <>
      {seatRows.map(row => (
        <Box
          key={row.elementId}
          elementDescriptor={descriptors.pricingTableCardFeaturesListItem}
          elementId={descriptors.pricingTableCardFeaturesListItem.setId(row.elementId)}
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
            icon={row.icon === 'user' ? UserCircle : Users}
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
              <Span localizationKey={row.text} />
              {row.additionalText ? (
                <>
                  {' '}
                  {row.additionalTooltipText ? (
                    <Tooltip.Root>
                      <Tooltip.Trigger>
                        <Span
                          localizationKey={row.additionalText}
                          sx={{ textDecoration: 'underline dotted' }}
                        />
                      </Tooltip.Trigger>
                      <Tooltip.Content text={row.additionalTooltipText} />
                    </Tooltip.Root>
                  ) : (
                    <Span localizationKey={row.additionalText} />
                  )}
                </>
              ) : null}
            </Text>
          </Span>
        </Box>
      ))}
    </>
  );
};
