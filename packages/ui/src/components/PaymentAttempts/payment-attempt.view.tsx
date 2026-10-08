import { Alert } from '@/ui/elements/Alert';
import { Header } from '@/ui/elements/Header';
import { LineItems } from '@/ui/elements/LineItems';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { truncateWithEndVisible } from '@/ui/utils/truncateTextWithEndVisible';

import { Badge, Box, descriptors, Heading, localizationKeys, Span, Spinner, Text } from '../../customizables';
import type { PaymentAttemptData, PaymentAttemptPageData } from './payment-attempt.types';
import { PaymentAttemptCopy } from './payment-attempt-copy';

export const PaymentAttemptView = ({
  isLoading,
  localizationRoot,
  errorText,
  attempt,
  onBack,
}: PaymentAttemptPageData) => {
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
        <Header.BackLink onClick={onBack}>
          <Header.Title
            localizationKey={localizationKeys(`${localizationRoot}.billingPage.start.headerTitle__payments`)}
            textVariant='h2'
          />
        </Header.BackLink>
      </Header.Root>
      {!attempt ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Alert
            variant='danger'
            colorScheme='danger'
          >
            {errorText}
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
                localizationKey={attempt.title}
              />
              <Span
                sx={t => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.space.$0x25,
                  color: t.colors.$colorMutedForeground,
                })}
              >
                <PaymentAttemptCopy
                  copyLabel='Copy payment attempt ID'
                  text={attempt.id}
                />
                <Text
                  colorScheme='secondary'
                  variant='subtitle'
                >
                  {truncateWithEndVisible(attempt.id)}
                </Text>
              </Span>
            </Span>
            <Badge
              elementDescriptor={descriptors.paymentAttemptHeaderBadge}
              colorScheme={attempt.status === 'paid' ? 'success' : attempt.status === 'failed' ? 'danger' : 'primary'}
              sx={{ textTransform: 'capitalize' }}
            >
              {attempt.status}
            </Badge>
          </Box>
          <PaymentAttemptBody attempt={attempt} />
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
                {attempt.currency}
              </Text>
              <Text
                variant='h3'
                elementDescriptor={descriptors.paymentAttemptFooterValue}
              >
                {attempt.total}
              </Text>
            </Span>
          </Box>
        </Box>
      )}
    </ProfileCard.Page>
  );
};

function PaymentAttemptBody({ attempt }: { attempt: PaymentAttemptData }) {
  const seats = attempt.seats;
  const seatsLabel = seats
    ? seats.planSeatLimit != null
      ? localizationKeys('billing.seatsWithLimit', { limit: seats.planSeatLimit })
      : localizationKeys('billing.seats')
    : null;
  const seatsDescription = seats
    ? seats.included > 0
      ? seats.chargeable === 1
        ? localizationKeys('billing.seatBreakdownIncludedSingular', {
            totalSeats: seats.totalSeats,
            included: seats.included,
            rate: seats.rate,
          })
        : localizationKeys('billing.seatBreakdownIncludedPlural', {
            totalSeats: seats.totalSeats,
            included: seats.included,
            chargeable: seats.chargeable,
            rate: seats.rate,
          })
      : seats.chargeable === 1
        ? localizationKeys('billing.seatBreakdownSingular', { rate: seats.rate })
        : localizationKeys('billing.seatBreakdownPlural', { chargeable: seats.chargeable, rate: seats.rate })
    : null;

  return (
    <Box
      elementDescriptor={descriptors.paymentAttemptBody}
      sx={t => ({ padding: t.space.$4 })}
    >
      <LineItems.Root>
        <LineItems.Group>
          <LineItems.Title title={attempt.planName} />
          <LineItems.Description
            prefix={attempt.isAnnual ? 'x12' : undefined}
            text={attempt.fee}
          />
        </LineItems.Group>
        {seats && (
          <LineItems.Group>
            <LineItems.Title
              title={seatsLabel ?? undefined}
              description={seatsDescription ?? undefined}
            />
            <LineItems.Description
              prefix={attempt.isAnnual ? 'x12' : undefined}
              text={seats.total}
            />
          </LineItems.Group>
        )}
        <LineItems.Group
          borderTop
          variant='tertiary'
        >
          <LineItems.Title title={localizationKeys('billing.subtotal')} />
          <LineItems.Description text={attempt.subtotal} />
        </LineItems.Group>
        {attempt.proration && (
          <LineItems.Group variant='tertiary'>
            <LineItems.Title title={localizationKeys('billing.proratedDiscount')} />
            <LineItems.Description text={attempt.proration} />
          </LineItems.Group>
        )}
        {attempt.catalogDiscount && (
          <LineItems.Group variant='tertiary'>
            <LineItems.Title
              title={attempt.catalogDiscount.name}
              description={attempt.catalogDiscount.description}
              badge={attempt.catalogDiscount.promoCode ? <Badge>{attempt.catalogDiscount.promoCode}</Badge> : null}
            />
            <LineItems.Description text={attempt.catalogDiscount.amount} />
          </LineItems.Group>
        )}
        {attempt.creditProration && (
          <LineItems.Group variant='tertiary'>
            <LineItems.Title title={localizationKeys('billing.prorationCredit')} />
            <LineItems.Description text={attempt.creditProration} />
          </LineItems.Group>
        )}
        {attempt.payerCredit && (
          <LineItems.Group variant='tertiary'>
            <LineItems.Title title={localizationKeys('billing.accountCredit')} />
            <LineItems.Description text={attempt.payerCredit} />
          </LineItems.Group>
        )}
      </LineItems.Root>
    </Box>
  );
}
