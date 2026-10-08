import { useCheckoutAddEmailController } from './checkout-parts.controller';
import {
  useCheckoutAddEmailModel,
  useCheckoutGenericErrorModel,
  useCheckoutInvalidPlanModel,
} from './checkout-parts.model';
import { CheckoutAddEmailView, CheckoutGenericErrorView, CheckoutInvalidPlanView } from './checkout-parts.view';

export const GenericError = () => {
  const model = useCheckoutGenericErrorModel();
  return <CheckoutGenericErrorView {...model} />;
};

export const InvalidPlanScreen = () => {
  const model = useCheckoutInvalidPlanModel();
  return <CheckoutInvalidPlanView model={model} />;
};

export const AddEmailForm = () => {
  const model = useCheckoutAddEmailModel();
  const controller = useCheckoutAddEmailController(model);
  return <CheckoutAddEmailView controller={controller} />;
};
