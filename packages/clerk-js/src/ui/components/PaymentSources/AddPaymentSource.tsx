import { createContextAndHook } from '@clerk/shared/react';
import type { CommerceCheckoutResource } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import { useSubscriberTypeLocalizationRoot } from '../../contexts';
import { localizationKeys } from '../../customizables';
import type { LocalizationKey } from '../../localization';
import { handleError } from '../../utils';
import * as PaymentElement from './PaymentElement';

type AddPaymentSourceProps = {
  onSuccess: (context: { gateway: 'stripe'; paymentToken: string }) => Promise<void>;
  checkout?: CommerceCheckoutResource;
  cancelAction?: () => void;
};

const [AddPaymentSourceContext, useAddPaymentSourceContext] = createContextAndHook<any>('AddPaymentSourceRoot');

const AddPaymentSourceRoot = ({ children, ...rest }: PropsWithChildren<AddPaymentSourceProps>) => {
  const [headerTitle, setHeaderTitle] = useState<LocalizationKey | undefined>(undefined);
  const [headerSubtitle, setHeaderSubtitle] = useState<LocalizationKey | undefined>(undefined);
  const [submitLabel, setSubmitLabel] = useState<LocalizationKey | undefined>(undefined);

  return (
    <AddPaymentSourceContext.Provider
      value={{
        value: {
          headerTitle,
          headerSubtitle,
          submitLabel,
          setHeaderTitle,
          setHeaderSubtitle,
          setSubmitLabel,
          ...rest,
        },
      }}
    >
      <PaymentElement.Root onSuccess={rest.onSuccess}>{children}</PaymentElement.Root>
    </AddPaymentSourceContext.Provider>
  );
};

const AddPaymentSourceLoading = (props: PropsWithChildren) => {
  const { isProviderReady } = PaymentElement.usePaymentElementStatus();

  if (!isProviderReady) {
    return props.children;
  }

  return null;
};

const AddPaymentSourceReady = (props: PropsWithChildren) => {
  const { isProviderReady } = PaymentElement.usePaymentElementStatus();

  if (!isProviderReady) {
    return null;
  }

  return <>{props.children}</>;
};

const Root = (props: PropsWithChildren<AddPaymentSourceProps>) => {
  const { children, ...rest } = props;

  return (
    <AddPaymentSourceRoot {...rest}>
      {/* <AddPaymentSourceLoading>
        <Flex
          direction={'row'}
          align={'center'}
          justify={'center'}
          sx={t => ({
            width: '100%',
            minHeight: t.sizes.$60,
          })}
        >
          <Spinner
            size={'lg'}
            colorScheme={'primary'}
            elementDescriptor={descriptors.spinner}
          />
        </Flex>
      </AddPaymentSourceLoading> */}

      {/* <AddPaymentSourceReady> */}
      <AddPaymentSourceForm>{children}</AddPaymentSourceForm>
      {/* </AddPaymentSourceReady> */}
    </AddPaymentSourceRoot>
  );
};

const useSetAndSync = (text: LocalizationKey, setter: (a: any) => void) => {
  useRef(() => {
    setter(text);
  });

  useEffect(() => {
    setter(text);
  }, [text, setter]);
};

const FormHeader = ({ text }: { text: LocalizationKey }) => {
  const { setHeaderTitle } = useAddPaymentSourceContext();
  useSetAndSync(text, setHeaderTitle);
  return null;
};

const FormSubtitle = ({ text }: { text: LocalizationKey }) => {
  const { setHeaderSubtitle } = useAddPaymentSourceContext();
  useSetAndSync(text, setHeaderSubtitle);
  return null;
};

const FormButton = ({ text }: { text: LocalizationKey }) => {
  const { setSubmitLabel } = useAddPaymentSourceContext();
  useSetAndSync(text, setSubmitLabel);
  return null;
};

const AddPaymentSourceForm = ({ children }: PropsWithChildren) => {
  const { headerTitle, headerSubtitle, submitLabel, checkout, initializePaymentSource, onSuccess, cancelAction } =
    useAddPaymentSourceContext();

  const card = useCardState();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { isMounted, submit: submitPaymentElement } = PaymentElement.usePaymentElementForm();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    card.setLoading();
    card.setError(undefined);

    const { data, error } = await submitPaymentElement();
    if (error) {
      return;
    }

    try {
      await onSuccess(data);
    } catch (error) {
      void handleError(error, [], card.setError);
    } finally {
      card.setIdle();
      initializePaymentSource(); // resets the payment intent
    }
  };

  return (
    <FormContainer
      headerTitle={headerTitle}
      headerSubtitle={headerSubtitle}
    >
      <Form.Root
        onSubmit={onSubmit}
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          rowGap: t.space.$3,
        })}
      >
        {children}
        <PaymentElement.Form />
        <Card.Alert>{card.error}</Card.Alert>
        <FormButtons
          isDisabled={!isMounted}
          submitLabel={
            submitLabel ??
            localizationKeys(`${localizationRoot}.billingPage.paymentSourcesSection.formButtonPrimary__add`)
          }
          onReset={cancelAction}
          hideReset={!cancelAction}
          sx={{ flex: checkout ? 1 : undefined }}
        />
      </Form.Root>
    </FormContainer>
  );
};

export { Root, FormHeader, FormSubtitle, FormButton };
