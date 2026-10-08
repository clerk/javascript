import { withCardStateProvider } from '@/ui/elements/contexts';

import { CheckoutFreeTrialView } from './checkout-free-trial.view';
import { useCheckoutMutationsController } from './checkout-mutations.controller';
import { useCheckoutMutationsModel } from './checkout-mutations.model';

export const FreeTrialButton = withCardStateProvider(() => {
  const model = useCheckoutMutationsModel();
  const controller = useCheckoutMutationsController(model);
  return (
    <CheckoutFreeTrialView
      onConfirm={() => controller.confirmCheckout({})}
      error={controller.error}
    />
  );
});
