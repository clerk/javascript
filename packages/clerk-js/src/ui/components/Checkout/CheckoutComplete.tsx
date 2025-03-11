import type { __experimental_CommerceCheckoutResource } from '@clerk/types';

import { useCheckoutContext } from '../../contexts';
import { Box, Button, Col, Flex, Icon, Text } from '../../customizables';
import { LineItems } from '../../elements';
import { Check } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';

export const CheckoutComplete = ({
  checkout,
  sx,
}: {
  checkout: __experimental_CommerceCheckoutResource;
  sx?: ThemableCssProp;
}) => {
  const { handleCloseBlade = () => {} } = useCheckoutContext();

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
        <SuccessCircle />

        <Col
          align='center'
          gap={2}
          sx={{ position: 'relative' }}
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
        <LineItems.Root>
          <LineItems.Group variant='secondary'>
            <LineItems.Title>Total paid</LineItems.Title>
            <LineItems.Description>
              {checkout.invoice
                ? `${checkout.invoice.totals.grandTotal.currencySymbol}${checkout.invoice.totals.grandTotal.amountFormatted}`
                : '–'}
            </LineItems.Description>
          </LineItems.Group>
          <LineItems.Group variant='secondary'>
            <LineItems.Title>Payment method</LineItems.Title>
            <LineItems.Description>
              {checkout.invoice
                ? `${checkout.invoice.totals.grandTotal.currencySymbol}${checkout.invoice.totals.grandTotal.amountFormatted}`
                : '–'}
            </LineItems.Description>
          </LineItems.Group>
          <LineItems.Group variant='tertiary'>
            <LineItems.Title>Invoice ID</LineItems.Title>
            <LineItems.Description>{checkout.invoice ? checkout.invoice.id : '–'}</LineItems.Description>
          </LineItems.Group>
        </LineItems.Root>
        <Button
          colorScheme='secondary'
          variant='bordered'
          size='sm'
          hasArrow
          textVariant={'buttonSmall'}
          sx={t => ({
            width: '100%',
            marginTop: t.space.$2,
          })}
          onClick={handleCloseBlade}
        >
          Continue
        </Button>
      </Col>
    </Col>
  );
};

const SuccessCircle = () => {
  return (
    <Flex
      align='center'
      justify='center'
      sx={t => ({
        position: 'relative',
        width: '100%',
        height: t.sizes.$16,
      })}
    >
      {/* rings */}
      <Box>
        <Box
          sx={t => ({
            position: 'absolute',
            top: `-${t.sizes.$8}`,
            bottom: `-${t.sizes.$8}`,
            left: '50%',
            translate: '-50% 0',
            aspectRatio: '1/1',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: t.colors.$neutralAlpha150,
            borderRadius: t.radii.$circle,
          })}
        />
        <Box
          sx={t => ({
            position: 'absolute',
            top: `-${t.sizes.$24}`,
            bottom: `-${t.sizes.$24}`,
            left: '50%',
            translate: '-50% 0',
            aspectRatio: '1/1',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: t.colors.$neutralAlpha200,
            borderRadius: t.radii.$circle,
          })}
        />
        <Box
          sx={t => ({
            position: 'absolute',
            top: `-${t.sizes.$40}`,
            bottom: `-${t.sizes.$40}`,
            left: '50%',
            translate: '-50% 0',
            aspectRatio: '1/1',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: t.colors.$neutralAlpha200,
            borderRadius: t.radii.$circle,
          })}
        />
      </Box>

      {/* fade overlays */}
      <Box
        sx={t => ({
          position: 'absolute',
          width: '120%',
          aspectRatio: '1/1',
          top: '50%',
          translate: '0 -50%',
          backgroundImage: `linear-gradient(to bottom, ${t.colors.$colorBackground} 35%, transparent 48%, transparent 52%, ${t.colors.$colorBackground} 65%)`,
        })}
      />

      {/* coin */}
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
            width: t.sizes.$16,
            height: t.sizes.$16,
            borderRadius: t.radii.$circle,
            backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.00) 60.94%)',
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
    </Flex>
  );
};
