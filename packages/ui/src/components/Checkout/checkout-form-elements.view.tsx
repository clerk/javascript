import { Spinner } from '../../customizables';
import type { useCheckoutFormElementsModel } from './checkout-form-elements.model';

export const CheckoutFormElementsView = ({
  model,
  children,
}: {
  model: ReturnType<typeof useCheckoutFormElementsModel>;
  children: React.ReactNode;
}) => {
  if (!model.hasPlan) {
    return null;
  }

  if (model.isLoading) {
    return <Spinner sx={{ margin: 'auto' }} />;
  }

  return children;
};
