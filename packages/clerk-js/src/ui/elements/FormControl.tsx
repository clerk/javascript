import type { FieldId } from '@clerk/types';
import type { ClerkAPIError } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';

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
import { useFieldMessageVisibility, usePrefersReducedMotion } from '../hooks';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';
import { useFormControlFeedback } from '../utils';
import { useCardState } from './contexts';
import { useFormState } from './Form';
import { PasswordInput } from './PasswordInput';
import { PhoneInput } from './PhoneInput';
import { RadioGroup } from './RadioGroup';

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
  informationText?: string;
  radioOptions?: {
    value: string;
    label: string | LocalizationKey;
    description?: string | LocalizationKey;
  }[];
  isFocused: boolean;
};

// TODO: Convert this into a Component?
const getInputElementForType = (type: FormControlProps['type']) => {
  const CustomInputs = {
    password: PasswordInput,
    tel: PhoneInput,
    radio: RadioGroup,
  };
  if (!type) {
    return Input;
  }
  const customInput = type as keyof typeof CustomInputs;
  return CustomInputs[customInput] || Input;
};

function useFormTextAnimation() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const getFormTextAnimation = useCallback(
    (enterAnimation: boolean): ThemableCssProp => {
      if (prefersReducedMotion) {
        return {
          animation: 'none',
        };
      }
      return t => ({
        animation: `${enterAnimation ? animations.inAnimation : animations.outAnimation} ${
          t.transitionDuration.$textField
        } ${t.transitionTiming.$common}`,
        transition: `height ${t.transitionDuration.$slow}  ${t.transitionTiming.$common}`, // This is expensive but required for a smooth layout shift
      });
    },
    [prefersReducedMotion],
  );

  return {
    getFormTextAnimation,
  };
}

type CalculateConfigProps = {
  recalculate?: string | undefined;
};
type Px = number;
const useCalculateErrorTextHeight = (config: CalculateConfigProps = {}) => {
  const [height, setHeight] = useState<Px>(24);

  const calculateHeight = useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        const computedStyles = getComputedStyle(element);
        const marginTop = parseInt(computedStyles.marginTop.replace('px', ''));

        const newHeight = 1.1 * marginTop + element.scrollHeight;
        setHeight(newHeight);
      }
    },
    [config?.recalculate],
  );
  return {
    height,
    calculateHeight,
  };
};

type FormFeedbackDescriptorsKeys = 'error' | 'warning' | 'info' | 'success';

type FormFeedbackProps = Partial<ReturnType<typeof useFormControlFeedback>['debounced'] & { id: FieldId }> & {
  elementDescriptors?: Partial<Record<FormFeedbackDescriptorsKeys, ElementDescriptor>>;
};

const delay = 350;

export const FormFeedback = (props: FormFeedbackProps) => {
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
        >
          {informationMessage}
        </FormInfoText>
      )}
      {/* Display the error message after the directions is unmounted*/}
      {errorMessage && (
        <FormErrorText
          {...getElementProps('error')}
          ref={calculateHeight}
          sx={getFormTextAnimation(!!props?.errorText)}
        >
          {errorMessage}
        </FormErrorText>
      )}

      {/* Display the success message after the error message is unmounted*/}
      {!errorMessage && successMessage && (
        <FormSuccessText
          {...getElementProps('success')}
          ref={calculateHeight}
          sx={getFormTextAnimation(!!props?.successfulText)}
        >
          {successMessage}
        </FormSuccessText>
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

export const FormControl = forwardRef<HTMLInputElement, PropsWithChildren<FormControlProps>>((props, ref) => {
  const { t } = useLocalizations();
  const card = useCardState();
  const { submittedWithEnter } = useFormState();
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
    successfulText,
    setSuccessful,
    hasLostFocus,
    enableErrorAfterBlur,
    informationText,
    isFocused: _isFocused,
    warningText,
    setWarning,
    setHasPassedComplexity,
    hasPassedComplexity,
    radioOptions,
    ...restInputProps
  } = props;

  const isDisabled = props.isDisabled || card.isLoading;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { validatePassword, ...inputProps } = restInputProps;

  const inputElementProps = useMemo(() => {
    const propMap = {
      password: restInputProps,
      radio: {
        ...inputProps,
        radioOptions,
      },
    };
    if (!props.type) {
      return inputProps;
    }
    const type = props.type as keyof typeof propMap;
    return propMap[type] || inputProps;
  }, [restInputProps]);

  const InputElement = getInputElementForType(props.type);
  const isCheckbox = props.type === 'checkbox';

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

  const ActionLabel = actionLabel ? (
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
  ) : null;

  const HintLabel =
    isOptional && !actionLabel ? (
      <Text
        localizationKey={localizationKeys('formFieldHintText__optional')}
        elementDescriptor={descriptors.formFieldHintText}
        elementId={descriptors.formFieldHintText.setId(id)}
        as='span'
        colorScheme='neutral'
        variant='smallRegular'
        isDisabled={isDisabled}
      />
    ) : null;

  // TODO: This is a temporary fix. Replace this when the tooltip component is introduced
  const Icon = icon ? (
    <Flex
      as={'span'}
      title='A slug is a human-readable ID that must be unique.  It’s often used in URLs.'
    >
      <IconCustomizable
        icon={icon}
        sx={theme => ({
          marginLeft: theme.space.$0x5,
          color: theme.colors.$blackAlpha400,
          width: theme.sizes.$4,
          height: theme.sizes.$4,
        })}
      />
    </Flex>
  ) : null;

  const FieldLabel = (
    <FormLabel
      localizationKey={typeof label === 'object' ? label : undefined}
      elementDescriptor={descriptors.formFieldLabel}
      elementId={descriptors.formFieldLabel.setId(id)}
      hasError={!!errorMessage}
      isDisabled={isDisabled}
      isRequired={isRequired}
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {typeof label === 'string' ? label : undefined}
    </FormLabel>
  );

  const Input = (
    <InputElement
      elementDescriptor={descriptors.formFieldInput}
      elementId={descriptors.formFieldInput.setId(id)}
      hasError={!!errorMessage}
      isDisabled={isDisabled}
      isRequired={isRequired}
      {...inputElementProps}
      ref={ref}
      placeholder={t(placeholder)}
    />
  );

  return (
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
      {isCheckbox ? (
        <Flex direction={'row'}>
          {Input}
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
            {FieldLabel}
            {Icon}
            {HintLabel}
            {ActionLabel}
          </Flex>
        </Flex>
      ) : (
        <>
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
            {FieldLabel}
            {Icon}
            {HintLabel}
            {ActionLabel}
          </Flex>
          {Input}
        </>
      )}

      <FormFeedback
        {...debouncedState}
        id={id}
      />
    </FormControlPrim>
  );
});
