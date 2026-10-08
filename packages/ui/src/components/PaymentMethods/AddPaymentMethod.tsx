import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import type { LocalizationKey } from '../../localization';
import { AddPaymentMethodContext, useAddPaymentMethodContext } from './add-payment-method.context';
import { useAddPaymentMethodRootController } from './add-payment-method.controller';
import { AddPaymentMethodProvider, useAddPaymentMethodRootModel } from './add-payment-method.model';
import { AddPaymentMethodForm } from './add-payment-method.parts';
import type { AddPaymentMethodProps } from './add-payment-method.types';

const Root = ({ children, ...props }: PropsWithChildren<AddPaymentMethodProps>) => {
  const model = useAddPaymentMethodRootModel(props);
  const controller = useAddPaymentMethodRootController({
    onSuccess: props.onSuccess,
    cancelAction: props.cancelAction,
    hasCheckout: !!props.checkout,
    requestKey: model.requestKey,
  });
  return (
    <AddPaymentMethodContext.Provider value={{ value: controller }}>
      <AddPaymentMethodProvider
        key={model.requestKey}
        model={model}
      >
        <AddPaymentMethodForm>{children}</AddPaymentMethodForm>
      </AddPaymentMethodProvider>
    </AddPaymentMethodContext.Provider>
  );
};

const useSetAndSync = (text: LocalizationKey, setter: (text: LocalizationKey) => void) => {
  useEffect(() => {
    setter(text);
  }, [text, setter]);
};

const FormHeader = ({ text }: { text: LocalizationKey }) => {
  const { setHeaderTitle } = useAddPaymentMethodContext();
  useSetAndSync(text, setHeaderTitle);
  return null;
};

const FormSubtitle = ({ text }: { text: LocalizationKey }) => {
  const { setHeaderSubtitle } = useAddPaymentMethodContext();
  useSetAndSync(text, setHeaderSubtitle);
  return null;
};

const FormButton = ({ text }: { text: LocalizationKey }) => {
  const { setSubmitLabel } = useAddPaymentMethodContext();
  useSetAndSync(text, setSubmitLabel);
  return null;
};

export { Root, FormHeader, FormSubtitle, FormButton };
