import { withCardStateProvider } from '@/ui/elements/contexts';

import { usePaymentMethodsController } from './payment-methods.controller';
import { usePaymentMethodsModel } from './payment-methods.model';
import type { PaymentMethodsModel } from './payment-methods.types';
import { PaymentMethodsView } from './payment-methods.view';

const PaymentMethodsContent = withCardStateProvider(({ model }: { model: PaymentMethodsModel }) => {
  const data = usePaymentMethodsController(model);
  return <PaymentMethodsView data={data} />;
});

export const PaymentMethods = () => {
  const model = usePaymentMethodsModel();
  return (
    <PaymentMethodsContent
      key={model.scope}
      model={model}
    />
  );
};
