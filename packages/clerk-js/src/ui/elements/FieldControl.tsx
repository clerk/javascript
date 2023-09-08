import type { FieldId } from '@clerk/types';
import type { ClerkAPIError } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React, { forwardRef } from 'react';

import type { LocalizationKey } from '../customizables';
import {
  Box,
  descriptors,
  Flex,
  FormControl as FormControlPrim,
  FormErrorText,
  FormInfoText,
  FormLabel,
  FormSuccessText,
  FormWarningText,
  Icon as IconCustomizable,
  Input,
  Link,
  localizationKeys,
  Text,
  useLocalizations,
} from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import { useFieldMessageVisibility } from '../hooks';
import { FormFieldContextProvider, useFormControl, useFormField } from '../primitives/hooks';
import type { PropsOfComponent } from '../styledSystem';
import { useFormControlFeedback } from '../utils';
import { useCardState } from './contexts';
import { useFormState } from './Form';
import type { FormFeedbackDescriptorsKeys, FormFeedbackProps } from './FormControl';
import { useCalculateErrorTextHeight, useFormTextAnimation } from './FormControl';
import { InputGroup } from './InputGroup';
import { PasswordInput } from './PasswordInput';
import { RadioItem } from './RadioGroup';

type FormControlProps = Omit<PropsOfComponent<typeof Input>, 'label' | 'placeholder'> & {
  id: FieldId;
  isRequired?: boolean;
  isOptional?: boolean;
  errorText?: string;
  onActionClicked?: React.MouseEventHandler;
  isDisabled?: boolean;
  label?: string | LocalizationKey;
  placeholder?: string | LocalizationKey;
  actionLabel?: string | LocalizationKey;
  icon?: React.ComponentType;
  validatePassword?: boolean;
  setError: (error: string | ClerkAPIError | undefined) => void;
  warningText: string | undefined;
  setWarning: (error: string) => void;
  setSuccessful: (message: string) => void;
  successfulText: string;
  hasLostFocus: boolean;
  setHasPassedComplexity: (b: boolean) => void;
  hasPassedComplexity: boolean;
  enableErrorAfterBlur?: boolean;
  informationText?: string | LocalizationKey;
  radioOptions?: {
    value: string;
    label: string | LocalizationKey;
    description?: string | LocalizationKey;
  }[];
  isFocused: boolean;
};

const delay = 350;

export const Root = (props: PropsWithChildren<FormControlProps>) => {
  const card = useCardState();
  const { submittedWithEnter } = useFormState();
  const {
    id,
    errorText,
    isRequired,
    sx,
    setError,
    successfulText,
    setSuccessful,
    hasLostFocus,
    enableErrorAfterBlur,
    informationText,
    isFocused: _isFocused,
    setWarning,
    setHasPassedComplexity,
    hasPassedComplexity,
    warningText,
  } = props;

  const { debounced: debouncedState } = useFormControlFeedback({
    errorText,
    informationText,
    enableErrorAfterBlur,
    hasPassedComplexity,
    isFocused: _isFocused,
    hasLostFocus,
    successfulText,
    warningText,
    skipBlur: submittedWithEnter,
  });

  const errorMessage = useFieldMessageVisibility(debouncedState.errorText, delay);
  const isDisabled = props.isDisabled || card.isLoading;

  return (
    <FormFieldContextProvider {...props}>
      <FormControlPrim
        elementDescriptor={descriptors.formField}
        elementId={descriptors.formField.setId(id)}
        id={id}
        hasError={!!errorMessage}
        isDisabled={isDisabled}
        isRequired={isRequired}
        setError={setError}
        setSuccessful={setSuccessful}
        setWarning={setWarning}
        setHasPassedComplexity={setHasPassedComplexity}
        sx={sx}
      >
        {props.children}
      </FormControlPrim>
    </FormFieldContextProvider>
  );
};

const FieldAction = (
  props: PropsWithChildren<{ localizationKey?: LocalizationKey | string; onClick?: React.MouseEventHandler }>,
) => {
  const { isDisabled, id } = useFormControl();

  if (!props.localizationKey && !props.children) {
    return null;
  }

  return (
    <Link
      localizationKey={props.localizationKey}
      elementDescriptor={descriptors.formFieldAction}
      elementId={descriptors.formFieldLabel.setId(id as FieldId)}
      isDisabled={isDisabled}
      colorScheme='primary'
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
  const { isDisabled, id } = useFormControl();
  return (
    <Text
      localizationKey={localizationKeys('formFieldHintText__optional')}
      elementDescriptor={descriptors.formFieldHintText}
      elementId={descriptors.formFieldHintText.setId(id as FieldId)}
      as='span'
      colorScheme='neutral'
      variant='smallRegular'
      isDisabled={isDisabled}
    />
  );
};

const FieldLabelIcon = (props: { icon?: React.ComponentType }) => {
  if (!props.icon) {
    return null;
  }

  return (
    <Flex
      as={'span'}
      title='A slug is a human-readable ID that must be unique.  It’s often used in URLs.'
    >
      <IconCustomizable
        icon={props.icon}
        sx={theme => ({
          marginLeft: theme.space.$0x5,
          color: theme.colors.$blackAlpha400,
          width: theme.sizes.$4,
          height: theme.sizes.$4,
        })}
      />
    </Flex>
  );
};

const FieldLabel = (props: PropsWithChildren<{ localizationKey?: LocalizationKey | string }>) => {
  const { hasError, isDisabled, isRequired, id, label } = useFormField();

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
      sx={theme => ({
        marginBottom: theme.space.$1,
        marginLeft: 0,
      })}
    >
      {props.children}
    </Flex>
  );
};

