import { forwardRef, useId } from 'react';

import type { LocalizationKey } from '../customizables';
import { Col, descriptors, Flex, FormLabel, Input, Text } from '../customizables';
import { useFormField } from '../primitives/hooks';
import type { PropsOfComponent } from '../styledSystem';

/**
 * @deprecated
 */
export const RadioGroup = (
  props: PropsOfComponent<typeof Input> & {
    radioOptions?: {
      value: string;
      label: string | LocalizationKey;
      description?: string | LocalizationKey;
    }[];
  },
) => {
  const { radioOptions, ...rest } = props;
  return (
    <Col
      elementDescriptor={descriptors.formFieldRadioGroup}
      gap={2}
    >
      {radioOptions?.map(r => (
        <RadioGroupItem
          key={r.value}
          {...r}
          inputProps={rest}
        />
      ))}
    </Col>
  );
};

/**
 * @deprecated
 */
const RadioGroupItem = (props: {
  inputProps: PropsOfComponent<typeof Input>;
  value: string;
  label: string | LocalizationKey;
  description?: string | LocalizationKey;
}) => {
  const id = useId();
  return (
    <Flex
      elementDescriptor={descriptors.formFieldRadioGroupItem}
      align='start'
    >
      <Input
        elementDescriptor={descriptors.formFieldRadioInput}
        {...props.inputProps}
        focusRing={false}
        id={id}
        sx={[
          t => ({
            width: 'fit-content',
            marginTop: t.space.$0x5,
          }),
          props.inputProps.sx,
        ]}
        type='radio'
        value={props.value}
        checked={props.value === props.inputProps.value}
      />

      <FormLabel
        elementDescriptor={descriptors.formFieldRadioLabel}
        htmlFor={id}
        sx={t => ({
          padding: `${t.space.$none} ${t.space.$2}`,
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <Text
          elementDescriptor={descriptors.formFieldRadioLabelTitle}
          variant='regularMedium'
          localizationKey={props.label}
        />

        {props.description && (
          <Text
            elementDescriptor={descriptors.formFieldRadioLabelDescription}
            colorScheme='neutral'
            variant='smallRegular'
            localizationKey={props.description}
          />
        )}
      </FormLabel>
    </Flex>
  );
};

const sanitizeInputProps = (obj: ReturnType<typeof useFormField>, keep?: (keyof ReturnType<typeof useFormField>)[]) => {
  const {
    radioOptions,
    validatePassword,
    warningText,
    informationText,
    hasPassedComplexity,
    enableErrorAfterBlur,
    isFocused,
    hasLostFocus,
    successfulText,
    errorText,
    setHasPassedComplexity,
    setWarning,
    setSuccessful,
    setError,
    errorMessageId,
    ...inputProps
  } = obj;

  keep?.forEach(key => {
    // @ts-ignore
    inputProps[key] = obj[key];
  });

  return inputProps;
};

const RadioIndicator = forwardRef<HTMLInputElement, { value: string; id: string }>((props, ref) => {
  const formField = useFormField();
  const { value, placeholder, ...inputProps } = sanitizeInputProps(formField);

  return (
    <Input
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

      <FormLabel
        elementDescriptor={descriptors.formFieldRadioLabel}
        htmlFor={randomId}
        sx={t => ({
          padding: `${t.space.$none} ${t.space.$2}`,
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <Text
          elementDescriptor={descriptors.formFieldRadioLabelTitle}
          variant='regularMedium'
          localizationKey={props.label}
        />

        {props.description && (
          <Text
            elementDescriptor={descriptors.formFieldRadioLabelDescription}
            colorScheme='neutral'
            variant='smallRegular'
            localizationKey={props.description}
          />
        )}
      </FormLabel>
    </Flex>
  );
});
