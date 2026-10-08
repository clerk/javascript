import { withCardStateProvider } from '@/ui/elements/contexts';

import {
  AddPaymentMethodScreenView,
  PaymentMethodMenuView,
  RemovePaymentMethodScreenView,
} from './payment-methods.action-views';
import {
  useAddPaymentMethodController,
  usePaymentMethodMenuController,
  useRemovePaymentMethodController,
} from './payment-methods.controller';
import { useAddPaymentMethodModel } from './payment-methods.model';
import type {
  AddPaymentMethodModel,
  PaymentMethodItem,
  PaymentMethodRowData,
  PaymentMethodsLocalizationRoot,
  RevalidatePaymentMethods,
} from './payment-methods.types';

export const AddPaymentMethodScreen = ({ onSuccess }: { onSuccess: RevalidatePaymentMethods }) => {
  const model = useAddPaymentMethodModel();
  return (
    <AddPaymentMethodScreenContent
      key={model.scope}
      model={model}
      onSuccess={onSuccess}
    />
  );
};

const AddPaymentMethodScreenContent = withCardStateProvider(
  ({ model, onSuccess }: { model: AddPaymentMethodModel; onSuccess: RevalidatePaymentMethods }) => {
    const controller = useAddPaymentMethodController(model, onSuccess);
    return <AddPaymentMethodScreenView controller={controller} />;
  },
);

export const RemovePaymentMethodScreen = ({
  paymentMethod,
  localizationRoot,
  revalidate,
}: {
  paymentMethod: Pick<PaymentMethodItem, 'identifier' | 'remove'>;
  localizationRoot: PaymentMethodsLocalizationRoot;
  revalidate: RevalidatePaymentMethods;
}) => {
  const controller = useRemovePaymentMethodController(paymentMethod, localizationRoot, revalidate);
  return <RemovePaymentMethodScreenView controller={controller} />;
};

export const PaymentMethodMenu = ({
  paymentMethod,
  localizationRoot,
}: {
  paymentMethod: PaymentMethodRowData;
  localizationRoot: PaymentMethodsLocalizationRoot;
}) => {
  const controller = usePaymentMethodMenuController(paymentMethod, localizationRoot);
  return <PaymentMethodMenuView controller={controller} />;
};
