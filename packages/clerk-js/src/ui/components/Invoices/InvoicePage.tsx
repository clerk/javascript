import { useInvoicesContext } from '../../contexts';
import { Badge, Box, Button, Dd, descriptors, Dl, Dt, Heading, Icon, Span, Spinner, Text } from '../../customizables';
import { Header, LineItems } from '../../elements';
import { useClipboard } from '../../hooks';
import { Check, Copy } from '../../icons';
import { useRouter } from '../../router';
import { common } from '../../styledSystem';
import { colors } from '../../utils';
import { truncateWithEndVisible } from '../../utils/truncateTextWithEndVisible';

export const InvoicePage = () => {
  const { params, navigate } = useRouter();
  const { getInvoiceById, isLoading } = useInvoicesContext();
  const invoice = params.invoiceId ? getInvoiceById(params.invoiceId) : null;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spinner
          colorScheme='primary'
          sx={{ margin: 'auto', display: 'block' }}
          elementDescriptor={descriptors.spinner}
        />
      </Box>
    );
  }

  return (
    <>
      <Header.Root>
        <Header.BackLink onClick={() => void navigate('../../', { searchParams: new URLSearchParams('tab=invoices') })}>
          <Header.Title
            localizationKey='Invoices'
            textVariant='h2'
          />
        </Header.BackLink>
      </Header.Root>
      <Box
        elementDescriptor={descriptors.invoiceRoot}
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          gap: t.space.$4,
          borderTopWidth: t.borderWidths.$normal,
          borderTopStyle: t.borderStyles.$solid,
          borderTopColor: t.colors.$neutralAlpha100,
          marginBlockStart: t.space.$4,
          paddingBlockStart: t.space.$4,
        })}
      >
        {!invoice ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Text>Invoice not found</Text>
          </Box>
        ) : (
          <Box
            elementDescriptor={descriptors.invoiceCard}
            sx={t => ({
              borderWidth: t.borderWidths.$normal,
              borderStyle: t.borderStyles.$solid,
              borderColor: t.colors.$neutralAlpha100,
              borderRadius: t.radii.$lg,
              overflow: 'hidden',
            })}
          >
            <Box
              elementDescriptor={descriptors.invoiceHeader}
              as='header'
              sx={t => ({
                padding: t.space.$4,
                background: common.mergedColorsBackground(
                  colors.setAlpha(t.colors.$colorBackground, 1),
                  t.colors.$neutralAlpha50,
                ),
                borderBlockEndWidth: t.borderWidths.$normal,
                borderBlockEndStyle: t.borderStyles.$solid,
                borderBlockEndColor: t.colors.$neutralAlpha100,
              })}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                }}
              >
                <Span>
                  <Heading
                    textVariant='h2'
                    elementDescriptor={descriptors.invoiceTitle}
                  >
                    Invoice ID
                  </Heading>
                  <Span
                    sx={t => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.space.$0x5,
                      color: t.colors.$colorTextSecondary,
                    })}
                  >
                    <CopyButton text={invoice.id} />
                    <Text
                      colorScheme='secondary'
                      variant='subtitle'
                    >
                      {truncateWithEndVisible(invoice.id)}
                    </Text>
                  </Span>
                </Span>

                <Badge
                  elementDescriptor={descriptors.invoiceBadge}
                  colorScheme={
                    invoice.status === 'paid' ? 'success' : invoice.status === 'unpaid' ? 'warning' : 'danger'
                  }
                  sx={{ textTransform: 'capitalize' }}
                >
                  {invoice.status}
                </Badge>
              </Box>
              <Dl
                elementDescriptor={descriptors.invoiceDetails}
                sx={t => ({
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBlockStart: t.space.$3,
                })}
              >
                <Box elementDescriptor={descriptors.invoiceDetailsItem}>
                  <Dt elementDescriptor={descriptors.invoiceDetailsItemTitle}>
                    <Text
                      colorScheme='secondary'
                      variant='body'
                    >
                      Created on
                    </Text>
                  </Dt>
                  <Dd elementDescriptor={descriptors.invoiceDetailsItemValue}>
                    <Text variant='subtitle'>{new Date(invoice.paymentDueOn).toLocaleDateString()}</Text>
                  </Dd>
                </Box>
                <Box
                  elementDescriptor={descriptors.invoiceDetailsItem}
                  sx={{
                    textAlign: 'right',
                  }}
                >
                  <Dt elementDescriptor={descriptors.invoiceDetailsItemTitle}>
                    <Text
                      colorScheme='secondary'
                      variant='body'
                    >
                      Due on
                    </Text>
                  </Dt>
                  <Dd elementDescriptor={descriptors.invoiceDetailsItemValue}>
                    <Text variant='subtitle'>{new Date(invoice.paymentDueOn).toLocaleDateString()}</Text>
                  </Dd>
                </Box>
              </Dl>
            </Box>
            <Box
              elementDescriptor={descriptors.invoiceContent}
              sx={t => ({
                padding: t.space.$4,
              })}
            >
              <LineItems.Root>
                <LineItems.Group>
                  <LineItems.Title title='Plan' />
                  <LineItems.Description
                    text={`${invoice.totals.grandTotal.currencySymbol}${invoice.totals.grandTotal.amountFormatted}`}
                    suffix='per month'
                  />
                </LineItems.Group>
                <LineItems.Group
                  variant='secondary'
                  borderTop
                >
                  <LineItems.Title title='Subtotal' />
                  <LineItems.Description
                    text={`${invoice.totals.grandTotal.currencySymbol}${invoice.totals.grandTotal.amountFormatted}`}
                  />
                </LineItems.Group>
                <LineItems.Group variant='secondary'>
                  <LineItems.Title title='Tax' />
                  <LineItems.Description
                    text={`${invoice.totals.grandTotal.currencySymbol}${invoice.totals.grandTotal.amountFormatted}`}
                  />
                </LineItems.Group>
                <LineItems.Group borderTop>
                  <LineItems.Title title='Total due' />
                  <LineItems.Description
                    text={`${invoice.totals.grandTotal.currencySymbol}${invoice.totals.grandTotal.amountFormatted}`}
                    prefix='USD'
                  />
                </LineItems.Group>
              </LineItems.Root>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

function CopyButton({ text, copyLabel = 'Copy' }: { text: string; copyLabel?: string }) {
  const { onCopy, hasCopied } = useClipboard(text);

  return (
    <Button
      variant='unstyled'
      onClick={onCopy}
      sx={t => ({
        color: 'inherit',
        width: t.sizes.$4,
        height: t.sizes.$4,
        padding: 0,
        borderRadius: t.radii.$sm,
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: t.colors.$neutralAlpha200,
        },
      })}
      focusRing={false}
      aria-label={hasCopied ? 'Copied' : copyLabel}
    >
      <Icon
        size='sm'
        icon={hasCopied ? Check : Copy}
        aria-hidden
      />
    </Button>
  );
}
