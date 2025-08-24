import { __experimental_useCheckout as useCheckout, useOrganization } from '@clerk/shared/react';
import type { CommerceMoneyAmount, CommercePaymentSourceResource, ConfirmCheckoutParams } from '@clerk/types';
import { useMemo, useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Drawer } from '@/ui/elements/Drawer';
import { LineItems } from '@/ui/elements/LineItems';
import { SegmentedControl } from '@/ui/elements/SegmentedControl';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { Tooltip } from '@/ui/elements/Tooltip';
import { handleError } from '@/ui/utils/errorHandler';

import { DevOnly } from '../../common/DevOnly';
import { useCheckoutContext, usePaymentMethods } from '../../contexts';
import { Box, Button, Col, descriptors, Flex, Form, localizationKeys, Text } from '../../customizables';
import { ChevronUpDown, InformationCircle } from '../../icons';
import * as AddPaymentSource from '../PaymentSources/AddPaymentSource';
import { PaymentSourceRow } from '../PaymentSources/PaymentSourceRow';
import { SubscriptionBadge } from '../Subscriptions/badge';

type PaymentMethodSource = 'existing' | 'new';

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);

export const CheckoutForm = withCardStateProvider(() => {
  const { checkout } = useCheckout();

  const { id, plan, totals, isImmediatePlanChange, planPeriod, freeTrialEndsAt } = checkout;

  if (!id) {
    return null;
  }

  const showCredits = !!totals.credit?.amount && totals.credit.amount > 0;
  const showPastDue = !!totals.pastDue?.amount && totals.pastDue.amount > 0;
  const showDowngradeInfo = !isImmediatePlanChange;

  const fee = planPeriod === 'month' ? plan.fee : plan.annualMonthlyFee;

  return (
    <Drawer.Body>
      <Box
        elementDescriptor={descriptors.checkoutFormLineItemsRoot}
        sx={t => ({
          padding: t.space.$4,
          borderBottomWidth: t.borderWidths.$normal,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$borderAlpha100,
        })}
      >
        <LineItems.Root>
          <LineItems.Group>
            <LineItems.Title
              title={plan.name}
              description={planPeriod === 'annual' ? localizationKeys('commerce.billedAnnually') : undefined}
              badge={
                plan.freeTrialEnabled && freeTrialEndsAt ? (
                  <SubscriptionBadge subscription={{ status: 'free_trial' }} />
                ) : null
              }
            />
            <LineItems.Description
              prefix={planPeriod === 'annual' ? 'x12' : undefined}
              text={`${fee.currencySymbol}${fee.amountFormatted}`}
              suffix={localizationKeys('commerce.checkout.perMonth')}
            />
          </LineItems.Group>
          <LineItems.Group
            borderTop
            variant='tertiary'
          >
            <LineItems.Title title={localizationKeys('commerce.subtotal')} />
            <LineItems.Description text={`${totals.subtotal.currencySymbol}${totals.subtotal.amountFormatted}`} />
          </LineItems.Group>
          {showCredits && (
            <LineItems.Group variant='tertiary'>
              <LineItems.Title title={localizationKeys('commerce.creditRemainder')} />
              <LineItems.Description text={`- ${totals.credit?.currencySymbol}${totals.credit?.amountFormatted}`} />
            </LineItems.Group>
          )}
          {showPastDue && (
            <LineItems.Group variant='tertiary'>
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <LineItems.Title
                    title={localizationKeys('commerce.pastDue')}
                    icon={InformationCircle}
                  />
                </Tooltip.Trigger>
                <Tooltip.Content text={localizationKeys('commerce.checkout.pastDueNotice')} />
              </Tooltip.Root>
              <LineItems.Description text={`${totals.pastDue?.currencySymbol}${totals.pastDue?.amountFormatted}`} />
            </LineItems.Group>
          )}

          {!!freeTrialEndsAt && !!plan.freeTrialDays && (
            <LineItems.Group variant='tertiary'>
              <LineItems.Title
                title={localizationKeys('commerce.checkout.totalDueAfterTrial', {
                  days: plan.freeTrialDays,
                })}
              />
              <LineItems.Description
                text={`${totals.grandTotal?.currencySymbol}${totals.grandTotal?.amountFormatted}`}
              />
            </LineItems.Group>
          )}

          <LineItems.Group borderTop>
            <LineItems.Title title={localizationKeys('commerce.totalDueToday')} />
            <LineItems.Description text={`${totals.totalDueNow.currencySymbol}${totals.totalDueNow.amountFormatted}`} />
          </LineItems.Group>
        </LineItems.Root>
      </Box>

      {showDowngradeInfo && (
        <Box
          elementDescriptor={descriptors.checkoutFormLineItemsRoot}
          sx={t => ({
            paddingBlockStart: t.space.$4,
            paddingInline: t.space.$4,
          })}
        >
          <Text
            localizationKey={localizationKeys('commerce.checkout.downgradeNotice')}
            variant='caption'
            colorScheme='secondary'
          />
        </Box>
      )}

      <CheckoutFormElements />
    </Drawer.Body>
  );
});

