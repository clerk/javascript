import type { FieldId } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React, { forwardRef } from 'react';

import type { LocalizationKey } from '../customizables';
import {
  CheckboxInput,
  descriptors,
  Flex,
  FormLabel,
  Icon as IconCustomizable,
  Input,
  Link,
  localizationKeys,
  Text,
  useLocalizations,
} from '../customizables';
import { FormFieldContextProvider, sanitizeInputProps, useFormField } from '../primitives/hooks';
import type { PropsOfComponent } from '../styledSystem';
import type { useFormControl as useFormControlUtil } from '../utils';
import { OTPCodeControl, OTPResendButton, OTPRoot } from './CodeControl';
import { useCardState } from './contexts';
import type { FormFeedbackProps } from './FormControl';
import { FormFeedback } from './FormControl';
import { InputGroup } from './InputGroup';
import { PasswordInput } from './PasswordInput';
import { PhoneInput } from './PhoneInput';
import { RadioItem, RadioLabel } from './RadioGroup';

type FormControlProps = Omit<PropsOfComponent<typeof Input>, 'label' | 'placeholder' | 'disabled' | 'required'> &
  ReturnType<typeof useFormControlUtil<FieldId>>['props'];

const Root = (props: PropsWithChildren<FormControlProps>) => {
  const card = useCardState();
  const { children, isDisabled: isDisabledProp, ...restProps } = props;

  const isDisabled = isDisabledProp || card.isLoading;

  const ctxProps = {
    ...restProps,
    isDisabled,
  };

  return <FormFieldContextProvider {...ctxProps}>{children}</FormFieldContextProvider>;
};

const FieldAction = (
  props: PropsWithChildren<{ localizationKey?: LocalizationKey | string; onClick?: React.MouseEventHandler }>,
) => {
  const { fieldId, isDisabled } = useFormField();

  if (!props.localizationKey && !props.children) {
    return null;
  }

  return (
    <Link
      localizationKey={props.localizationKey}
      elementDescriptor={descriptors.formFieldAction}
      elementId={descriptors.formFieldLabel.setId(fieldId)}
      isDisabled={isDisabled}
      colorScheme='primary'
      variant='buttonSmall'
      onClick={e => {
        e.preventDefault();
        props.onClick?.(e);
      }}
    >
      {props.children}
    </Link>
  );
};

const FieldOptionalLabel = () => {
  const { fieldId, isDisabled } = useFormField();
  return (
    <Text
      localizationKey={localizationKeys('formFieldHintText__optional')}
      elementDescriptor={descriptors.formFieldHintText}
      elementId={descriptors.formFieldHintText.setId(fieldId)}
      as='span'
      variant='caption'
      colorScheme='neutral'
      isDisabled={isDisabled}
    />
  );
};

const FieldLabelIcon = (props: { icon?: React.ComponentType }) => {
  const { t } = useLocalizations();
  if (!props.icon) {
    return null;
  }

  return (
    <Flex
      as={'span'}
      title={t(localizationKeys('formFieldHintText__slug'))}
      sx={{
        marginRight: 'auto',
      }}
    >
      <IconCustomizable
        icon={props.icon}
        sx={theme => ({
          marginLeft: theme.space.$0x5,
          color: theme.colors.$neutralAlpha400,
          width: theme.sizes.$4,
          height: theme.sizes.$4,
        })}
      />
    </Flex>
  );
};

const FieldLabel = (props: PropsWithChildren<{ localizationKey?: LocalizationKey | string }>) => {
  const { isRequired, id, label, isDisabled, hasError } = useFormField();

  if (!(props.localizationKey || label) && !props.children) {
    return null;
  }

  return (
    <FormLabel
      localizationKey={props.localizationKey || label}
      elementDescriptor={descriptors.formFieldLabel}
      elementId={descriptors.formFieldLabel.setId(id as FieldId)}
      hasError={!!hasError}
      isDisabled={isDisabled}
      isRequired={isRequired}
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {props.children}
    </FormLabel>
  );
};

const FieldLabelRow = (props: PropsWithChildren) => {
  const { fieldId } = useFormField();
  return (
    <Flex
      justify={'between'}
      align='center'
      elementDescriptor={descriptors.formFieldLabelRow}
      elementId={descriptors.formFieldLabelRow.setId(fieldId)}
    >
      {props.children}
    </Flex>
  );
};

