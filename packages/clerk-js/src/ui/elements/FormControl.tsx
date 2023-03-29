import type { FieldId } from '@clerk/types';
import React, { forwardRef } from 'react';

import type { LocalizationKey } from '../customizables';
import {
  descriptors,
  Flex,
  FormControl as FormControlPrim,
  FormErrorText,
  FormLabel,
  Icon,
  Input,
  Link,
  localizationKeys,
  Text,
  useLocalizations,
} from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { useCardState } from './contexts';
import { PasswordInput } from './PasswordInput';
import { PhoneInput } from './PhoneInput';

type FormControlProps = Omit<PropsOfComponent<typeof Input>, 'label' | 'placeholder'> & {
  id: FieldId;
  isRequired?: boolean;
  isOptional?: boolean;
  errorText?: string;
  onActionClicked?: React.MouseEventHandler;
  isDisabled?: boolean;
  label: string | LocalizationKey;
  placeholder?: string | LocalizationKey;
  actionLabel?: string | LocalizationKey;
  icon?: React.ComponentType;
};

// TODO: Convert this into a Component?
const getInputElementForType = (type: FormControlProps['type']) => {
  return type === 'password' ? PasswordInput : type === 'tel' ? PhoneInput : Input;
};

export const FormControl = forwardRef<HTMLInputElement, FormControlProps>((props, ref) => {
  const { t } = useLocalizations();
  const card = useCardState();
  const { id, errorText, isRequired, isOptional, label, actionLabel, onActionClicked, sx, placeholder, icon, ...rest } =
    props;
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
        sx={theme => ({ marginBottom: theme.space.$1 })}
      >
        <FormLabel
          localizationKey={typeof label === 'object' ? label : undefined}
          elementDescriptor={descriptors.formFieldLabel}
          elementId={descriptors.formFieldLabel.setId(id)}
          hasError={hasError}
          isDisabled={isDisabled}
          isRequired={isRequired}
          sx={{ marginRight: 'auto', display: 'flex', alignItems: 'center' }}
        >
          {typeof label === 'string' ? label : undefined}
          {icon && (
            // TODO: This is a temporary fix. Replace this when the tooltip component is introduced
            <a
              href='#0'
              title='A slug is a human-readable ID that must be unique.  It’s often used in URLs.'
            >
              <Icon
                icon={icon}
                sx={theme => ({
                  marginLeft: theme.space.$0x5,
                  color: theme.colors.$blackAlpha400,
                  width: theme.sizes.$4,
                  height: theme.sizes.$4,
                })}
              />
            </a>
          )}
        </FormLabel>
        {isOptional && !actionLabel && (
          <Text
            localizationKey={localizationKeys('formFieldHintText__optional')}
            elementDescriptor={descriptors.formFieldHintText}
            elementId={descriptors.formFieldHintText.setId(id)}
            as='span'
            colorScheme='neutral'
            variant='smallRegular'
            isDisabled={isDisabled}
          />
        )}
        {actionLabel && (
          <Link
            localizationKey={actionLabel}
            elementDescriptor={descriptors.formFieldAction}
            elementId={descriptors.formFieldLabel.setId(id)}
            isDisabled={isDisabled}
            colorScheme='primary'
            onClick={e => {
              e.preventDefault();
              onActionClicked?.(e);
            }}
          >
            {typeof actionLabel === 'string' ? actionLabel : undefined}
          </Link>
        )}
      </Flex>
      <InputElement
        elementDescriptor={descriptors.formFieldInput}
        elementId={descriptors.formFieldInput.setId(id)}
        hasError={hasError}
        isDisabled={isDisabled}
        isRequired={isRequired}
        {...rest}
        ref={ref}
        placeholder={t(placeholder)}
      />
      <FormErrorText
        elementDescriptor={descriptors.formFieldErrorText}
        elementId={descriptors.formFieldErrorText.setId(id)}
      >
        {errorText}
      </FormErrorText>
    </FormControlPrim>
  );
});
