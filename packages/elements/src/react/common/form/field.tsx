import type { Autocomplete } from '@clerk/shared/types';
import type { FormFieldProps as RadixFormFieldProps } from '@radix-ui/react-form';
import { Field as RadixField, ValidityState as RadixValidityState } from '@radix-ui/react-form';
import * as React from 'react';

import { useFormStore } from '~/internals/machines/form/form.context';

import { FieldContext, useField, useFieldState, ValidityStateContext } from './hooks';
import type { ClerkFieldId, FieldStates } from './types';
import { enrichFieldState } from './utils';

const DISPLAY_NAME = 'ClerkElementsField';
const DISPLAY_NAME_INNER = 'ClerkElementsFieldInner';

type FormFieldElement = React.ElementRef<typeof RadixField>;
export type FormFieldProps = Omit<RadixFormFieldProps, 'children'> & {
  name: Autocomplete<ClerkFieldId>;
  alwaysShow?: boolean;
  children: React.ReactNode | ((state: FieldStates) => React.ReactNode);
};

/**
 * Field is used to associate its child elements with a specific input. It automatically handles unique ID generation and associating the contained label and input elements.
 *
 * @param name - Give your `<Field>` a unique name inside the current form. If you choose one of the following names Clerk Elements will automatically set the correct type on the `<input />` element: `emailAddress`, `password`, `phoneNumber`, and `code`.
 * @param alwaysShow - Optional. When `true`, the field will always be renydered, regardless of its state. By default, a field is hidden if it's optional or if it's a filled-out required field.
 * @param {Function} children - A function that receives `state` as an argument. `state` is a union of `"success" | "error" | "idle" | "warning" | "info"`.
 *
 * @example
 * <Clerk.Field name="emailAddress">
 *   <Clerk.Label>Email</Clerk.Label>
 *   <Clerk.Input />
 * </Clerk.Field>
 *
 * @example
 * <Clerk.Field name="emailAddress">
 *  {(fieldState) => (
 *    <Clerk.Label>Email</Clerk.Label>
 *    <Clerk.Input className={`text-${fieldState}`} />
 *  )}
 * </Clerk.Field>
 */
export const Field = React.forwardRef<FormFieldElement, FormFieldProps>(({ alwaysShow, ...rest }, forwardedRef) => {
  const formRef = useFormStore();
  const formCtx = formRef.getSnapshot().context;
  // A field is marked as hidden if it's optional OR if it's a filled-out required field
  const isHiddenField = formCtx.progressive && Boolean(formCtx.hidden?.has(rest.name));

  // Only alwaysShow={true} should force behavior to render the field, on `undefined` or alwaysShow={false} the isHiddenField logic should take over
  const shouldHide = alwaysShow ? false : isHiddenField;

  return shouldHide ? null : (
    <FieldContext.Provider value={{ name: rest.name }}>
      <FieldInner
        {...rest}
        ref={forwardedRef}
      />
    </FieldContext.Provider>
  );
});

Field.displayName = DISPLAY_NAME;

const FieldInner = React.forwardRef<FormFieldElement, FormFieldProps>((props, forwardedRef) => {
  const { children, ...rest } = props;
  const field = useField({ name: rest.name });
  const { state: fieldState } = useFieldState({ name: rest.name });

  return (
    <RadixField
      {...field.props}
      {...rest}
      ref={forwardedRef}
    >
      <RadixValidityState>
        {validity => {
          const enrichedFieldState = enrichFieldState(validity, fieldState);

          return (
            <ValidityStateContext.Provider value={validity}>
              {typeof children === 'function' ? children(enrichedFieldState) : children}
            </ValidityStateContext.Provider>
          );
        }}
      </RadixValidityState>
    </RadixField>
  );
});

FieldInner.displayName = DISPLAY_NAME_INNER;
