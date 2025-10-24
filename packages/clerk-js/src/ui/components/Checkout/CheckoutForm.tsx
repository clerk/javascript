import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';
import type { BillingMoneyAmount, BillingPaymentMethodResource, ConfirmCheckoutParams } from '@clerk/types';
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
import { useCheckoutContext, useEnvironment, usePaymentMethods } from '../../contexts';
import { Box, Button, Col, descriptors, Flex, Form, localizationKeys, Spinner, Text } from '../../customizables';
import { ChevronUpDown, InformationCircle } from '../../icons';
import type { PropsOfComponent, ThemableCssProp } from '../../styledSystem';
import * as AddPaymentMethod from '../PaymentMethods/AddPaymentMethod';
import { PaymentMethodRow } from '../PaymentMethods/PaymentMethodRow';
import { SubscriptionBadge } from '../Subscriptions/badge';

type PaymentMethodSource = 'existing' | 'new';

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);

const HIDDEN_INPUT_NAME = 'payment_method_id';

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
              description={planPeriod === 'annual' ? localizationKeys('billing.billedAnnually') : undefined}
              badge={
                plan.freeTrialEnabled && freeTrialEndsAt ? (
                  <SubscriptionBadge subscription={{ status: 'free_trial' }} />
                ) : null
              }
            />
            <LineItems.Description
              prefix={planPeriod === 'annual' ? 'x12' : undefined}
              text={`${fee.currencySymbol}${fee.amountFormatted}`}
              suffix={localizationKeys('billing.checkout.perMonth')}
            />
          </LineItems.Group>
          <LineItems.Group
            borderTop
            variant='tertiary'
          >
            <LineItems.Title title={localizationKeys('billing.subtotal')} />
            <LineItems.Description text={`${totals.subtotal.currencySymbol}${totals.subtotal.amountFormatted}`} />
          </LineItems.Group>
          {showCredits && (
            <LineItems.Group variant='tertiary'>
              <LineItems.Title title={localizationKeys('billing.creditRemainder')} />
              <LineItems.Description text={`- ${totals.credit?.currencySymbol}${totals.credit?.amountFormatted}`} />
            </LineItems.Group>
          )}
          {showPastDue && (
            <LineItems.Group variant='tertiary'>
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <LineItems.Title
                    title={localizationKeys('billing.pastDue')}
                    icon={InformationCircle}
                  />
                </Tooltip.Trigger>
                <Tooltip.Content text={localizationKeys('billing.checkout.pastDueNotice')} />
              </Tooltip.Root>
              <LineItems.Description text={`${totals.pastDue?.currencySymbol}${totals.pastDue?.amountFormatted}`} />
            </LineItems.Group>
          )}

          {!!freeTrialEndsAt && !!plan.freeTrialDays && (
            <LineItems.Group variant='tertiary'>
              <LineItems.Title
                title={localizationKeys('billing.checkout.totalDueAfterTrial', {
                  days: plan.freeTrialDays,
                })}
              />
              <LineItems.Description
                text={`${totals.grandTotal?.currencySymbol}${totals.grandTotal?.amountFormatted}`}
              />
            </LineItems.Group>
          )}

          <LineItems.Group borderTop>
            <LineItems.Title title={localizationKeys('billing.totalDueToday')} />
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
            localizationKey={localizationKeys('billing.checkout.downgradeNotice')}
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
  const { onSubscriptionComplete } = useCheckoutContext();
  const { checkout } = useCheckout();
  const { id, confirm } = checkout;
  const card = useCardState();

  if (!id) {
    throw new Error('Checkout not found');
  }

  const confirmCheckout = async (params: ConfirmCheckoutParams) => {
    card.setLoading();
    card.setError(undefined);

    const { data, error } = await confirm(params);

    if (error) {
      handleError(error, [], card.setError);
    } else if (data) {
      onSubscriptionComplete?.();
    }
    card.setIdle();
  };

  const payWithExistingPaymentMethod = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const paymentSourceId = data.get(HIDDEN_INPUT_NAME) as string;

    return confirmCheckout({
      paymentSourceId,
    });
  };

  const payWithoutPaymentMethod = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return confirmCheckout({});
  };

  const addPaymentMethodAndPay = (ctx: { gateway: 'stripe'; paymentToken: string }) => confirmCheckout(ctx);

  const payWithTestCard = () =>
    confirmCheckout({
      gateway: 'stripe',
      useTestCard: true,
    });

  return {
    payWithExistingPaymentMethod,
    addPaymentMethodAndPay,
    payWithTestCard,
    payWithoutPaymentMethod,
  };
};

const CheckoutFormElements = () => {
  const { checkout } = useCheckout();
  const { id } = checkout;

  const { isLoading } = usePaymentMethods();

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <Spinner
        sx={{
          margin: 'auto',
        }}
      />
    );
  }

  return <CheckoutFormElementsInternal />;
};