const FieldFeedback = (props: Pick<FormFeedbackProps, 'elementDescriptors'>) => {
  const {
    errorText,
    informationText,
    enableErrorAfterBlur,
    hasPassedComplexity,
    isFocused,
    hasLostFocus,
    successfulText,
    warningText,
  } = useFormField();
  const { submittedWithEnter } = useFormState();
  const { debounced } = useFormControlFeedback({
    errorText,
    informationText,
    enableErrorAfterBlur,
    hasPassedComplexity,
    isFocused,
    hasLostFocus,
    successfulText,
    warningText,
    skipBlur: submittedWithEnter,
  });

  return (
    <FieldFeedbackInternal
      {...{
        ...debounced,
        elementDescriptors: props.elementDescriptors,
      }}
    />
  );
};

const FieldFeedbackInternal = (props: FormFeedbackProps) => {
  const { id, elementDescriptors } = props;
  const errorMessage = useFieldMessageVisibility(props.errorText, delay);
  const successMessage = useFieldMessageVisibility(props.successfulText, delay);
  const informationMessage = useFieldMessageVisibility(props.informationText, delay);
  const warningMessage = useFieldMessageVisibility(props.warningText, delay);

  const messageToDisplay = informationMessage || successMessage || errorMessage || warningMessage;
  const isSomeMessageVisible = !!messageToDisplay;

  const { calculateHeight, height } = useCalculateErrorTextHeight({
    recalculate: warningMessage || errorMessage || informationMessage,
  });
  const { getFormTextAnimation } = useFormTextAnimation();
  const defaultElementDescriptors = {
    error: descriptors.formFieldErrorText,
    warning: descriptors.formFieldWarningText,
    info: descriptors.formFieldInfoText,
    success: descriptors.formFieldSuccessText,
  };

  const getElementProps = (type: FormFeedbackDescriptorsKeys) => {
    const descriptor = (elementDescriptors?.[type] || defaultElementDescriptors[type]) as ElementDescriptor | undefined;
    return {
      elementDescriptor: descriptor,
      elementId: id ? descriptor?.setId?.(id) : undefined,
    };
  };

  if (!isSomeMessageVisible) {
    return null;
  }

  return (
    <Box
      style={{
        height, // dynamic height
        position: 'relative',
      }}
      sx={[
        getFormTextAnimation(
          !!props.informationText || !!props.successfulText || !!props.errorText || !!props.warningText,
        ),
      ]}
    >
      {/*Display the directions after the success message is unmounted*/}
      {!successMessage && !warningMessage && !errorMessage && informationMessage && (
        <FormInfoText
          ref={calculateHeight}
          sx={getFormTextAnimation(!!props.informationText && !props?.successfulText && !props.warningText)}
          localizationKey={informationMessage}
        />
      )}
      {/* Display the error message after the directions is unmounted*/}
      {errorMessage && (
        <FormErrorText
          {...getElementProps('error')}
          ref={calculateHeight}
          sx={getFormTextAnimation(!!props?.errorText)}
          localizationKey={errorMessage}
        />
      )}

      {/* Display the success message after the error message is unmounted*/}
      {!errorMessage && successMessage && (
        <FormSuccessText
          {...getElementProps('success')}
          ref={calculateHeight}
          sx={getFormTextAnimation(!!props?.successfulText)}
          localizationKey={successMessage}
        />
      )}

      {warningMessage && (
        <FormWarningText
          {...getElementProps('warning')}
          ref={calculateHeight}
          sx={getFormTextAnimation(!!props.warningText)}
        >
          {warningMessage}
        </FormWarningText>
      )}
    </Box>
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
    fieldId,
    label,
    ...inputProps
  } = obj;

  keep?.forEach(key => {
    // @ts-ignore
    inputProps[key] = obj[key];
  });

  return inputProps;
};

const PasswordInputElement = forwardRef<HTMLInputElement>((_, ref) => {
  const { t } = useLocalizations();
  const formField = useFormField();
  const { placeholder, ...inputProps } = sanitizeInputProps(formField, ['validatePassword']);
  return (
    <PasswordInput
      ref={ref}
      elementDescriptor={descriptors.formFieldInput}
      elementId={descriptors.formFieldInput.setId(formField.fieldId)}
      {...inputProps}
      placeholder={t(placeholder)}
    />
  );
});

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
      groupPreffix={props.groupPrefix}
      groupSuffix={props.groupSuffix}
      placeholder={t(placeholder)}
    />
  );
});

export const Field = {
  Root: Root,
  Label: FieldLabel,
  LabelRow: FieldLabelRow,
  PasswordInput: PasswordInputElement,
  Input: InputElement,
  InputGroup: InputGroupElement,
  RadioItem: RadioItem,
  Action: FieldAction,
  AsOptional: FieldOptionalLabel,
  LabelIcon: FieldLabelIcon,
  Feedback: FieldFeedback,
};
