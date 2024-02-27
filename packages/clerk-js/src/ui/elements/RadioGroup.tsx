import { forwardRef, useId } from 'react';

import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, FormLabel, RadioInput, Text } from '../customizables';
import { sanitizeInputProps, useFormField } from '../primitives/hooks';

const RadioIndicator = forwardRef<HTMLInputElement, { value: string; id: string }>((props, ref) => {
  const formField = useFormField();
  const { value, placeholder, ...inputProps } = sanitizeInputProps(formField);

  return (
    <RadioInput
      ref={ref}
      {...inputProps}
      elementDescriptor={descriptors.formFieldRadioInput}
      id={props.id}
      focusRing={false}
      sx={t => ({
        width: 'fit-content',
        marginTop: t.space.$0x5,
      })}
      type='radio'
      value={props.value}
      checked={props.value === value}
    />
  );
});

export const RadioLabel = (props: {
  label: string | LocalizationKey;
  description?: string | LocalizationKey;
  id?: string;
}) => {
  return (
    <FormLabel
      elementDescriptor={descriptors.formFieldRadioLabel}
      htmlFor={props.id}
      sx={t => ({
        padding: `${t.space.$none} ${t.space.$2}`,
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Text
        elementDescriptor={descriptors.formFieldRadioLabelTitle}
        variant='subtitle'
        localizationKey={props.label}
      />

      {props.description && (
        <Text
          elementDescriptor={descriptors.formFieldRadioLabelDescription}
          colorScheme='neutral'
          localizationKey={props.description}
        />
      )}
    </FormLabel>
  );
};

export const RadioItem = forwardRef<
  HTMLInputElement,
  {
    value: string;
    label: string | LocalizationKey;
    description?: string | LocalizationKey;
  }
>((props, ref) => {
  const randomId = useId();
  return (
    <Flex
      elementDescriptor={descriptors.formFieldRadioGroupItem}
      align='start'
    >
      <RadioIndicator
        id={randomId}
        ref={ref}
        value={props.value}
      />

      <RadioLabel
        id={randomId}
        label={props.label}
        description={props.description}
      />
    </Flex>
  );
});
