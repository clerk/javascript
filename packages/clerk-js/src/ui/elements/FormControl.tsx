import type { FieldId } from '@clerk/types';
import type { ClerkAPIError } from '@clerk/types';
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
  setError: (error: string | ClerkAPIError | undefined) => void;
  setSuccessful: (isSuccess: boolean) => void;
  isSuccessful: boolean;
  complexity?: boolean;
};

// TODO: Convert this into a Component?
const getInputElementForType = (type: FormControlProps['type']) => {
  const CustomInputs = {
    password: PasswordInput,
    tel: PhoneInput,
  };
  if (!type) {
    return Input;
  }
  const customInput = type as keyof typeof CustomInputs;
  return CustomInputs[customInput] || Input;
};

export const FormControl = forwardRef<HTMLInputElement, FormControlProps>((props, ref) => {
  const { t } = useLocalizations();
  const card = useCardState();
  const {
    id,
    errorText,
    isRequired,
    isOptional,
    label,
    actionLabel,
    onActionClicked,
    sx,
    placeholder,
    icon,
    setError,
    isSuccessful,
    setSuccessful,
    complexity,
    ...rest
  } = props;
  const hasError = !!errorText;
  const isDisabled = props.isDisabled || card.isLoading;

  const InputElement = getInputElementForType(props.type);
  const isCheckbox = props.type === 'checkbox';

  return (
    <FormControlPrim
      elementDescriptor={descriptors.formField}
      elementId={descriptors.formField.setId(id)}
      id={id}
      hasError={hasError}
      isDisabled={isDisabled}
      isRequired={isRequired}
      setError={setError}
      isSuccessful={isSuccessful}
      setSuccessful={setSuccessful}
      sx={sx}
    >
      <Flex
        direction={isCheckbox ? 'row' : 'columnReverse'}
        sx={{
          // Setting height to 100% fixes issue with Firefox for our PhoneInput
          height: '100%',
        }}
      >
        <InputElement
          elementDescriptor={descriptors.formFieldInput}
          elementId={descriptors.formFieldInput.setId(id)}
          hasError={hasError}
          isDisabled={isDisabled}
          isRequired={isRequired}
          complexity={complexity}
          {...rest}
          ref={ref}
          placeholder={t(placeholder)}
        />
        <Flex
          justify={icon ? 'start' : 'between'}
          align='center'
          elementDescriptor={descriptors.formFieldLabelRow}
          elementId={descriptors.formFieldLabelRow.setId(id)}
          sx={theme => ({
            marginBottom: isCheckbox ? 0 : theme.space.$1,
            marginLeft: !isCheckbox ? 0 : theme.space.$1,
          })}
        >
          <FormLabel
            localizationKey={typeof label === 'object' ? label : undefined}
            elementDescriptor={descriptors.formFieldLabel}
            elementId={descriptors.formFieldLabel.setId(id)}
            hasError={hasError}
            isDisabled={isDisabled}
            isRequired={isRequired}
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {typeof label === 'string' ? label : undefined}
          </FormLabel>
          {icon && (
            // TODO: This is a temporary fix. Replace this when the tooltip component is introduced
            <Flex
              as={'span'}
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
            </Flex>
          )}
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
      </Flex>
      <FormErrorText
        elementDescriptor={descriptors.formFieldErrorText}
        elementId={descriptors.formFieldErrorText.setId(id)}
      >
        {errorText}
      </FormErrorText>
    </FormControlPrim>
  );
});
