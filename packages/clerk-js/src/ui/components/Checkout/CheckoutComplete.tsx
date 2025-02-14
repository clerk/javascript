import type { CommerceCheckoutResource } from '@clerk/types';

import { useCheckoutContext } from '../../contexts';
import { Box, Button, Col, Flex, Icon, Text } from '../../customizables';
import { Check } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';

export const CheckoutComplete = ({ checkout, sx }: { checkout: CommerceCheckoutResource; sx?: ThemableCssProp }) => {
  const { close = () => {} } = useCheckoutContext();

  return (
    <Col
      sx={[
        t => ({
          width: '100%',
          padding: t.space.$4,
        }),
        sx,
      ]}
    >
      <Col
        align='center'
        justify='center'
        gap={8}
        sx={{
          flex: 1,
        }}
      >
        <Box
          sx={t => ({
            position: 'relative',
            width: t.sizes.$16,
            height: t.sizes.$16,
            borderRadius: t.radii.$circle,
            backgroundImage:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.30) 0%, rgba(0, 0, 0, 0.12) 50%, rgba(0, 0, 0, 0.30) 95.31%)',
          })}
        >
          <Box
            sx={t => ({
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: t.radii.$circle,
              backgroundImage:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.00) 60.94%)',
              backgroundBlendMode: 'plus-lighter, normal',
              boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.35), 0px 1px 0px 0px rgba(255, 255, 255, 0.05) inset',
            })}
          >
            <Flex
              align='center'
              justify='center'
              sx={t => ({
                position: 'absolute',
                inset: t.space.$1,
                borderRadius: t.radii.$circle,
                backgroundColor: t.colors.$colorBackground,
              })}
            >
              <Icon icon={Check} />
            </Flex>
          </Box>
        </Box>

        <Col
          align='center'
          gap={2}
        >
          <Text variant='h2'>Payment was successful!</Text>
          <Text sx={t => ({ textAlign: 'center', paddingInline: t.space.$8 })}>
            Minim adipisicing enim fugiat enim est ad nisi exercitation nisi exercitation quis culpa.
          </Text>
        </Col>
      </Col>
      <Col
        gap={2}
        sx={t => ({
          flex: 0,
          paddingTop: t.space.$4,
          borderTopWidth: t.borderWidths.$normal,
          borderTopStyle: t.borderStyles.$solid,
          borderTopColor: t.colors.$neutralAlpha100,
        })}
      >
        <Flex
          align='baseline'
          justify='between'
          gap={2}
        >
          <Text sx={t => ({ fontWeight: t.fontWeights.$medium })}>Total paid</Text>
          <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>
            {checkout.invoice
              ? `${checkout.invoice.totals.grandTotal.currencySymbol}${checkout.invoice.totals.grandTotal.amountFormatted}`
              : '–'}
          </Text>
        </Flex>
        <Flex
          align='baseline'
          justify='between'
          gap={2}
        >
          <Text sx={t => ({ fontWeight: t.fontWeights.$medium })}>Payment method</Text>
          <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>
            {checkout.paymentSource ? `${checkout.paymentSource.cardType} ⋯ ${checkout.paymentSource.last4}` : '–'}
          </Text>
        </Flex>
        <Flex
          align='baseline'
          justify='between'
          gap={2}
        >
          <Text sx={t => ({ fontWeight: t.fontWeights.$medium })}>Invoice ID</Text>
          <Text
            colorScheme='secondary'
            sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}
          >
            {checkout.invoice ? checkout.invoice.id : '–'}
          </Text>
        </Flex>
        <Button
          colorScheme={'light'}
          size='sm'
          hasArrow
          textVariant={'buttonSmall'}
          sx={t => ({
            width: '100%',
            marginTop: t.space.$2,
          })}
          onClick={close}
        >
          Continue
        </Button>
      </Col>
    </Col>
  );
};
