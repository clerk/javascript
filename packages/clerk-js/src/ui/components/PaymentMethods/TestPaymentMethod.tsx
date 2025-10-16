import { LineItems } from '@/ui/elements/LineItems';

import { Box, localizationKeys, Text, useLocalizations } from '../../customizables';

export const TestPaymentMethod = () => {
  const { t } = useLocalizations();
  return (
    <Box
      sx={t => ({
        background: t.colors.$neutralAlpha50,
        padding: t.space.$2x5,
        borderRadius: t.radii.$md,
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha100,
        display: 'flex',
        flexDirection: 'column',
        rowGap: t.space.$2,
        position: 'relative',
      })}
    >
      <Box
        sx={t => ({
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(-45deg,${t.colors.$warningAlpha100},${t.colors.$warningAlpha100} 6px,${t.colors.$warningAlpha150} 6px,${t.colors.$warningAlpha150} 12px)`,
          maskImage: `linear-gradient(transparent 20%, black)`,
          pointerEvents: 'none',
        })}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <Text
          variant='caption'
          colorScheme='body'
          localizationKey={localizationKeys('billing.paymentMethod.dev.testCardInfo')}
        />
        <Text
          variant='caption'
          sx={t => ({
            color: t.colors.$warning500,
            fontWeight: t.fontWeights.$semibold,
          })}
          localizationKey={localizationKeys('billing.paymentMethod.dev.developmentMode')}
        />
      </Box>
      <LineItems.Root>
        <LineItems.Group variant='tertiary'>
          <LineItems.Title title={localizationKeys('billing.paymentMethod.dev.cardNumber')} />
          <LineItems.Description text={'4242 4242 4242 4242'} />
        </LineItems.Group>
        <LineItems.Group variant='tertiary'>
          <LineItems.Title title={localizationKeys('billing.paymentMethod.dev.expirationDate')} />
          <LineItems.Description text={'11/44'} />
        </LineItems.Group>
        <LineItems.Group variant='tertiary'>
          <LineItems.Title title={localizationKeys('billing.paymentMethod.dev.cvcZip')} />
          <LineItems.Description text={t(localizationKeys('billing.paymentMethod.dev.anyNumbers'))} />
        </LineItems.Group>
      </LineItems.Root>
    </Box>
  );
};
