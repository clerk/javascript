import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type {
  __experimental_CommerceCheckoutResource,
  __experimental_CommerceMoney,
  __experimental_CommercePaymentSourceResource,
  __experimental_ConfirmCheckoutParams,
  ClerkAPIError,
  ClerkRuntimeError,
} from '@clerk/types';
import type { SetupIntent } from '@stripe/stripe-js';
import { useEffect, useMemo, useState } from 'react';

import { useCheckoutContext } from '../../contexts';
import { Box, Button, Col, descriptors, Form, localizationKeys, Span } from '../../customizables';
import { Alert, Drawer, LineItems, SegmentedControl, Select, SelectButton, SelectOptionList } from '../../elements';
import { useFetch } from '../../hooks';
import { ArrowUpDown } from '../../icons';
import { animations } from '../../styledSystem';
import { handleError } from '../../utils';
import { AddPaymentSource, PaymentSourceRow } from '../PaymentSources';

type PaymentMethodSource = 'existing' | 'new';

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);

export const CheckoutForm = ({
  checkout,
  onCheckoutComplete,
}: {
  checkout: __experimental_CommerceCheckoutResource;
  onCheckoutComplete: (checkout: __experimental_CommerceCheckoutResource) => void;
}) => {
  const { plan, planPeriod, totals, isImmediatePlanChange } = checkout;
  const showCredits =
    totals.totalDueNow.amount > 0 && !!totals.proration?.credit?.amount && totals.proration.credit.amount > 0;
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
          {/* TODO(@Commerce): needs localization */}
          {showDowngradeInfo && (
            <Span
              localizationKey={'Your features will remain until the end of your current subscription.'}
              elementDescriptor={descriptors.lineItemsDowngradeNotice}
              sx={t => ({
                fontSize: t.fontSizes.$sm,
                color: t.colors.$colorTextSecondary,
              })}
            />
          )}

          <LineItems.Group borderTop={showDowngradeInfo}>
            <LineItems.Title title={plan.name} />
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Description
              text={`${plan.currencySymbol}${planPeriod === 'month' ? plan.amountFormatted : plan.annualMonthlyAmountFormatted}`}
              suffix={`per month${planPeriod === 'annual' ? ', times 12 months' : ''}`}
            />
          </LineItems.Group>
          {showCredits && (
            <LineItems.Group>
              {/* TODO(@Commerce): needs localization */}
              <LineItems.Title
                title={'Credit'}
                description={'Prorated credit for the remainder of your subscription.'}
              />
              {/* TODO(@Commerce): needs localization */}
              {/* TODO(@Commerce): Replace client-side calculation with server-side calculation once data are available in the response */}
              <LineItems.Description
                text={`- ${totals.proration?.credit.currencySymbol}${totals.proration?.credit.amountFormatted}`}
              />
            </LineItems.Group>
          )}
          <LineItems.Group
            borderTop
            variant='tertiary'
          >
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Title title='Subtotal' />
            <LineItems.Description text={`${totals.subtotal.currencySymbol}${totals.subtotal.amountFormatted}`} />
          </LineItems.Group>
          <LineItems.Group variant='tertiary'>
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Title title='Tax' />
            <LineItems.Description text={`${totals.taxTotal.currencySymbol}${totals.taxTotal.amountFormatted}`} />
          </LineItems.Group>
          <LineItems.Group borderTop>
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Title title={`Total Due Today`} />
            <LineItems.Description text={`${totals.totalDueNow.currencySymbol}${totals.totalDueNow.amountFormatted}`} />
          </LineItems.Group>
        </LineItems.Root>
      </Box>

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
  checkout: __experimental_CommerceCheckoutResource;
  onCheckoutComplete: (checkout: __experimental_CommerceCheckoutResource) => void;
}) => {
  const { __experimental_commerce } = useClerk();
  const { user } = useUser();
  const { organization } = useOrganization();
  const { subscriberType } = useCheckoutContext();

  const [paymentMethodSource, setPaymentMethodSource] = useState<PaymentMethodSource>('existing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ClerkRuntimeError | ClerkAPIError | string | undefined>();

  const { data, revalidate: revalidatePaymentSources } = useFetch(
    __experimental_commerce?.getPaymentSources,
    {
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    },
    undefined,
    `commerce-payment-sources-${user?.id}`,
  );
  const { data: paymentSources } = data || { data: [] };

  useEffect(() => {
    setPaymentMethodSource(paymentSources.length > 0 ? 'existing' : 'new');
  }, [paymentSources]);

  const confirmCheckout = async (params: __experimental_ConfirmCheckoutParams) => {
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
          // @ts-ignore TODO(@COMMERCE): needs localization
          submitLabel={
            checkout.totals.totalDueNow.amount > 0
              ? localizationKeys(
                  'userProfile.__experimental_billingPage.paymentSourcesSection.formButtonPrimary__pay',
                  {
                    amount: `${checkout.totals.totalDueNow.currencySymbol}${checkout.totals.totalDueNow.amountFormatted}`,
                  },
                )
              : 'Subscribe'
          }
          submitError={submitError}
          setSubmitError={setSubmitError}
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
  checkout: __experimental_CommerceCheckoutResource;
  totalDueNow: __experimental_CommerceMoney;
  paymentSources: __experimental_CommercePaymentSourceResource[];
  onPaymentSourceSubmit: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  submitError: ClerkRuntimeError | ClerkAPIError | string | undefined;
}) => {
  const [selectedPaymentSource, setSelectedPaymentSource] = useState<
    __experimental_CommercePaymentSourceResource | undefined
  >(checkout.paymentSource || paymentSources.find(p => p.isDefault));

  const options = useMemo(() => {
    return paymentSources.map(source => {
      return {
        value: source.id,
        label: `${capitalize(source.cardType)} ⋯ ${source.last4}`,
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
            icon={ArrowUpDown}
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
          {typeof submitError === 'string' ? submitError : submitError.message}
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
