import { useOrganization } from '@clerk/shared/react';
import type {
  ClerkAPIError,
  ClerkRuntimeError,
  CommerceCheckoutResource,
  CommerceMoney,
  CommercePaymentSourceResource,
  ConfirmCheckoutParams,
} from '@clerk/types';
import type { SetupIntent } from '@stripe/stripe-js';
import { useMemo, useState } from 'react';

import { useCheckoutContext } from '../../contexts';
import { Box, Button, Col, descriptors, Form, localizationKeys, Text } from '../../customizables';
import { Alert, Drawer, LineItems, SegmentedControl, Select, SelectButton, SelectOptionList } from '../../elements';
import { useFetch } from '../../hooks';
import { ChevronUpDown } from '../../icons';
import { animations } from '../../styledSystem';
import { handleError } from '../../utils';
import { AddPaymentSource, PaymentSourceRow } from '../PaymentSources';

type PaymentMethodSource = 'existing' | 'new';

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);

export const CheckoutForm = ({
  checkout,
  onCheckoutComplete,
}: {
  checkout: CommerceCheckoutResource;
  onCheckoutComplete: (checkout: CommerceCheckoutResource) => void;
}) => {
  const { plan, planPeriod, totals, isImmediatePlanChange } = checkout;
  const showCredits = !!totals.credit?.amount && totals.credit.amount > 0;
  const showDowngradeInfo = !isImmediatePlanChange;

  return (
    <Drawer.Body>
      <Box
        elementDescriptor={descriptors.checkoutFormLineItemsRoot}
        sx={t => ({
          padding: t.space.$4,
          borderBottomWidth: t.borderWidths.$normal,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$neutralAlpha100,
        })}
      >
        <LineItems.Root>
          <LineItems.Group>
            <LineItems.Title
              title={plan.name}
              description={planPeriod === 'annual' ? localizationKeys('commerce.billedAnnually') : undefined}
            />
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Description
              prefix={planPeriod === 'annual' ? 'x12' : undefined}
              text={`${plan.currencySymbol}${planPeriod === 'month' ? plan.amountFormatted : plan.annualMonthlyAmountFormatted}`}
              suffix={localizationKeys('commerce.checkout.perMonth')}
            />
          </LineItems.Group>
          <LineItems.Group
            borderTop
            variant='tertiary'
          >
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Title title='Subtotal' />
            <LineItems.Description text={`${totals.subtotal.currencySymbol}${totals.subtotal.amountFormatted}`} />
          </LineItems.Group>
          {showCredits && (
            <LineItems.Group variant='tertiary'>
              {/* TODO(@Commerce): needs localization */}
              <LineItems.Title title={'Credit for the remainder of your current subscription.'} />
              {/* TODO(@Commerce): needs localization */}
              {/* TODO(@Commerce): Replace client-side calculation with server-side calculation once data are available in the response */}
              <LineItems.Description text={`- ${totals.credit?.currencySymbol}${totals.credit?.amountFormatted}`} />
            </LineItems.Group>
          )}
          <LineItems.Group borderTop>
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Title title={`Total Due Today`} />
            <LineItems.Description text={`${totals.totalDueNow.currencySymbol}${totals.totalDueNow.amountFormatted}`} />
          </LineItems.Group>
        </LineItems.Root>
      </Box>

      {/* TODO(@Commerce): needs localization */}
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

      <CheckoutFormElements
        checkout={checkout}
        onCheckoutComplete={onCheckoutComplete}
      />
    </Drawer.Body>
  );
};

