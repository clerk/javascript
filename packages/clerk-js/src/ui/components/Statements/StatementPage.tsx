import { StatementsContextProvider, useStatementsContext } from '../../contexts';
import { Badge, Box, Button, descriptors, Heading, Icon, Span, Spinner, Text } from '../../customizables';
import { Header, LineItems } from '../../elements';
import { useClipboard } from '../../hooks';
import { Check, Copy } from '../../icons';
import { useRouter } from '../../router';
import { truncateWithEndVisible } from '../../utils/truncateTextWithEndVisible';

const StatementPageInternal = () => {
  const { params, navigate } = useRouter();
  const { getInvoiceById, isLoading } = useStatementsContext();
  const statement = params.statementId ? getInvoiceById(params.statementId) : null;

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
        <Header.BackLink
          onClick={() => void navigate('../../', { searchParams: new URLSearchParams('tab=statements') })}
        >
          <Header.Title
            localizationKey='Statements'
            textVariant='h2'
          />
        </Header.BackLink>
      </Header.Root>
      <Box
        elementDescriptor={descriptors.statementRoot}
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
        {!statement ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Text>Statement not found</Text>
          </Box>
        ) : (
          <Box
            elementDescriptor={descriptors.statementCard}
            sx={t => ({
              boxShadow: t.shadows.$tableBodyShadow,
              borderRadius: t.radii.$lg,
              overflow: 'hidden',
            })}
          >
            <Box
              elementDescriptor={descriptors.statementHeader}
              as='header'
              sx={t => ({
                padding: t.space.$4,
                background: t.colors.$neutralAlpha25,
                borderBlockEndWidth: t.borderWidths.$normal,
                borderBlockEndStyle: t.borderStyles.$solid,
                borderBlockEndColor: t.colors.$neutralAlpha100,
              })}
            >
              <Box
                elementDescriptor={descriptors.statementHeaderTitleBadgeContainer}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                }}
              >
                <Span elementDescriptor={descriptors.statementTitleIdContainer}>
                  <Heading
                    textVariant='h2'
                    elementDescriptor={descriptors.statementTitle}
                  >
                    April 2025
                  </Heading>
                  <Span
                    elementDescriptor={descriptors.statementIdContainer}
                    sx={t => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.space.$0x25,
                      color: t.colors.$colorTextSecondary,
                    })}
                  >
                    <CopyButton
                      copyLabel='Copy statement ID'
                      text={statement.id}
                    />
                    <Text
                      elementDescriptor={descriptors.statementId}
                      colorScheme='secondary'
                      variant='subtitle'
                    >
                      {truncateWithEndVisible(statement.id)}
                    </Text>
                  </Span>
                </Span>

                <Badge
                  elementDescriptor={descriptors.statementBadge}
                  colorScheme={
                    statement.status === 'paid' ? 'success' : statement.status === 'unpaid' ? 'warning' : 'danger'
                  }
                  sx={{ textTransform: 'capitalize' }}
                >
                  {statement.status}
                </Badge>
              </Box>
            </Box>
            <Box
              elementDescriptor={descriptors.statementContent}
              sx={t => ({
                padding: t.space.$4,
              })}
            >
              <LineItems.Root>
                <LineItems.Group>
                  <LineItems.Title title='Plan' />
                  <LineItems.Description
                    text={`${statement.totals.grandTotal.currencySymbol}${statement.totals.grandTotal.amountFormatted}`}
                    suffix='per month'
                  />
                </LineItems.Group>
                <LineItems.Group
                  variant='secondary'
                  borderTop
                >
                  <LineItems.Title title='Subtotal' />
                  <LineItems.Description
                    text={`${statement.totals.grandTotal.currencySymbol}${statement.totals.grandTotal.amountFormatted}`}
                  />
                </LineItems.Group>
                <LineItems.Group variant='secondary'>
                  <LineItems.Title title='Tax' />
                  <LineItems.Description
                    text={`${statement.totals.grandTotal.currencySymbol}${statement.totals.grandTotal.amountFormatted}`}
                  />
                </LineItems.Group>
                <LineItems.Group borderTop>
                  <LineItems.Title title='Total due' />
                  <LineItems.Description
                    text={`${statement.totals.grandTotal.currencySymbol}${statement.totals.grandTotal.amountFormatted}`}
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
      elementDescriptor={descriptors.statementCopyButton}
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

export const StatementPage = () => {
  return (
    <StatementsContextProvider>
      <StatementPageInternal />
    </StatementsContextProvider>
  );
};
