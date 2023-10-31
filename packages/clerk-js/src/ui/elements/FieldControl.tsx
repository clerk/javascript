import type { FieldId } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React, { forwardRef } from 'react';

import type { LocalizationKey } from '../customizables';
import {
  descriptors,
  Flex,
  FormControl as FormControlPrim,
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
import { useFormControlFeedback } from '../utils';
import { useCardState } from './contexts';
import type { FormFeedbackProps } from './FormControl';
import { FormFeedback } from './FormControl';

type FormControlProps = Omit<PropsOfComponent<typeof Input>, 'label' | 'placeholder' | 'disabled' | 'required'> &
  ReturnType<typeof useFormControlUtil<FieldId>>['props'];

const Root = (props: PropsWithChildren<FormControlProps>) => {
  const card = useCardState();
  const {
    id,
    isRequired,
    sx,
    setError,
    setInfo,
    setSuccess,
    setWarning,
    setHasPassedComplexity,
    clearFeedback,
    feedbackType,
    feedback,
    isFocused,
  } = props;

  const { debounced: debouncedState } = useFormControlFeedback({ feedback, feedbackType, isFocused });

  const isDisabled = props.isDisabled || card.isLoading;

  return (
    <FormFieldContextProvider {...{ ...props, isDisabled }}>
      {/*Most of our primitives still depend on this provider.*/}
      {/*TODO: In follow-up PRs these will be removed*/}
      <FormControlPrim
        elementDescriptor={descriptors.formField}
        elementId={descriptors.formField.setId(id)}
        id={id}
        hasError={debouncedState.feedbackType === 'error'}
        isDisabled={isDisabled}
        isRequired={isRequired}
        setError={setError}
        setSuccess={setSuccess}
        setWarning={setWarning}
        setInfo={setInfo}
        setHasPassedComplexity={setHasPassedComplexity}
        clearFeedback={clearFeedback}
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
      colorScheme='neutral'
      variant='smallRegular'
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
          color: theme.colors.$blackAlpha400,
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
  const { feedback, feedbackType, isFocused, fieldId } = useFormField();
  const { debounced } = useFormControlFeedback({ feedback, feedbackType, isFocused });

  return (
    <FormFeedback
      {...{
        ...debounced,
        elementDescriptors: props.elementDescriptors,
        id: fieldId,
      }}
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

export const Field = {
  Root: Root,
  Label: FieldLabel,
  LabelRow: FieldLabelRow,
  Input: InputElement,
  Action: FieldAction,
  AsOptional: FieldOptionalLabel,
  LabelIcon: FieldLabelIcon,
  Feedback: FieldFeedback,
};
