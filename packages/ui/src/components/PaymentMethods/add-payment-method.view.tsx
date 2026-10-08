import type { PropsWithChildren, ReactNode } from 'react';

import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import { descriptors, Flex, Spinner } from '../../customizables';
import type { AddPaymentMethodFormData } from './add-payment-method.types';

export const AddPaymentMethodFormView = ({
  children,
  controller,
  paymentElement,
}: PropsWithChildren<{ controller: AddPaymentMethodFormData; paymentElement: ReactNode }>) =>
  !controller.isProviderReady ? (
    <Flex
      direction='row'
      align='center'
      justify='center'
      sx={t => ({ width: '100%', minHeight: t.sizes.$60 })}
    >
      <Spinner
        size='lg'
        colorScheme='primary'
        elementDescriptor={descriptors.spinner}
      />
    </Flex>
  ) : (
    <FormContainer
      headerTitle={controller.headerTitle}
      headerSubtitle={controller.headerSubtitle}
    >
      <Form.Root
        key={controller.requestKey}
        onSubmit={controller.onSubmit}
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          rowGap: t.space.$3,
        })}
      >
        {children}
        {paymentElement}
        <FormButtons
          isDisabled={!controller.isFormReady}
          submitLabel={controller.submitLabel}
          onReset={controller.cancelAction}
          hideReset={!controller.cancelAction}
          sx={{ flex: controller.hasCheckout ? 1 : undefined }}
        />
      </Form.Root>
    </FormContainer>
  );
