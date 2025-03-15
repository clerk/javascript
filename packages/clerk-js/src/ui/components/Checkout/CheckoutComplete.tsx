import type { __experimental_CommerceCheckoutResource } from '@clerk/types';

import { useCheckoutContext } from '../../contexts';
import { Button, Col, Icon, Span, Text } from '../../customizables';
import { LineItems } from '../../elements';
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
      <Col
        align='center'
        justify='center'
        sx={{
          flex: 1,
        }}
      >
        <Span
          sx={t => ({
            position: 'relative',
            aspectRatio: '1/1',
            display: 'grid',
            width: '100%',
            padding: t.space.$4,
            flexShrink: 0,
          })}
        >
          <Circle scale={1} />
          <Circle scale={0.75} />
          <Circle scale={0.5} />
          <Span
            sx={t => ({
              margin: 'auto',
              gridArea: '1/1',
              position: 'relative',
              display: 'flex',
              width: t.sizes.$16,
              height: t.sizes.$16,
              borderRadius: t.radii.$circle,
              backgroundImage:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.30) 0%, rgba(0, 0, 0, 0.12) 50%, rgba(0, 0, 0, 0.30) 95.31%)',
              '&:before': {
                content: '""',
                position: 'absolute',
                inset: t.space.$1,
                backgroundColor: t.colors.$colorBackground,
                borderRadius: t.radii.$circle,
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
            />
          </Span>
          <Span
            sx={t => ({
              margin: 'auto',
              gridArea: '1/1',
              position: 'relative',
              textAlign: 'center',
              transform: `translateY(${t.space.$20})`,
            })}
          >
            <Text variant='h2'>Payment was successful!</Text>
            <Text sx={t => ({ textAlign: 'center', paddingInline: t.space.$8 })}>
              {/* TODO(@COMMERCE): needs localization */}
              Minim adipisicing enim fugiat enim est ad nisi exercitation nisi exercitation quis culpa.
            </Text>
          </Span>
        </Span>
      </Col>

      <Col
        gap={2}
        sx={t => ({
          padding: t.space.$4,
          borderTopWidth: t.borderWidths.$normal,
          borderTopStyle: t.borderStyles.$solid,
          borderTopColor: t.colors.$neutralAlpha100,
          position: 'relative',
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
            {/* TODO(@COMMERCE): needs localization */}
            <LineItems.Title>Payment method</LineItems.Title>
            <LineItems.Description>
              {checkout.paymentSource ? `${checkout.paymentSource.cardType} ⋯ ${checkout.paymentSource.last4}` : '–'}
            </LineItems.Description>
          </LineItems.Group>
          <LineItems.Group variant='tertiary'>
            {/* TODO(@COMMERCE): needs localization */}
            <LineItems.Title>Invoice ID</LineItems.Title>
            <LineItems.Description>{checkout.invoice ? checkout.invoice.id : '–'}</LineItems.Description>
          </LineItems.Group>
        </LineItems.Root>
        <Button
          sx={t => ({
            width: '100%',
            marginTop: t.space.$2,
          })}
          onClick={handleClose}
        >
          {/* TODO(@COMMERCE): needs localization */}
          Continue
        </Button>
      </Col>
    </>
  );
};

function Circle({
  scale,
}: {
  /**
   * Number between 0-1
   */
  scale: number;
}) {
  return (
    <Span
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
