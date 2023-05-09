import type { FieldId } from '@clerk/types';
import type { ClerkAPIError } from '@clerk/types';
import React, { forwardRef, useCallback, useState } from 'react';

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
import { useFieldMessageVisibility, usePrefersReducedMotion } from '../hooks';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';
import { useFormControlFeedback } from '../utils';
import { useCardState } from './contexts';
import { useFormState } from './Form';
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
  warningText: string | undefined;
  setWarning: (error: string) => void;
  setSuccessful: (isSuccess: boolean) => void;
  isSuccessful: boolean;
  hasLostFocus: boolean;
  enableErrorAfterBlur?: boolean;
  informationText?: string;
  isFocused: boolean;
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
          t.transitionDuration.$slower
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

type Px = number;
const useCalculateErrorTextHeight = () => {
  const [height, setHeight] = useState<Px>(24);

  const calculateHeight = useCallback((element: HTMLElement | null, messageToDisplay: string | undefined) => {
    if (element) {
      const computedStyles = getComputedStyle(element);
      const fontSize = parseInt(computedStyles.fontSize.replace('px', ''));
      const width = parseInt(computedStyles.width.replace('px', ''));
      const marginTop = parseInt(computedStyles.marginTop.replace('px', ''));
      const lineHeight = parseInt(computedStyles.lineHeight.replace('px', '')) / 16;
      const characters = messageToDisplay?.length || 0;

      setHeight(prevHeight => {
        const newHeight = marginTop + fontSize * lineHeight * Math.ceil(characters / (width / (fontSize * 0.6))); //0.6 is an average character width
        if (prevHeight < newHeight) {
          return newHeight;
        }
        return prevHeight;
      });
    }
  }, []);
  return {
    height,
    calculateHeight,
  };
};

export const FormControl = forwardRef<HTMLInputElement, FormControlProps>((props, ref) => {
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
    isSuccessful,
    setSuccessful,
    hasLostFocus,
    enableErrorAfterBlur,
    informationText,
    isFocused: _isFocused,
    warningText,
    setWarning,
    ...rest
  } = props;
  const isDisabled = props.isDisabled || card.isLoading;

  const InputElement = getInputElementForType(props.type);
  const isCheckbox = props.type === 'checkbox';

  const { debounced: debouncedState } = useFormControlFeedback({
    errorText,
    informationText,
    enableErrorAfterBlur,
    isFocused: _isFocused,
    hasLostFocus,
    isSuccessful,
    warningText,
    skipBlur: submittedWithEnter,
  });

  const errorMessage = useFieldMessageVisibility(debouncedState.errorText, 200);
  const _successMessage = debouncedState.isSuccessful
    ? t(localizationKeys('unstable__errors.zxcvbn.goodPassword'))
    : '';
  const successMessage = useFieldMessageVisibility(_successMessage, 200);
  const informationMessage = useFieldMessageVisibility(debouncedState.informationText, 200);
  const warningMessage = useFieldMessageVisibility(debouncedState.warningText, 200);

  const messageToDisplay = informationMessage || successMessage || errorMessage || warningMessage;
  const isSomeMessageVisible = !!messageToDisplay;

  const { calculateHeight, height } = useCalculateErrorTextHeight();

  const { getFormTextAnimation } = useFormTextAnimation();

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
      {...rest}
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

      {isSomeMessageVisible && (
        <Box
          style={{
            height, // dynamic height
            position: 'relative',
          }}
          sx={[
            getFormTextAnimation(
              !!debouncedState.informationText ||
                debouncedState.isSuccessful ||
                !!debouncedState.errorText ||
                !!debouncedState.warningText,
            ),
          ]}
        >
          {/*Display the directions after is success message is unmounted*/}
          {!successMessage && !warningMessage && !errorMessage && informationMessage && (
            <FormInfoText
              ref={e => calculateHeight(e, informationMessage)}
              sx={getFormTextAnimation(
                debouncedState.isFocused && !debouncedState?.isSuccessful && !debouncedState.warningText,
              )}
            >
              {informationMessage}
            </FormInfoText>
          )}
          {/* Display the error message after the directions is unmounted*/}
          {errorMessage && (
            <FormErrorText
              ref={e => calculateHeight(e, errorMessage)}
              elementDescriptor={descriptors.formFieldErrorText}
              elementId={descriptors.formFieldErrorText.setId(id)}
              sx={getFormTextAnimation(!!debouncedState?.errorText)}
            >
              {errorMessage}
            </FormErrorText>
          )}

          {/* Display the success message after the error message is unmounted*/}
          {!errorMessage && successMessage && (
            <FormSuccessText
              ref={e => calculateHeight(e, successMessage)}
              elementDescriptor={descriptors.formFieldSuccessText}
              elementId={descriptors.formFieldSuccessText.setId(id)}
              sx={getFormTextAnimation(!!debouncedState?.isSuccessful)}
            >
              {successMessage}
            </FormSuccessText>
          )}

          {warningMessage && (
            <FormWarningText
              ref={e => calculateHeight(e, warningMessage)}
              elementDescriptor={descriptors.formFieldWarningText}
              elementId={descriptors.formFieldWarningText.setId(id)}
              sx={getFormTextAnimation(!!debouncedState.warningText)}
            >
              {warningMessage}
            </FormWarningText>
          )}
        </Box>
      )}
    </FormControlPrim>
  );
});
