import { getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import { __internal_usePaymentAttemptQuery, useOrganization, useUser } from '@clerk/shared/react';
import type { BillingPaymentResource } from '@clerk/shared/types';
import { useEffect, useState } from 'react';

import { Alert } from '@/ui/elements/Alert';
import { Header } from '@/ui/elements/Header';
import { LineItems } from '@/ui/elements/LineItems';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { Tooltip } from '@/ui/elements/Tooltip';
import { toNegativeAmount } from '@/ui/utils/billing';
import { getPlanSeatLimit, getSeatsPerUnitTotal, summarizeSeatCharges } from '@/ui/utils/billingPlanSeats';
import { formatDate } from '@/ui/utils/formatDate';
import { truncateWithEndVisible } from '@/ui/utils/truncateTextWithEndVisible';

import { PrintableComponent, usePrintable } from '../../common';
import { useEnvironment } from '../../contexts';
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
import { useClipboard } from '../../hooks';
import { ArrowDownTray, Checkmark, Copy } from '../../icons';
import { useRouter } from '../../router';

export const PaymentAttemptPage = () => {
  const { params, navigate } = useRouter();
  const subscriberType = useSubscriberTypeContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { t, translateError } = useLocalizations();
  const { print, printableProps } = usePrintable();
  const requesterType = subscriberType === 'organization' ? 'organization' : 'user';

  const {
    data: paymentAttempt,
    isLoading,
    error,
  } = __internal_usePaymentAttemptQuery({
    paymentAttemptId: params.paymentAttemptId,
    for: requesterType,
    enabled: Boolean(params.paymentAttemptId),
  });

  if (isLoading) {
    return (
      <ProfileCard.Page>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spinner
            colorScheme='primary'
            sx={{ margin: 'auto', display: 'block' }}
            elementDescriptor={descriptors.spinner}
          />
        </Box>
      </ProfileCard.Page>
    );
  }

  return (
    <ProfileCard.Page>
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
        <>
          <PaymentAttemptCard
            paymentAttempt={paymentAttempt}
            onDownload={paymentAttempt.status === 'paid' ? print : undefined}
          />
          {/* Off-screen copy rendered into an iframe for the browser print / "Save as PDF" dialog.
              Mirrors the emailed billing receipt rather than the in-app card. */}
          <PrintableComponent {...printableProps}>
            <PaymentReceiptDocument paymentAttempt={paymentAttempt} />
          </PrintableComponent>
        </>
      )}
    </ProfileCard.Page>
  );
};

function PaymentAttemptCard({
  paymentAttempt,
  onDownload,
}: {
  paymentAttempt: BillingPaymentResource;
  onDownload?: () => void;
}) {
  const { $ } = useLocalizations();

  return (
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
        <Span
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            gap: t.space.$2,
          })}
        >
          {onDownload && (
            <Tooltip.Root>
              <Tooltip.Trigger>
                <Button
                  elementDescriptor={descriptors.paymentAttemptDownloadButton}
                  variant='ghost'
                  onClick={onDownload}
                  aria-label='Download receipt'
                  sx={t => ({
                    color: 'inherit',
                    width: t.sizes.$6,
                    height: t.sizes.$6,
                    padding: 0,
                  })}
                >
                  <Icon
                    size='sm'
                    icon={ArrowDownTray}
                    aria-hidden
                  />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content text={'Opens your print dialog — choose "Save as PDF" as the destination.'} />
            </Tooltip.Root>
          )}
          <Badge
            elementDescriptor={descriptors.paymentAttemptHeaderBadge}
            colorScheme={
              paymentAttempt.status === 'paid' ? 'success' : paymentAttempt.status === 'failed' ? 'danger' : 'primary'
            }
            sx={{ textTransform: 'capitalize' }}
          >
            {paymentAttempt.status}
          </Badge>
        </Span>
      </Box>
      <PaymentAttemptBody paymentAttempt={paymentAttempt} />
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
            {$(paymentAttempt.amount)}
          </Text>
        </Span>
      </Box>
    </Box>
  );
}