const CheckoutFormElements = ({
  checkout,
  onCheckoutComplete,
}: {
  checkout: CommerceCheckoutResource;
  onCheckoutComplete: (checkout: CommerceCheckoutResource) => void;
}) => {
  const { organization } = useOrganization();
  const { subscriber, subscriberType } = useCheckoutContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ClerkRuntimeError | ClerkAPIError | string | undefined>();

  const { data, revalidate: revalidatePaymentSources } = useFetch(
    subscriber().getPaymentSources,
    {},
    undefined,
    `commerce-payment-sources-${subscriber().id}`,
  );
  const { data: paymentSources } = data || { data: [] };

  const [paymentMethodSource, setPaymentMethodSource] = useState<PaymentMethodSource>(() =>
    paymentSources.length > 0 ? 'existing' : 'new',
  );

  const confirmCheckout = async (params: ConfirmCheckoutParams) => {
    try {
      const newCheckout = await checkout.confirm({
        ...params,
        ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
      });
      onCheckoutComplete(newCheckout);
    } catch (error) {
      handleError(error, [], setSubmitError);
    }
  };

  const onPaymentSourceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(undefined);

    const data = new FormData(e.currentTarget);
    const paymentSourceId = data.get('payment_source_id') as string;

    await confirmCheckout({
      paymentSourceId,
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    });
    setIsSubmitting(false);
  };

  const onAddPaymentSourceSuccess = async (ctx: { stripeSetupIntent?: SetupIntent }) => {
    void revalidatePaymentSources();
    await confirmCheckout({
      gateway: 'stripe',
      paymentToken: ctx.stripeSetupIntent?.payment_method as string,
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    });
    setIsSubmitting(false);
  };

  const onPayWithTestPaymentSourceSuccess = async () => {
    try {
      const newCheckout = await checkout.confirm({
        gateway: 'stripe',
        useTestCard: true,
        ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
      });
      onCheckoutComplete(newCheckout);
      void revalidatePaymentSources();
    } catch (error) {
      handleError(error, [], setSubmitError);
    }
  };

  return (
    <Col
      elementDescriptor={descriptors.checkoutFormElementsRoot}
      gap={4}
      sx={t => ({ padding: t.space.$4 })}
    >
      {/* only show if there are payment sources and there is a total due now */}
      {paymentSources.length > 0 && checkout.totals.totalDueNow.amount > 0 && (
        <SegmentedControl.Root
          aria-label='Payment method source'
          value={paymentMethodSource}
          onChange={value => setPaymentMethodSource(value as PaymentMethodSource)}
          size='lg'
          fullWidth
        >
          <SegmentedControl.Button
            value='existing'
            // TODO(@Commerce): needs localization
            text='Payment Methods'
          />
          <SegmentedControl.Button
            value='new'
            // TODO(@Commerce): needs localization
            text='Add payment method'
          />
        </SegmentedControl.Root>
      )}

      {paymentMethodSource === 'existing' && (
        <ExistingPaymentSourceForm
          checkout={checkout}
          paymentSources={paymentSources}
          totalDueNow={checkout.totals.totalDueNow}
          onPaymentSourceSubmit={onPaymentSourceSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      )}

      {paymentMethodSource === 'new' && (
        <AddPaymentSource
          checkout={checkout}
          onSuccess={onAddPaymentSourceSuccess}
          onPayWithTestPaymentSourceSuccess={onPayWithTestPaymentSourceSuccess}
          // @ts-ignore TODO(@COMMERCE): needs localization
          submitLabel={
            checkout.totals.totalDueNow.amount > 0
              ? localizationKeys('userProfile.billingPage.paymentSourcesSection.formButtonPrimary__pay', {
                  amount: `${checkout.totals.totalDueNow.currencySymbol}${checkout.totals.totalDueNow.amountFormatted}`,
                })
              : 'Subscribe'
          }
          submitError={submitError}
          setSubmitError={setSubmitError}
          showPayWithTestCardSection
        />
      )}
    </Col>
  );
};

const ExistingPaymentSourceForm = ({
  checkout,
  totalDueNow,
  paymentSources,
  onPaymentSourceSubmit,
  isSubmitting,
  submitError,
}: {
  checkout: CommerceCheckoutResource;
  totalDueNow: CommerceMoney;
  paymentSources: CommercePaymentSourceResource[];
  onPaymentSourceSubmit: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  submitError: ClerkRuntimeError | ClerkAPIError | string | undefined;
}) => {
  const [selectedPaymentSource, setSelectedPaymentSource] = useState<CommercePaymentSourceResource | undefined>(
    checkout.paymentSource || paymentSources.find(p => p.isDefault),
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

  return (
    <Form
      onSubmit={onPaymentSourceSubmit}
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        rowGap: t.space.$4,
      })}
    >
      {checkout.totals.totalDueNow.amount > 0 ? (
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
              color: t.colors.$colorText,
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
      {submitError && (
        <Alert
          variant='danger'
          sx={t => ({
            animation: `${animations.textInBig} ${t.transitionDuration.$slow}`,
          })}
        >
          {typeof submitError === 'string'
            ? submitError
            : 'longMessage' in submitError
              ? submitError.longMessage || submitError.message
              : submitError.message}
        </Alert>
      )}
      <Button
        type='submit'
        colorScheme='primary'
        size='sm'
        textVariant={'buttonLarge'}
        sx={{
          width: '100%',
        }}
        isLoading={isSubmitting}
      >
        {totalDueNow.amount > 0 ? (
          <>
            {/* TODO(@COMMERCE): needs localization */}
            Pay {totalDueNow.currencySymbol}
            {totalDueNow.amountFormatted}
          </>
        ) : (
          'Subscribe'
        )}
      </Button>
    </Form>
  );
};
