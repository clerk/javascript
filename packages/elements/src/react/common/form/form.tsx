import { composeEventHandlers } from '@radix-ui/primitive';
import type { FormProps as RadixFormProps } from '@radix-ui/react-form';
import { Form as RadixForm } from '@radix-ui/react-form';
import * as React from 'react';
import type { BaseActorRef } from 'xstate';

import { useForm } from './hooks';

const DISPLAY_NAME = 'ClerkElementsForm';

type FormElement = React.ElementRef<typeof RadixForm>;
export type FormProps = Omit<RadixFormProps, 'children'> & {
  children: React.ReactNode;
  flowActor?: BaseActorRef<{ type: 'SUBMIT' }>;
};

export const Form = React.forwardRef<FormElement, FormProps>(({ flowActor, onSubmit, ...rest }, forwardedRef) => {
  const form = useForm({ flowActor: flowActor });

  const { onSubmit: internalOnSubmit, ...internalFormProps } = form.props;

  return (
    <RadixForm
      {...internalFormProps}
      {...rest}
      onSubmit={composeEventHandlers(internalOnSubmit, onSubmit)}
      ref={forwardedRef}
    />
  );
});

Form.displayName = DISPLAY_NAME;