function PaymentAttemptBody({ paymentAttempt }: { paymentAttempt: BillingPaymentResource | undefined }) {
  const { $ } = useLocalizations();

  if (!paymentAttempt) {
    return null;
  }

  const { subscriptionItem } = paymentAttempt;

  const fee =
    subscriptionItem.planPeriod === 'month'
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        subscriptionItem.plan.fee!
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        subscriptionItem.plan.annualMonthlyFee!;

  const seatsTotal = subscriptionItem.seats != null ? getSeatsPerUnitTotal(paymentAttempt.totals) : undefined;
  const seatSummary = summarizeSeatCharges(seatsTotal);
  const seatsChargeable = seatSummary ? seatSummary.totalSeats - seatSummary.included : 0;
  const planSeatLimit = getPlanSeatLimit(subscriptionItem.plan);

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
            text={$(fee)}
          />
        </LineItems.Group>
        {seatSummary && (
          <LineItems.Group>
            <LineItems.Title
              title={
                planSeatLimit != null
                  ? localizationKeys('billing.seatsWithLimit', { limit: planSeatLimit })
                  : localizationKeys('billing.seats')
              }
              description={(() => {
                const rate = $(seatSummary.paidTier.feePerBlock);
                const isSingular = seatsChargeable === 1;
                if (seatSummary.included > 0) {
                  return isSingular
                    ? localizationKeys('billing.seatBreakdownIncludedSingular', {
                        totalSeats: seatSummary.totalSeats,
                        included: seatSummary.included,
                        rate,
                      })
                    : localizationKeys('billing.seatBreakdownIncludedPlural', {
                        totalSeats: seatSummary.totalSeats,
                        included: seatSummary.included,
                        chargeable: seatsChargeable,
                        rate,
                      });
                }
                return isSingular
                  ? localizationKeys('billing.seatBreakdownSingular', { rate })
                  : localizationKeys('billing.seatBreakdownPlural', { chargeable: seatsChargeable, rate });
              })()}
            />
            <LineItems.Description
              prefix={subscriptionItem.planPeriod === 'annual' ? 'x12' : undefined}
              text={$(seatSummary.paidTier.total)}
            />
          </LineItems.Group>
        )}
        <LineItems.Group
          borderTop
          variant='tertiary'
        >
          <LineItems.Title title={localizationKeys('billing.subtotal')} />
          <LineItems.Description text={paymentAttempt.totals?.subtotal ? $(paymentAttempt.totals.subtotal) : ''} />
        </LineItems.Group>
        {paymentAttempt.totals?.discounts?.proration && paymentAttempt.totals.discounts.proration.amount.amount > 0 && (
          <LineItems.Group variant='tertiary'>
            <LineItems.Title title={localizationKeys('billing.proratedDiscount')} />
            <LineItems.Description text={$(toNegativeAmount(paymentAttempt.totals.discounts.proration.amount))} />
          </LineItems.Group>
        )}
        {subscriptionItem.credits &&
          subscriptionItem.credits.proration &&
          subscriptionItem.credits.proration.amount.amount > 0 && (
            <LineItems.Group variant='tertiary'>
              <LineItems.Title title={localizationKeys('billing.prorationCredit')} />
              <LineItems.Description text={$(toNegativeAmount(subscriptionItem.credits.proration.amount))} />
            </LineItems.Group>
          )}
        {subscriptionItem.credits &&
          subscriptionItem.credits.payer &&
          subscriptionItem.credits.payer.appliedAmount.amount > 0 && (
            <LineItems.Group variant='tertiary'>
              <LineItems.Title title={localizationKeys('billing.accountCredit')} />
              <LineItems.Description text={$(toNegativeAmount(subscriptionItem.credits.payer.appliedAmount))} />
            </LineItems.Group>
          )}
      </LineItems.Root>
    </Box>
  );
}

const RECEIPT_MUTED = '#757575';

// NOTE: The receipt below is styled with inline `style` attributes rather than the `sx`/emotion
// system on purpose. `PrintableComponent` clones this markup into a print iframe and copies emotion
// styles by reading the `<style>` tags' text — which is empty in production ("speedy" mode inserts
// rules straight into the CSSOM), so emotion styling is dropped in the print output. Inline styles
// travel with the cloned HTML and render reliably in both dev and production.

function ReceiptDivider() {
  return <div style={{ borderBlockStart: '1px dashed #B7B8C2', marginBlock: '12px' }} />;
}

