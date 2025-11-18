import type { BillingSubscriptionItemResource } from '@clerk/shared/types';

import { Alert } from '@/ui/elements/Alert';
import { Header } from '@/ui/elements/Header';
import { LineItems } from '@/ui/elements/LineItems';
import { formatDate } from '@/ui/utils/formatDate';
import { truncateWithEndVisible } from '@/ui/utils/truncateTextWithEndVisible';

import { useSubscriberTypeContext, useSubscriberTypeLocalizationRoot } from '../../contexts/components';
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
  useLocalizations,
} from '../../customizables';
import { __internal_usePaymentAttemptQuery, useClipboard } from '../../hooks';
import { Check, Copy } from '../../icons';
import { useRouter } from '../../router';

export const PaymentAttemptPage = () => {
  const { params, navigate } = useRouter();
  const subscriberType = useSubscriberTypeContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { t, translateError } = useLocalizations();
  const requesterType = subscriberType === 'organization' ? 'organization' : 'user';

  const {
    data: paymentAttempt,
    isLoading,
    error,
  } = __internal_usePaymentAttemptQuery({
    paymentAttemptId: params.paymentAttemptId ?? null,
    for: requesterType,
  });

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

  return (
    <>
      <Header.Root
        sx={t => ({
          borderBlockEndWidth: t.borderWidths.$normal,
          borderBlockEndStyle: t.borderStyles.$solid,
          borderBlockEndColor: t.colors.$borderAlpha100,
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
      {!paymentAttempt ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Alert
            variant='danger'
            colorScheme='danger'
          >
            {error
              ? translateError(error.errors[0])
              : t(localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.notFound`))}
          </Alert>
        </Box>
      ) : (
        <Box
          elementDescriptor={descriptors.paymentAttemptRoot}
          as='article'
          sx={t => ({
            borderWidth: t.borderWidths.$normal,
            borderStyle: t.borderStyles.$solid,
            borderColor: t.colors.$borderAlpha100,
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
                  paymentAttempt.paidAt || paymentAttempt.failedAt || paymentAttempt.updatedAt,
                  'long',
                )}
              />
              <Span
                sx={t => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.space.$0x25,
                  color: t.colors.$colorMutedForeground,
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
          <PaymentAttemptBody subscriptionItem={subscriptionItem} />
          <Box
            elementDescriptor={descriptors.paymentAttemptFooter}
            as='footer'
            sx={t => ({
              paddingInline: t.space.$4,
              paddingBlock: t.space.$3,
              background: t.colors.$neutralAlpha25,
              borderBlockStartWidth: t.borderWidths.$normal,
              borderBlockStartStyle: t.borderStyles.$solid,
              borderBlockStartColor: t.colors.$borderAlpha100,
              display: 'flex',
              justifyContent: 'space-between',
            })}
          >
            <Text
              variant='h3'
              localizationKey={localizationKeys('billing.totalDue')}
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
      )}
    </>
  );
};

function PaymentAttemptBody({ subscriptionItem }: { subscriptionItem: BillingSubscriptionItemResource | undefined }) {
  if (!subscriptionItem) {
    return null;
  }

  const fee =
    subscriptionItem.planPeriod === 'month'
      ? subscriptionItem.plan.fee
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        subscriptionItem.plan.annualMonthlyFee!;

  return (
    <Box
      elementDescriptor={descriptors.paymentAttemptBody}
      sx={t => ({
        padding: t.space.$4,
      })}
    >
      <LineItems.Root>
        <LineItems.Group>
          <LineItems.Title title={subscriptionItem.plan.name} />
          <LineItems.Description
            prefix={subscriptionItem.planPeriod === 'annual' ? 'x12' : undefined}
            text={`${fee.currencySymbol}${fee.amountFormatted}`}
          />
        </LineItems.Group>
        <LineItems.Group
          borderTop
          variant='tertiary'
        >
          <LineItems.Title title={localizationKeys('billing.subtotal')} />
          <LineItems.Description
            text={`${subscriptionItem.amount?.currencySymbol}${subscriptionItem.amount?.amountFormatted}`}
          />
        </LineItems.Group>
        {subscriptionItem.credit && subscriptionItem.credit.amount.amount > 0 && (
          <LineItems.Group variant='tertiary'>
            <LineItems.Title title={localizationKeys('billing.credit')} />
            <LineItems.Description
              text={`- ${subscriptionItem.credit.amount.currencySymbol}${subscriptionItem.credit.amount.amountFormatted}`}
            />
          </LineItems.Group>
        )}
      </LineItems.Root>
    </Box>
  );
}

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
          outlineColor: t.colors.$colorRing,
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
