import { withCardStateProvider } from '@/ui/elements/contexts';

import { AddPaymentMethodForCheckout } from './checkout-add-payment-method';
import { ExistingPaymentMethodForm } from './checkout-existing-payment-method';
import { useCheckoutFormModel } from './checkout-form.model';
import { CheckoutFormView } from './checkout-form.view';
import { useCheckoutFormElementsModel } from './checkout-form-elements.model';
import { CheckoutFormElementsView } from './checkout-form-elements.view';
import { useCheckoutFormElementsInternalController } from './checkout-form-elements-internal.controller';
import { useCheckoutFormElementsInternalModel } from './checkout-form-elements-internal.model';
import { CheckoutFormElementsInternalView } from './checkout-form-elements-internal.view';
import { FreeTrialButton } from './checkout-free-trial';

export { PayWithTestPaymentMethod } from './checkout-pay-with-test';

export const CheckoutForm = withCardStateProvider(() => {
  const model = useCheckoutFormModel();
  return model ? (
    <CheckoutFormView
      model={model}
      formElements={<CheckoutFormElements />}
    />
  ) : null;
});

const CheckoutFormElements = () => {
  const model = useCheckoutFormElementsModel();
  return (
    <CheckoutFormElementsView model={model}>
      <CheckoutFormElementsInternal />
    </CheckoutFormElementsView>
  );
};

const CheckoutFormElementsInternal = () => {
  const model = useCheckoutFormElementsInternalModel();
  const controller = useCheckoutFormElementsInternalController(model.hasPaymentMethods);
  return (
    <CheckoutFormElementsInternalView
      hasPlan={model.hasPlan}
      hasPaymentMethods={model.hasPaymentMethods}
      needsPaymentMethod={model.needsPaymentMethod}
      showTabs={model.showTabs}
      paymentMethodSource={controller.paymentMethodSource}
      onPaymentMethodSourceChange={controller.setPaymentMethodSource}
      freeTrialButton={<FreeTrialButton />}
      existingPaymentMethodForm={<ExistingPaymentMethodForm />}
      addPaymentMethodForm={<AddPaymentMethodForCheckout />}
    />
  );
};
