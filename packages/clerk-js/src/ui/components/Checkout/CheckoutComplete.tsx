import type { __experimental_CommerceCheckoutResource } from '@clerk/types';

import { useCheckoutContext } from '../../contexts';
import { Box, Button, descriptors, Heading, Icon, Span, Text } from '../../customizables';
import { Drawer, LineItems } from '../../elements';
import { Check } from '../../icons';

export const CheckoutComplete = ({ checkout }: { checkout: __experimental_CommerceCheckoutResource }) => {
  const { setIsOpen } = useCheckoutContext();

  const handleClose = () => {
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Drawer.Body>
        <Span
          elementDescriptor={descriptors.checkoutSuccessRoot}
          sx={t => ({
            margin: 'auto',
            position: 'relative',
            aspectRatio: '1/1',
            display: 'grid',
            width: '100%',
            padding: t.space.$4,
            flexShrink: 0,
          })}
        >
          <Ring scale={1} />
          <Ring scale={0.75} />
          <Ring scale={0.5} />
          <Box
            elementDescriptor={descriptors.checkoutSuccessBadge}
            sx={t => ({
              margin: 'auto',
              gridArea: '1/1',
              display: 'flex',
              position: 'relative',
              width: t.sizes.$16,
              height: t.sizes.$16,
              borderRadius: t.radii.$circle,
              backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.30) 0%, rgba(0, 0, 0, 0.12) 50%, rgba(0, 0, 0, 0.30) 95.31%)`,
              boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.35), 0px 1px 0px 0px rgba(255, 255, 255, 0.05) inset',
              ':before': {
                content: '""',
                position: 'absolute',
                inset: t.space.$1,
                borderRadius: t.radii.$circle,
                backgroundColor: t.colors.$colorBackground,
              },
            })}
          >
            <Icon
              icon={Check}
              colorScheme='neutral'
              sx={{
                position: 'relative',
                margin: 'auto',
              }}
              aria-hidden
            />
          </Box>
          <Span
            sx={t => ({
              margin: 'auto',
              gridArea: '1/1',
              position: 'relative',
              textAlign: 'center',
              transform: `translateY(${t.space.$20})`,
            })}
          >
            <Heading
              elementDescriptor={descriptors.checkoutSuccessTitle}
              as='h2'
              textVariant='h2'
            >
              Payment was successful!
            </Heading>
            <Text
              elementDescriptor={descriptors.checkoutSuccessDescription}
              colorScheme='secondary'
              sx={t => ({ textAlign: 'center', paddingInline: t.space.$8, marginBlockStart: t.space.$2 })}
            >
              {/* TODO(@COMMERCE): needs localization */}
              Minim adipisicing enim fugiat enim est ad nisi exercitation nisi exercitation quis culpa.
            </Text>
          </Span>
        </Span>
      </Drawer.Body>

      <Drawer.Footer
        sx={t => ({
          rowGap: t.space.$4,
        })}
      >
        <LineItems.Root>
          <LineItems.Group variant='secondary'>
            <LineItems.Title>Total paid</LineItems.Title>
            <LineItems.Description>
              {checkout?.invoice
                ? `${checkout.invoice.totals.grandTotal.currencySymbol}${checkout.invoice.totals.grandTotal.amountFormatted}`
                : '–'}
            </LineItems.Description>
          </LineItems.Group>
          <LineItems.Group variant='secondary'>
            {/* TODO(@COMMERCE): needs localization */}
            <LineItems.Title>Payment method</LineItems.Title>
            <LineItems.Description>
              {checkout?.paymentSource ? `${checkout.paymentSource.cardType} ⋯ ${checkout.paymentSource.last4}` : '–'}
            </LineItems.Description>
          </LineItems.Group>
          <LineItems.Group variant='tertiary'>
            {/* TODO(@COMMERCE): needs localization */}
            <LineItems.Title>Invoice ID</LineItems.Title>
            <LineItems.Description>{checkout?.invoice ? checkout.invoice.id : '–'}</LineItems.Description>
          </LineItems.Group>
        </LineItems.Root>
        <Button onClick={handleClose}>
          {/* TODO(@COMMERCE): needs localization */}
          Continue
        </Button>
      </Drawer.Footer>
    </>
  );
};

function Ring({
  scale,
}: {
  /**
   * Number between 0-1
   */
  scale: number;
}) {
  return (
    <Span
      elementDescriptor={descriptors.checkoutSuccessRing}
      sx={t => ({
        margin: 'auto',
        gridArea: '1/1',
        width: `${scale * 100}%`,
        height: `${scale * 100}%`,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: t.colors.$neutralAlpha200,
        borderRadius: t.radii.$circle,
        maskImage: `linear-gradient(to bottom, transparent 15%, black, transparent 85%)`,
      })}
    />
  );
}
