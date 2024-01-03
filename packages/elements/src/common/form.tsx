import type { FormControlProps, FormFieldProps, FormProps } from '@radix-ui/react-form';
import { Control, Field as RadixField, Form as RadixForm, Label, Submit } from '@radix-ui/react-form';
import { Slot } from '@radix-ui/react-slot';

import { useForm, useInput } from '../internals/machines/sign-in.context';

function Input({ asChild, ...rest }: FormControlProps) {
  const { name, value } = rest;
  const field = useInput({ name, value });

  const Comp = asChild ? Slot : Control;

  return (
    <Comp
      {...field.props} // TODO
      {...rest}
    />
  );
}

function Form({ asChild, ...rest }: FormProps) {
  const form = useForm();

  const Comp = asChild ? Slot : RadixForm;
  return (
    <Comp
      {...form.props} // TODO
      {...rest}
    />
  );
}

function Field({ name, ...rest }: FormFieldProps) {
  return (
    <RadixField
      name={name}
      {...rest}
    />
  );
}

export { Form, Input, Field, Label, Submit };
