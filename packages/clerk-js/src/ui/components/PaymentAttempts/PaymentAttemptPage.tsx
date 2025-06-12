import { Header } from '@/ui/elements/Header';
import { LineItems } from '@/ui/elements/LineItems';

import { usePaymentAttemptsContext, useStatements } from '../../contexts';
import { useSubscriberTypeLocalizationRoot } from '../../contexts/components';
import {
  Badge,
  Box,
  Button,
  descriptors,
  Heading,
  Icon,
  localizationKeys,
  Span,
  Spinner,
  Text,
} from '../../customizables';
import { useClipboard } from '../../hooks';
import { Check, Copy } from '../../icons';
import { useRouter } from '../../router';
import { formatDate, truncateWithEndVisible } from '../../utils';

export const PaymentAttemptPage = () => {
  const { params, navigate } = useRouter();
  const { isLoading } = useStatements();
  const { getPaymentAttemptById } = usePaymentAttemptsContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();

  const paymentAttempt = params.paymentAttemptId ? getPaymentAttemptById(params.paymentAttemptId) : null;
  const subscriptionItem = paymentAttempt?.subscriptionItem;

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

  if (!paymentAttempt) {
    return (
      <Text localizationKey={localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.notFound`)} />
    );
  }

  return (
    <>
      <Header.Root
        sx={t => ({
          borderBlockEndWidth: t.borderWidths.$normal,
          borderBlockEndStyle: t.borderStyles.$solid,
          borderBlockEndColor: t.colors.$neutralAlpha100,
          marginBlockEnd: t.space.$4,
          paddingBlockEnd: t.space.$4,
        })}
      >
        <Header.BackLink onClick={() => void navigate('../../', { searchParams: new URLSearchParams('tab=payments') })}>
          <Header.Title
            localizationKey={localizationKeys(`${localizationRoot}.billingPage.start.headerTitle__payments`)}
            textVariant='h2'
          />
        </Header.BackLink>
      </Header.Root>

      <Box
        elementDescriptor={descriptors.paymentAttemptRoot}
        as='article'
        sx={t => ({
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$neutralAlpha100,
          borderRadius: t.radii.$lg,
          overflow: 'clip',
        })}
      >
        <Box
          elementDescriptor={descriptors.paymentAttemptHeader}
          as='header'
          sx={t => ({
            padding: t.space.$4,
            background: t.colors.$neutralAlpha25,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          })}
        >
          <Span elementDescriptor={descriptors.paymentAttemptHeaderTitleContainer}>
            <Heading
              elementDescriptor={descriptors.paymentAttemptHeaderTitle}
              textVariant='h2'
              localizationKey={formatDate(
                new Date(paymentAttempt.paidAt || paymentAttempt.failedAt || paymentAttempt.updatedAt),
                'long',
              )}
            />
            <Span
              sx={t => ({
                display: 'flex',
                alignItems: 'center',
                gap: t.space.$0x25,
                color: t.colors.$colorTextSecondary,
              })}
            >
              <CopyButton
                copyLabel='Copy payment attempt ID'
                text={paymentAttempt.id}
              />
              <Text
                colorScheme='secondary'
                variant='subtitle'
              >
                {truncateWithEndVisible(paymentAttempt.id)}
              </Text>
            </Span>
          </Span>
          <Badge
            elementDescriptor={descriptors.paymentAttemptHeaderBadge}
            colorScheme={
              paymentAttempt.status === 'paid' ? 'success' : paymentAttempt.status === 'failed' ? 'danger' : 'primary'
            }
            sx={{ textTransform: 'capitalize' }}
          >
            {paymentAttempt.status}
          </Badge>
        </Box>
        <Box
          elementDescriptor={descriptors.paymentAttemptBody}
          sx={t => ({
            padding: t.space.$4,
          })}
        >
          {subscriptionItem && (
            <LineItems.Root>
              <LineItems.Group>
                <LineItems.Title title={subscriptionItem.plan.name} />
                <LineItems.Description
                  prefix={subscriptionItem.planPeriod === 'annual' ? 'x12' : undefined}
                  text={`${subscriptionItem.plan.currencySymbol}${subscriptionItem.planPeriod === 'month' ? subscriptionItem.plan.amountFormatted : subscriptionItem.plan.annualMonthlyAmountFormatted}`}
                />
              </LineItems.Group>
              <LineItems.Group
                borderTop
                variant='tertiary'
              >
                <LineItems.Title title={localizationKeys('commerce.subtotal')} />
                <LineItems.Description
                  text={`${subscriptionItem.amount?.currencySymbol}${subscriptionItem.amount?.amountFormatted}`}
                />
              </LineItems.Group>
              {subscriptionItem.credit && subscriptionItem.credit.amount.amount > 0 && (
                <LineItems.Group variant='tertiary'>
                  <LineItems.Title title={localizationKeys('commerce.credit')} />
                  <LineItems.Description
                    text={`- ${subscriptionItem.credit.amount.currencySymbol}${subscriptionItem.credit.amount.amountFormatted}`}
                  />
                </LineItems.Group>
              )}
            </LineItems.Root>
          )}
        </Box>
        <Box
          elementDescriptor={descriptors.paymentAttemptFooter}
          as='footer'
          sx={t => ({
            paddingInline: t.space.$4,
            paddingBlock: t.space.$3,
            background: t.colors.$neutralAlpha25,
            borderBlockStartWidth: t.borderWidths.$normal,
            borderBlockStartStyle: t.borderStyles.$solid,
            borderBlockStartColor: t.colors.$neutralAlpha100,
            display: 'flex',
            justifyContent: 'space-between',
          })}
        >
          <Text
            variant='h3'
            localizationKey={localizationKeys('commerce.totalDue')}
            elementDescriptor={descriptors.paymentAttemptFooterLabel}
          />
          <Span
            elementDescriptor={descriptors.paymentAttemptFooterValueContainer}
            sx={t => ({
              display: 'flex',
              alignItems: 'center',
              gap: t.space.$2x5,
            })}
          >
            <Text
              variant='caption'
              colorScheme='secondary'
              elementDescriptor={descriptors.paymentAttemptFooterCurrency}
              sx={{ textTransform: 'uppercase' }}
            >
              {paymentAttempt.amount.currency}
            </Text>
            <Text
              variant='h3'
              elementDescriptor={descriptors.paymentAttemptFooterValue}
            >
              {paymentAttempt.amount.currencySymbol}
              {paymentAttempt.amount.amountFormatted}
            </Text>
          </Span>
        </Box>
      </Box>
    </>
  );
};

function CopyButton({ text, copyLabel = 'Copy' }: { text: string; copyLabel?: string }) {
  const { onCopy, hasCopied } = useClipboard(text);

  return (
    <Button
      elementDescriptor={descriptors.paymentAttemptCopyButton}
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