function ReceiptDetailRow({ label, value }: { label: string; value: string }) {
  if (!value) {
    return null;
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', paddingBlockEnd: '12px' }}>
      <span style={{ color: RECEIPT_MUTED, fontSize: '12px', lineHeight: '18px' }}>{label}</span>
      <span style={{ color: '#000000', fontSize: '12px', lineHeight: '18px' }}>{value}</span>
    </div>
  );
}

/**
 * Fetches an image and returns it as a base64 data URI, or `null` until ready / on failure.
 * Inlining the logo this way means the printable receipt is fully self-contained, so it renders
 * synchronously when `PrintableComponent` clones it into the print iframe (an `<img>` pointing at a
 * remote URL would not load before `window.print()` fires).
 */
function useImageDataUrl(url: string | undefined): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setDataUrl(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(url, { mode: 'cors' });
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled && typeof reader.result === 'string') {
            setDataUrl(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch {
        if (!cancelled) {
          setDataUrl(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return dataUrl;
}

/**
 * Print/PDF representation of a payment, styled to mirror the emailed billing receipt
 * (`billing_receipt` template) rather than the in-app card. Rendered off-screen inside
 * `PrintableComponent` and cloned into the browser's print dialog.
 */
function PaymentReceiptDocument({ paymentAttempt }: { paymentAttempt: BillingPaymentResource }) {
  const { $ } = useLocalizations();
  const subscriberType = useSubscriberTypeContext();
  const { applicationName, logoImageUrl } = useEnvironment().displayConfig;
  const logoDataUrl = useImageDataUrl(logoImageUrl);
  const { user } = useUser();
  const { organization } = useOrganization();

  const { subscriptionItem } = paymentAttempt;
  const fee =
    subscriptionItem.planPeriod === 'month'
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        subscriptionItem.plan.fee!
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        subscriptionItem.plan.annualMonthlyFee!;

  const seatsTotal = subscriptionItem.seats != null ? getSeatsPerUnitTotal(paymentAttempt.totals) : undefined;
  const seatSummary = summarizeSeatCharges(seatsTotal);
  const seatsChargeable = seatSummary ? seatSummary.totalSeats - seatSummary.included : 0;
  const planSeatLimit = getPlanSeatLimit(subscriptionItem.plan);

  const proration = subscriptionItem.credits?.proration;
  const hasProration = Boolean(proration && proration.amount.amount > 0);
  const payerCredit = subscriptionItem.credits?.payer;
  const hasPayerCredit = Boolean(payerCredit && payerCredit.appliedAmount.amount > 0);

  const receiptDate = paymentAttempt.paidAt ?? paymentAttempt.updatedAt;
  const payerName =
    subscriberType === 'organization'
      ? (organization?.name ?? '')
      : user
        ? (user.fullName ?? getIdentifier(user) ?? '')
        : '';

  const paymentMethod = paymentAttempt.paymentMethod;
  const paymentMethodLabel = paymentMethod
    ? (paymentMethod.walletType ??
      [paymentMethod.cardType, paymentMethod.last4 ? `•••• ${paymentMethod.last4}` : null].filter(Boolean).join(' '))
    : '';

  const subscriptionRange = subscriptionItem.periodStart
    ? `(${formatDate(subscriptionItem.periodStart, 'long')}${
        subscriptionItem.periodEnd ? ` - ${formatDate(subscriptionItem.periodEnd, 'long')}` : ''
      })`
    : '';

  return (
    <div
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: '#111827',
        maxWidth: '600px',
        marginInline: 'auto',
        padding: '24px',
        background: '#ffffff',
      }}
    >
      {logoDataUrl ? (
        <img
          src={logoDataUrl}
          alt={applicationName}
          style={{ height: '32px', display: 'block', marginBlockEnd: '16px' }}
        />
      ) : (
        <div
          style={{ fontSize: '18px', lineHeight: '26px', fontWeight: 700, color: '#111827', marginBlockEnd: '16px' }}
        >
          {applicationName}
        </div>
      )}

      <div style={{ border: '1px solid #EEEEF0', borderRadius: '10px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 700, color: '#000000' }}>Receipt</span>
          <span style={{ fontSize: '14px', lineHeight: '21px', color: RECEIPT_MUTED }}>
            {formatDate(receiptDate, 'long')}
          </span>
        </div>

        <ReceiptDivider />

        <div style={{ color: RECEIPT_MUTED, fontSize: '12px', lineHeight: '18px', paddingBlockEnd: '8px' }}>Plan</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', paddingBlockEnd: '8px' }}>
          <span style={{ fontSize: '14px', lineHeight: '21px', color: '#000000' }}>{subscriptionItem.plan.name}</span>
          <span style={{ fontSize: '14px', lineHeight: '21px', color: '#000000' }}>
            {subscriptionItem.planPeriod === 'annual' ? 'x12 ' : ''}
            {$(fee)}
          </span>
        </div>

        {seatSummary && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', paddingBlockEnd: '4px' }}>
              <span style={{ color: RECEIPT_MUTED, fontSize: '12px', lineHeight: '18px' }}>
                {seatsChargeable} seats × {$(seatSummary.paidTier.feePerBlock)} per seat
              </span>
              <span style={{ fontSize: '14px', lineHeight: '21px', color: '#000000' }}>
                {$(seatSummary.paidTier.total)}
              </span>
            </div>
            <div style={{ color: '#aaaaaa', fontSize: '11px', lineHeight: '17px', paddingBlockEnd: '8px' }}>
              {planSeatLimit != null
                ? `Seats (${seatSummary.totalSeats} of ${planSeatLimit} used)`
                : `Seats (${seatSummary.totalSeats} used)`}
              {seatSummary.included > 0 ? ` (${seatSummary.included} included)` : ''}
            </div>
          </>
        )}

        {hasProration && proration && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', paddingBlockEnd: '8px' }}>
            <div>
              <div style={{ color: RECEIPT_MUTED, fontSize: '12px', lineHeight: '18px' }}>Proration</div>
              <div style={{ color: RECEIPT_MUTED, fontSize: '10px', lineHeight: '15px' }}>
                Prorated credit for the remainder of your subscription.
              </div>
            </div>
            <span style={{ fontSize: '14px', lineHeight: '21px', color: '#000000' }}>
              {$(toNegativeAmount(proration.amount))}
            </span>
          </div>
        )}

        {hasPayerCredit && payerCredit && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', paddingBlockEnd: '8px' }}>
            <div>
              <div style={{ color: RECEIPT_MUTED, fontSize: '12px', lineHeight: '18px' }}>Credit</div>
              <div style={{ color: RECEIPT_MUTED, fontSize: '10px', lineHeight: '15px' }}>
                Applied from your credit balance.
              </div>
            </div>
            <span style={{ fontSize: '14px', lineHeight: '21px', color: '#000000' }}>
              {$(toNegativeAmount(payerCredit.appliedAmount))}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: RECEIPT_MUTED, fontSize: '12px', lineHeight: '18px' }}>Total paid</span>
          <span style={{ fontSize: '24px', lineHeight: '36px', fontWeight: 700, color: '#000000' }}>
            {$(paymentAttempt.amount)}
          </span>
        </div>

        <ReceiptDivider />

        <ReceiptDetailRow
          label='Paid on'
          value={paymentAttempt.paidAt ? formatDate(paymentAttempt.paidAt, 'long') : ''}
        />
        <ReceiptDetailRow
          label='Payment method'
          value={paymentMethodLabel}
        />
        <ReceiptDetailRow
          label='Payment ID'
          value={paymentAttempt.id}
        />
        <ReceiptDetailRow
          label='Subscription period'
          value={subscriptionRange}
        />
        <ReceiptDetailRow
          label='Paid by'
          value={payerName}
        />

        <div style={{ fontSize: '12px', lineHeight: '18px', color: '#000000', paddingBlockStart: '4px' }}>
          If you have questions about this receipt, please contact an administrator.
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text, copyLabel = 'Copy' }: { text: string; copyLabel?: string }) {
  const { onCopy, hasCopied } = useClipboard(text);

  return (
    <Button
      elementDescriptor={descriptors.paymentAttemptCopyButton}
      variant='unstyled'
      onClick={() => onCopy()}
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
        icon={hasCopied ? Checkmark : Copy}
        aria-hidden
      />
    </Button>
  );
}
