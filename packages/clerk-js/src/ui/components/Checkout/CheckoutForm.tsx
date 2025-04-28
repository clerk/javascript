import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type {
  __experimental_CommerceCheckoutResource,
  __experimental_CommerceMoney,
  __experimental_CommercePaymentSourceResource,
  ClerkAPIError,
  ClerkRuntimeError,
} from '@clerk/types';
import { useMemo, useState } from 'react';

import { useCheckoutContext } from '../../contexts';
import { Box, Button, Col, descriptors, Form, localizationKeys } from '../../customizables';
import { Alert, Disclosure, Divider, Drawer, LineItems, Select, SelectButton, SelectOptionList } from '../../elements';
import { useFetch } from '../../hooks';
import { ArrowUpDown } from '../../icons';
import { animations } from '../../styledSystem';
import { handleError } from '../../utils';
import { AddPaymentSource, PaymentSourceRow } from '../PaymentSources';

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);

export const CheckoutForm = ({
  checkout,
  onCheckoutComplete,
}: {
  checkout: __experimental_CommerceCheckoutResource;
  onCheckoutComplete: (checkout: __experimental_CommerceCheckoutResource) => void;
}) => {
  const { plan, planPeriod, totals } = checkout;

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
          <LineItems.Group expand>
            <LineItems.Title description={'Your features will remain the end of your current subscription.'} />
          </LineItems.Group>

          <LineItems.Group borderTop>
            <LineItems.Title title={plan.name} />
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Description
              text={`${plan.currencySymbol}${planPeriod === 'month' ? plan.amountFormatted : plan.annualMonthlyAmountFormatted}`}
              suffix={`per month${planPeriod === 'annual' ? ', times 12 months' : ''}`}
            />
          </LineItems.Group>
          {totals.proration && totals.totalDueNow.amount > 0 && (
            <LineItems.Group>
              {/* TODO(@Commerce): needs localization */}
              <LineItems.Title
                title={'Adjustment'}
                description={'Prorated credit for the remainder of your subscription.'}
              />
              {/* TODO(@Commerce): needs localization */}
              <LineItems.Description
                text={`- ${totals.proration?.totalProration.currencySymbol}${(totals.proration?.days * totals.proration?.ratePerDay.amount) / 100}`}
              />
            </LineItems.Group>
          )}
          <LineItems.Group
            borderTop
            variant='tertiary'
          >
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Title title='Subtotal' />
            <LineItems.Description text={`${totals.subtotal.currencySymbol} ${totals.subtotal.amountFormatted}`} />
          </LineItems.Group>
          <LineItems.Group variant='tertiary'>
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Title title='Tax' />
            <LineItems.Description text={`${totals.taxTotal.currencySymbol} ${totals.taxTotal.amountFormatted}`} />
          </LineItems.Group>
          <LineItems.Group borderTop>
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Title title={`Total${totals.totalDueNow ? ' Due Today' : ''}`} />
            <LineItems.Description
              text={`${
                totals.totalDueNow
                  ? `${totals.totalDueNow.currencySymbol}${totals.totalDueNow.amountFormatted}`
                  : `${totals.grandTotal.currencySymbol}${totals.grandTotal.amountFormatted}`
              }`}
            />
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

  const { data } = useFetch(
    __experimental_commerce?.getPaymentSources,
    {
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    },
    undefined,
    `commerce-payment-sources-${user?.id}`,
  );

  const [openAccountFundsDropDown, setOpenAccountFundsDropDown] = useState(true);
  const [openAddNewSourceDropDown, setOpenAddNewSourceDropDown] = useState((data?.data.length || 0) === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ClerkRuntimeError | ClerkAPIError | string | undefined>();

  const { data: paymentSources } = data || { data: [] };

  const confirmCheckout = async ({ paymentSourceId }: { paymentSourceId: string }) => {
    try {
      const newCheckout = await checkout.confirm({
        paymentSourceId,
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

    await confirmCheckout({ paymentSourceId });
    setIsSubmitting(false);
  };

  const onAddPaymentSourceSuccess = async (paymentSource: __experimental_CommercePaymentSourceResource) => {
    await confirmCheckout({ paymentSourceId: paymentSource.id });
    setIsSubmitting(false);
  };

  return (
    <Col
      elementDescriptor={descriptors.checkoutFormElementsRoot}
      gap={3}
      sx={t => ({ padding: t.space.$4 })}
    >
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
      {paymentSources.length > 0 && (
        <>
          <Disclosure.Root
            open={openAccountFundsDropDown}
            onOpenChange={setOpenAccountFundsDropDown}
          >
            {/* TODO(@Commerce): needs localization */}
            <Disclosure.Trigger text='Payment Methods' />
            <Disclosure.Content>
              <Col gap={3}>
                <PaymentSourceMethods
                  checkout={checkout}
                  paymentSources={paymentSources}
                  totalDueNow={checkout.totals.totalDueNow}
                  onPaymentSourceSubmit={onPaymentSourceSubmit}
                  isSubmitting={isSubmitting}
                />
              </Col>
            </Disclosure.Content>
          </Disclosure.Root>
          <Divider />
        </>
      )}

      <Disclosure.Root
        open={openAddNewSourceDropDown}
        onOpenChange={setOpenAddNewSourceDropDown}
      >
        <Disclosure.Trigger
          text={localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.add')}
        />
        <Disclosure.Content>
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
          />
        </Disclosure.Content>
      </Disclosure.Root>
    </Col>
  );
};

const PaymentSourceMethods = ({
  checkout,
  totalDueNow,
  paymentSources,
  onPaymentSourceSubmit,
  isSubmitting,
}: {
  checkout: __experimental_CommerceCheckoutResource;
  totalDueNow: __experimental_CommerceMoney;
  paymentSources: __experimental_CommercePaymentSourceResource[];
  onPaymentSourceSubmit: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
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
        rowGap: t.space.$3,
      })}
    >
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