const FieldFeedback = (props: Pick<FormFeedbackProps, 'elementDescriptors' | 'center'>) => {
  const { fieldId, debouncedFeedback } = useFormField();

  return (
    <FormFeedback
      center={props.center}
      {...{
        ...debouncedFeedback,
        elementDescriptors: props.elementDescriptors,
        id: fieldId,
      }}
    />
  );
};

const PhoneInputElement = forwardRef<HTMLInputElement>((_, ref) => {
  const { t } = useLocalizations();
  const formField = useFormField();
  const { placeholder, ...inputProps } = sanitizeInputProps(formField);

  return (
    <PhoneInput
      ref={ref}
      elementDescriptor={descriptors.formFieldInput}
      elementId={descriptors.formFieldInput.setId(formField.fieldId)}
      {...inputProps}
      feedbackType={formField.feedbackType}
      placeholder={t(placeholder)}
    />
  );
});

const PasswordInputElement = forwardRef<HTMLInputElement>((_, ref) => {
  const { t } = useLocalizations();
  const formField = useFormField();
  const { placeholder, ...inputProps } = sanitizeInputProps(formField, [
    'validatePassword',
    'setError',
    'setWarning',
    'setSuccess',
    'setInfo',
    'setHasPassedComplexity',
  ]);

  return (
    // @ts-expect-error Typescript is complaining that `setError`, `setWarning` and the rest of feedback setters are not passed. We are clearly passing them from above.
    <PasswordInput
      ref={ref}
      elementDescriptor={descriptors.formFieldInput}
      elementId={descriptors.formFieldInput.setId(formField.fieldId)}
      {...inputProps}
      placeholder={t(placeholder)}
    />
  );
});

const CheckboxIndicator = forwardRef<HTMLInputElement>((_, ref) => {
  const formField = useFormField();
  const { placeholder, ...inputProps } = sanitizeInputProps(formField);

  return (
    <CheckboxInput
      ref={ref}
      {...inputProps}
      elementDescriptor={descriptors.formFieldInput}
      elementId={descriptors.formFieldInput.setId(formField.fieldId)}
      focusRing={false}
      sx={t => ({
        width: 'fit-content',
        marginTop: t.space.$0x5,
      })}
    />
  );
});

const CheckboxLabel = (props: { description?: string | LocalizationKey }) => {
  const { label, id } = useFormField();

  if (!label) {
    return null;
  }

  return (
    <RadioLabel
      label={label}
      id={id}
      description={props.description}
    />
  );
};

const InputElement = forwardRef<HTMLInputElement>((_, ref) => {
  const { t } = useLocalizations();
  const formField = useFormField();
  const { placeholder, ...inputProps } = sanitizeInputProps(formField);
  return (
    <Input
      ref={ref}
      elementDescriptor={descriptors.formFieldInput}
      elementId={descriptors.formFieldInput.setId(formField.fieldId)}
      {...inputProps}
      placeholder={t(placeholder)}
    />
  );
});

const InputGroupElement = forwardRef<
  HTMLInputElement,
  {
    groupPrefix?: string;
    groupSuffix?: string;
  }
>((props, ref) => {
  const { t } = useLocalizations();
  const formField = useFormField();
  const { placeholder, ...inputProps } = sanitizeInputProps(formField);

  return (
    <InputGroup
      ref={ref}
      elementDescriptor={descriptors.formFieldInput}
      elementId={descriptors.formFieldInput.setId(formField.fieldId)}
      {...inputProps}
      groupPrefix={props.groupPrefix}
      groupSuffix={props.groupSuffix}
      placeholder={t(placeholder)}
    />
  );
});

export const Field = {
  Root: Root,
  Label: FieldLabel,
  LabelRow: FieldLabelRow,
  Input: InputElement,
  PasswordInput: PasswordInputElement,
  PhoneInput: PhoneInputElement,
  InputGroup: InputGroupElement,
  RadioItem: RadioItem,
  CheckboxIndicator: CheckboxIndicator,
  CheckboxLabel: CheckboxLabel,
  Action: FieldAction,
  AsOptional: FieldOptionalLabel,
  LabelIcon: FieldLabelIcon,
  Feedback: FieldFeedback,
  OTPRoot,
  OTPCodeControl,
  OTPResendButton,
};
