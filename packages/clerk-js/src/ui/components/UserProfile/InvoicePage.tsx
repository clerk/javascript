import { useInvoicesContext } from '../../contexts';
import { Badge, Box, Dd, descriptors, Dl, Dt, Heading, Spinner, Text } from '../../customizables';
import { Header, LineItems } from '../../elements';
import { useRouter } from '../../router';
import { common } from '../../styledSystem';
import { colors } from '../../utils';
import { truncateWithEndVisible } from '../../utils/truncateTextWithEndVisible';

export const InvoicePage = () => {
  const { params } = useRouter();
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
        <Header.Title
          localizationKey='Invoices'
          textVariant='h2'
        />
      </Header.Root>
      <Box
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
            sx={t => ({
              borderWidth: t.borderWidths.$normal,
              borderStyle: t.borderStyles.$solid,
              borderColor: t.colors.$neutralAlpha100,
              borderRadius: t.radii.$lg,
              overflow: 'hidden',
            })}
          >
            <Box
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
                  alignItems: 'center',
                }}
              >
                <Heading textVariant='h2'>{truncateWithEndVisible(invoice.id)}</Heading>
                <Badge
                  colorScheme={
                    invoice.status === 'paid' ? 'success' : invoice.status === 'unpaid' ? 'warning' : 'danger'
                  }
                  sx={{ textTransform: 'capitalize' }}
                >
                  {invoice.status}
                </Badge>
              </Box>
              <Dl
                sx={t => ({
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBlockStart: t.space.$3,
                })}
              >
                <Box>
                  <Dt>
                    <Text
                      colorScheme='secondary'
                      variant='body'
                    >
                      Created on
                    </Text>
                  </Dt>
                  <Dd>
                    <Text variant='subtitle'>{new Date(invoice.paymentDueOn).toLocaleDateString()}</Text>
                  </Dd>
                </Box>
                <Box
                  sx={{
                    textAlign: 'right',
                  }}
                >
                  <Dt>
                    <Text
                      colorScheme='secondary'
                      variant='body'
                    >
                      Due on
                    </Text>
                  </Dt>
                  <Dd>
                    <Text variant='subtitle'>{new Date(invoice.paymentDueOn).toLocaleDateString()}</Text>
                  </Dd>
                </Box>
              </Dl>
            </Box>
            <Box
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
