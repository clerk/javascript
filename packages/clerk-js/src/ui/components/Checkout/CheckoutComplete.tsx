import type { __experimental_CommerceCheckoutResource } from '@clerk/types';

import { Box, Button, descriptors, Heading, Icon, localizationKeys, Span, Text } from '../../customizables';
import { Drawer, LineItems, useDrawerContext } from '../../elements';
import { Check } from '../../icons';
import { formatDate } from '../../utils';

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);

export const CheckoutComplete = ({ checkout }: { checkout: __experimental_CommerceCheckoutResource }) => {
  const { setIsOpen } = useDrawerContext();

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
              localizationKey={
                checkout.subscription?.status === 'active'
                  ? localizationKeys('__experimental_commerce.checkout.title__paymentSuccessful')
                  : localizationKeys('__experimental_commerce.checkout.title__subscriptionSuccessful')
              }
            />
            <Text
              elementDescriptor={descriptors.checkoutSuccessDescription}
              colorScheme='secondary'
              sx={t => ({ textAlign: 'center', paddingInline: t.space.$8, marginBlockStart: t.space.$2 })}
              localizationKey={
                checkout.subscription?.status === 'active'
                  ? localizationKeys('__experimental_commerce.checkout.description__paymentSuccessful')
                  : localizationKeys('__experimental_commerce.checkout.description__subscriptionSuccessful')
              }
            />
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
            <LineItems.Title title={localizationKeys('__experimental_commerce.checkout.lineItems.title__totalPaid')} />
            <LineItems.Description
              text={`${checkout.totals.grandTotal.currencySymbol}${checkout.totals.grandTotal.amountFormatted}`}
            />
          </LineItems.Group>
          <LineItems.Group variant='secondary'>
            <LineItems.Title
              title={
                checkout.subscription?.status === 'active'
                  ? localizationKeys('__experimental_commerce.checkout.lineItems.title__paymentMethod')
                  : localizationKeys('__experimental_commerce.checkout.lineItems.title__subscriptionBegins')
              }
            />
            <LineItems.Description
              text={
                checkout.subscription?.status === 'active'
                  ? checkout.paymentSource
                    ? `${capitalize(checkout.paymentSource.cardType)} ⋯ ${checkout.paymentSource.last4}`
                    : '–'
                  : checkout.subscription?.periodStart
                    ? formatDate(new Date(checkout.subscription.periodStart))
                    : '–'
              }
            />
          </LineItems.Group>
          <LineItems.Group variant='tertiary'>
            <LineItems.Title title={localizationKeys('__experimental_commerce.checkout.lineItems.title__invoiceId')} />
            <LineItems.Description
              text={checkout.invoice_id || '–'}
              truncateText
              copyText
              copyLabel='Copy invoice ID'
            />
          </LineItems.Group>
        </LineItems.Root>
        <Button
          onClick={handleClose}
          localizationKey={localizationKeys('formButtonPrimary')}
        />
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