const useCheckoutMutations = () => {
  const { organization } = useOrganization();
  const { for: _for, onSubscriptionComplete } = useCheckoutContext();
  const { checkout } = useCheckout();
  const { id, confirm } = checkout;
  const card = useCardState();

  if (!id) {
    throw new Error('Checkout not found');
  }

  const confirmCheckout = async (params: ConfirmCheckoutParams) => {
    card.setLoading();
    card.setError(undefined);

    const { data, error } = await confirm({
      ...params,
      // TODO(@COMMERCE): Come back to this, this should not be needed
      ...(_for === 'organization' ? { orgId: organization?.id } : {}),
    });

    if (error) {
      handleError(error, [], card.setError);
    } else if (data) {
      onSubscriptionComplete?.();
    }
    card.setIdle();
  };

  const payWithExistingPaymentSource = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const paymentSourceId = data.get('payment_source_id') as string;

    return confirmCheckout({
      paymentSourceId,
    });
  };

  const addPaymentSourceAndPay = (ctx: { gateway: 'stripe'; paymentToken: string }) => confirmCheckout(ctx);

  const payWithTestCard = () =>
    confirmCheckout({
      gateway: 'stripe',
      useTestCard: true,
    });

  return {
    payWithExistingPaymentSource,
    addPaymentSourceAndPay,
    payWithTestCard,
  };
};

const CheckoutFormElements = () => {
  const { checkout } = useCheckout();
  const { id, totals, freeTrialEndsAt } = checkout;
  const { data: paymentSources } = usePaymentMethods();

  const [paymentMethodSource, setPaymentMethodSource] = useState<PaymentMethodSource>(() =>
    paymentSources.length > 0 ? 'existing' : 'new',
  );

  if (!id) {
    return null;
  }

  return (
    <Col
      elementDescriptor={descriptors.checkoutFormElementsRoot}
      gap={4}
      sx={t => ({ padding: t.space.$4 })}
    >
      {/* only show if there are payment sources and there is a total due now */}
      {paymentSources.length > 0 && (totals.totalDueNow.amount > 0 || !!freeTrialEndsAt) && (
        <SegmentedControl.Root
          aria-label='Payment method source'
          value={paymentMethodSource}
          onChange={value => setPaymentMethodSource(value as PaymentMethodSource)}
          size='lg'
          fullWidth
        >
          <SegmentedControl.Button
            value='existing'
            text={localizationKeys('commerce.paymentMethods')}
          />
          <SegmentedControl.Button
            value='new'
            text={localizationKeys('commerce.addPaymentMethod')}
          />
        </SegmentedControl.Root>
      )}

      {paymentMethodSource === 'existing' && (
        <ExistingPaymentSourceForm
          paymentSources={paymentSources}
          totalDueNow={totals.totalDueNow}
        />
      )}

      {paymentMethodSource === 'new' && <AddPaymentSourceForCheckout />}
    </Col>
  );
};