const CheckoutFormElementsInternal = () => {
  const { checkout } = useCheckout();
  const { id, totals, isImmediatePlanChange, freeTrialEndsAt } = checkout;
  const { data: paymentMethods } = usePaymentMethods();
  const environment = useEnvironment();

  const [paymentMethodSource, setPaymentMethodSource] = useState<PaymentMethodSource>(() =>
    paymentMethods.length > 0 || __BUILD_DISABLE_RHC__ ? 'existing' : 'new',
  );

  const isFreeTrial = Boolean(freeTrialEndsAt);
  const showTabs = isImmediatePlanChange && (totals.totalDueNow.amount > 0 || isFreeTrial);
  const needsPaymentMethod = !(isFreeTrial && !environment.commerceSettings.billing.freeTrialRequiresPaymentMethod);

  if (!id) {
    return null;
  }

  return (
    <Col
      elementDescriptor={descriptors.checkoutFormElementsRoot}
      gap={4}
      sx={t => ({ padding: t.space.$4 })}
    >
      {__BUILD_DISABLE_RHC__ ? null : (
        <>
          {paymentMethods.length > 0 && showTabs && needsPaymentMethod && (
            <SegmentedControl.Root
              aria-label='Payment method source'
              value={paymentMethodSource}
              onChange={value => setPaymentMethodSource(value as PaymentMethodSource)}
              size='lg'
              fullWidth
            >
              <SegmentedControl.Button
                value='existing'
                text={localizationKeys('billing.paymentMethods__label')}
              />
              <SegmentedControl.Button
                value='new'
                text={localizationKeys('billing.addPaymentMethod__label')}
              />
            </SegmentedControl.Root>
          )}
        </>
      )}

      {paymentMethodSource === 'existing' &&
        (needsPaymentMethod ? (
          <ExistingPaymentMethodForm
            paymentMethods={paymentMethods}
            totalDueNow={totals.totalDueNow}
          />
        ) : (
          <FreeTrialButton />
        ))}

      {__BUILD_DISABLE_RHC__ ? null : paymentMethodSource === 'new' && <AddPaymentMethodForCheckout />}
    </Col>
  );
};

export const PayWithTestPaymentMethod = () => {
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
          localizationKey={localizationKeys('billing.paymentMethod.dev.developmentMode')}
        />
        <Button
          type='button'
          block
          variant='bordered'
          localizationKey={localizationKeys('userProfile.billingPage.paymentMethodsSection.payWithTestCardButton')}
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
    return localizationKeys('billing.startFreeTrial');
  }

  if (totals.totalDueNow.amount > 0) {
    return localizationKeys('billing.pay', {
      amount: `${totals.totalDueNow.currencySymbol}${totals.totalDueNow.amountFormatted}`,
    });
  }

  return localizationKeys('billing.subscribe');
};

const FreeTrialButton = withCardStateProvider(() => {
  const { for: _for } = useCheckoutContext();
  const { payWithoutPaymentMethod } = useCheckoutMutations();
  const card = useCardState();

  return (
    <Form
      onSubmit={payWithoutPaymentMethod}
      sx={formProps}
    >
      <Card.Alert>{card.error}</Card.Alert>
      <CheckoutSubmitButton />
    </Form>
  );
});

const AddPaymentMethodForCheckout = withCardStateProvider(() => {
  const { addPaymentMethodAndPay } = useCheckoutMutations();
  const submitLabel = useSubmitLabel();
  const { checkout } = useCheckout();

  return (
    <AddPaymentMethod.Root
      onSuccess={addPaymentMethodAndPay}
      checkout={checkout}
    >
      <DevOnly>
        <PayWithTestPaymentMethod />
      </DevOnly>

      <AddPaymentMethod.FormButton text={submitLabel} />
    </AddPaymentMethod.Root>
  );
});

const CheckoutSubmitButton = (props: PropsOfComponent<typeof Button>) => {
  const card = useCardState();
  const submitLabel = useSubmitLabel();

  return (
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
      {...props}
    />
  );
};

const formProps: ThemableCssProp = t => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: t.space.$4,
});

const ExistingPaymentMethodForm = withCardStateProvider(
  ({
    totalDueNow,
    paymentMethods,
  }: {
    totalDueNow: BillingMoneyAmount;
    paymentMethods: BillingPaymentMethodResource[];
  }) => {
    const { checkout } = useCheckout();
    const { paymentMethod, isImmediatePlanChange, freeTrialEndsAt } = checkout;
    const environment = useEnvironment();

    const { payWithExistingPaymentMethod } = useCheckoutMutations();
    const card = useCardState();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<BillingPaymentMethodResource | undefined>(
      paymentMethod || paymentMethods.find(p => p.isDefault),
    );

    const options = useMemo(() => {
      return paymentMethods.map(method => {
        const label =
          method.paymentType !== 'card'
            ? `${capitalize(method.paymentType)}`
            : `${capitalize(method.cardType)} ⋯ ${method.last4}`;

        return {
          value: method.id,
          label,
        };
      });
    }, [paymentMethods]);

    const showPaymentMethods =
      isImmediatePlanChange &&
      (totalDueNow.amount > 0 ||
        (!!freeTrialEndsAt && environment.commerceSettings.billing.freeTrialRequiresPaymentMethod));

    return (
      <Form
        onSubmit={payWithExistingPaymentMethod}
        sx={formProps}
      >
        {showPaymentMethods ? (
          <Select
            elementId='paymentMethod'
            options={options}
            value={selectedPaymentMethod?.id || null}
            onChange={option => {
              const paymentMethod = paymentMethods.find(source => source.id === option.value);
              setSelectedPaymentMethod(paymentMethod);
            }}
            portal
          >
            {/*Store value inside an input in order to be accessible as form data*/}
            <input
              name={HIDDEN_INPUT_NAME}
              type='hidden'
              value={selectedPaymentMethod?.id}
            />
            <SelectButton
              icon={ChevronUpDown}
              sx={t => ({
                justifyContent: 'space-between',
                backgroundColor: t.colors.$colorBackground,
              })}
            >
              {selectedPaymentMethod && <PaymentMethodRow paymentMethod={selectedPaymentMethod} />}
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
            name={HIDDEN_INPUT_NAME}
            type='hidden'
            value={selectedPaymentMethod?.id}
          />
        )}
        <Card.Alert>{card.error}</Card.Alert>
        <CheckoutSubmitButton />
      </Form>
    );
  },
);
