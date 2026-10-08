import { useCheckoutMutationsController } from './checkout-mutations.controller';
import { useCheckoutMutationsModel } from './checkout-mutations.model';
import { PayWithTestPaymentMethodView } from './checkout-pay-with-test.view';

export const PayWithTestPaymentMethod = () => {
  const model = useCheckoutMutationsModel();
  const controller = useCheckoutMutationsController(model);
  return (
    <PayWithTestPaymentMethodView
      isLoading={controller.isLoading}
      onClick={() => controller.confirmCheckout({ gateway: 'stripe', useTestCard: true })}
    />
  );
};