export const PayWithTestPaymentSource = () => {
  const { isLoading } = useCardState();
  const { payWithTestCard } = useCheckoutMutations();

  return (
    <Box
      sx={t => ({
        background: t.colors.$neutralAlpha50,
        padding: t.space.$2x5,
        borderRadius: t.radii.$md,
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha100,
        display: 'flex',
        flexDirection: 'column',
        rowGap: t.space.$2,
        position: 'relative',
      })}
    >
      <Box
        sx={t => ({
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(-45deg,${t.colors.$warningAlpha100},${t.colors.$warningAlpha100} 6px,${t.colors.$warningAlpha150} 6px,${t.colors.$warningAlpha150} 12px)`,
          maskImage: `linear-gradient(transparent 20%, black)`,
          pointerEvents: 'none',
        })}
      />
      <Flex
        sx={t => ({
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          rowGap: t.space.$2,
        })}
      >
        <Text
          sx={t => ({
            color: t.colors.$warning500,
            fontWeight: t.fontWeights.$semibold,
          })}
          localizationKey={localizationKeys('commerce.paymentSource.dev.developmentMode')}
        />
        <Button
          type='button'
          block
          variant='bordered'
          localizationKey={localizationKeys('userProfile.billingPage.paymentSourcesSection.payWithTestCardButton')}
          colorScheme='secondary'
          isLoading={isLoading}
          onClick={payWithTestCard}
        />
      </Flex>
    </Box>
  );
};

const useSubmitLabel = () => {
  const { checkout } = useCheckout();
  const { status, freeTrialEndsAt, totals } = checkout;

  if (status === 'needs_initialization') {
    throw new Error('Clerk: Invalid state');
  }

  if (freeTrialEndsAt) {
    return localizationKeys('commerce.startFreeTrial');
  }

  if (totals.totalDueNow.amount > 0) {
    return localizationKeys('commerce.pay', {
      amount: `${totals.totalDueNow.currencySymbol}${totals.totalDueNow.amountFormatted}`,
    });
  }

  return localizationKeys('commerce.subscribe');
};

const AddPaymentSourceForCheckout = withCardStateProvider(() => {
  const { addPaymentSourceAndPay } = useCheckoutMutations();
  const submitLabel = useSubmitLabel();
  const { checkout } = useCheckout();

  return (
    <AddPaymentSource.Root
      onSuccess={addPaymentSourceAndPay}
      checkout={checkout}
    >
      <DevOnly>
        <PayWithTestPaymentSource />
      </DevOnly>

      <AddPaymentSource.FormButton text={submitLabel} />
    </AddPaymentSource.Root>
  );
});

const ExistingPaymentSourceForm = withCardStateProvider(
  ({
    totalDueNow,
    paymentSources,
  }: {
    totalDueNow: CommerceMoneyAmount;
    paymentSources: CommercePaymentSourceResource[];
  }) => {
    const submitLabel = useSubmitLabel();
    const { checkout } = useCheckout();
    const { paymentSource, freeTrialEndsAt } = checkout;

    const { payWithExistingPaymentSource } = useCheckoutMutations();
    const card = useCardState();
    const [selectedPaymentSource, setSelectedPaymentSource] = useState<CommercePaymentSourceResource | undefined>(
      paymentSource || paymentSources.find(p => p.isDefault),
    );

    const options = useMemo(() => {
      return paymentSources.map(source => {
        const label =
          source.paymentMethod !== 'card'
            ? `${capitalize(source.paymentMethod)}`
            : `${capitalize(source.cardType)} ⋯ ${source.last4}`;

        return {
          value: source.id,
          label,
        };
      });
    }, [paymentSources]);

    const shouldDefaultBeUsed = totalDueNow.amount === 0 || !freeTrialEndsAt;

    return (
      <Form
        onSubmit={payWithExistingPaymentSource}
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          rowGap: t.space.$4,
        })}
      >
        {shouldDefaultBeUsed ? (
          <Select
            elementId='paymentSource'
            options={options}
            value={selectedPaymentSource?.id || null}
            onChange={option => {
              const paymentSource = paymentSources.find(source => source.id === option.value);
              setSelectedPaymentSource(paymentSource);
            }}
            portal
          >
            {/*Store value inside an input in order to be accessible as form data*/}
            <input
              name='payment_source_id'
              type='hidden'
              value={selectedPaymentSource?.id}
            />
            <SelectButton
              icon={ChevronUpDown}
              sx={t => ({
                justifyContent: 'space-between',
                backgroundColor: t.colors.$colorBackground,
              })}
            >
              {selectedPaymentSource && <PaymentSourceRow paymentSource={selectedPaymentSource} />}
            </SelectButton>
            <SelectOptionList
              sx={t => ({
                paddingBlock: t.space.$1,
                color: t.colors.$colorForeground,
              })}
            />
          </Select>
        ) : (
          <input
            name='payment_source_id'
            type='hidden'
            value={selectedPaymentSource?.id}
          />
        )}
        <Card.Alert>{card.error}</Card.Alert>
        <Button
          type='submit'
          colorScheme='primary'
          size='sm'
          textVariant={'buttonLarge'}
          sx={{
            width: '100%',
          }}
          isLoading={card.isLoading}
          localizationKey={submitLabel}
        />
      </Form>
    );
  },
);
