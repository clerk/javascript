import { DevModeOverlay } from '@/ui/elements/DevModeNotice';

import { Box, Button, Flex, localizationKeys, Text } from '../../customizables';

export const PayWithTestPaymentMethodView = ({
  isLoading,
  onClick,
}: {
  isLoading: boolean;
  onClick: () => Promise<void>;
}) => (
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
      overflow: 'hidden',
    })}
  >
    <DevModeOverlay />
    <Flex
      sx={t => ({
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        rowGap: t.space.$2,
      })}
    >
      <Text
        sx={t => ({
          color: t.colors.$warning500,
          fontWeight: t.fontWeights.$semibold,
        })}
        localizationKey={localizationKeys('billing.paymentMethod.dev.developmentMode')}
      />
      <Button
        type='button'
        block
        variant='bordered'
        localizationKey={localizationKeys('userProfile.billingPage.paymentMethodsSection.payWithTestCardButton')}
        colorScheme='secondary'
        isLoading={isLoading}
        onClick={() => void onClick()}
      />
    </Flex>
  </Box>
);
