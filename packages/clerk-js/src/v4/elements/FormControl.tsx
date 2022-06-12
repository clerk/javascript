import { FieldId } from '@clerk/types';
import React from 'react';

import {
  Button,
  descriptors,
  Flex,
  FormControl as FormControlPrim,
  FormErrorText,
  FormLabel,
  Input,
} from '../customizables';
import { PropsOfComponent } from '../styledSystem';
import { useCardState } from './contexts';
import { PasswordInput } from './PasswordInput';
import { PhoneInput } from './PhoneInput';

type FormControlProps = {
  id: FieldId;
  label: string;
  isRequired?: boolean;
  errorText?: string;
  actionLabel?: string;
  onActionClicked?: React.MouseEventHandler;
  isDisabled?: boolean;
} & PropsOfComponent<typeof Input>;

const getInputElementForType = (type: FormControlProps['type']) => {
  return type === 'password' ? PasswordInput : type === 'tel' ? PhoneInput : Input;
};

export const FormControl = (props: FormControlProps) => {
  const card = useCardState();
  const { id, errorText, isRequired, label, actionLabel, onActionClicked, sx, ...rest } = props;
  const hasError = !!errorText;
  const isDisabled = props.isDisabled || card.isLoading;

  const InputElement = getInputElementForType(props.type);

  return (
    <FormControlPrim
      elementDescriptor={descriptors.formField}
      elementId={descriptors.formField.setId(id)}
      id={id}
      hasError={hasError}
      isDisabled={isDisabled}
      isRequired={isRequired}
      sx={sx}
    >
      <Flex
        justify='between'
        align='center'
        elementDescriptor={descriptors.formFieldLabelRow}
        elementId={descriptors.formFieldLabelRow.setId(id)}
        sx={theme => ({ marginBottom: theme.space.$1x5 })}
      >
        <FormLabel
          elementDescriptor={descriptors.formFieldLabel}
          elementId={descriptors.formFieldLabel.setId(id)}
          hasError={hasError}
          isDisabled={isDisabled}
        >
          {label}
        </FormLabel>
        {actionLabel && (
          <Button
            elementDescriptor={descriptors.formFieldAction}
            elementId={descriptors.formFieldLabel.setId(id)}
            isDisabled={isDisabled}
            variant='link'
            colorScheme='primary'
            onClick={e => {
              e.preventDefault();
              onActionClicked?.(e);
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Flex>
      <InputElement
        elementDescriptor={descriptors.formFieldInput}
        elementId={descriptors.formFieldInput.setId(id)}
        hasError={hasError}
        isDisabled={isDisabled}
        {...rest}
      />
      <FormErrorText
        elementDescriptor={descriptors.formFieldErrorText}
        elementId={descriptors.formFieldErrorText.setId(id)}
      >
        {errorText}
      </FormErrorText>
    </FormControlPrim>
  );
};
