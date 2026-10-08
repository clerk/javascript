import { useCheckoutCompleteController } from './checkout-complete.controller';
import { useCheckoutCompleteModel } from './checkout-complete.model';
import { CheckoutCompleteView } from './checkout-complete.view';

export const CheckoutComplete = () => {
  const model = useCheckoutCompleteModel();
  const controller = useCheckoutCompleteController(model);
  return <CheckoutCompleteView controller={controller} />;
};
