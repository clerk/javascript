import type { FieldId } from '@clerk/types';
import type { ClerkAPIError } from '@clerk/types';
import React, { forwardRef, useCallback, useState, useMemo } from 'react';

import type { LocalizationKey } from '../customizables';
import {
  Box,
  descriptors,
  Flex,
  FormControl as FormControlPrim,
  FormErrorText,
  FormLabel,
  FormSuccessText,
  FormText,
  Icon,
  Input,
  Link,
  localizationKeys,
  Text,
  useLocalizations,
} from '../customizables';
import { usePrefersReducedMotion } from '../hooks';
import { CheckCircle, ExclamationCircle } from '../icons';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';
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
  setSuccessful: (isSuccess: boolean) => void;
  isSuccessful: boolean;
  hasLostFocus: boolean;
  enableErrorAfterBlur?: boolean;
  direction?: string;
  isFocused: boolean;
  debouncedState?: {
    errorText: string | undefined;
    isSuccessful: boolean;
    isFocused: boolean;
    direction: string | undefined;
  };
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

function useDelayUnmount(isMounted: string, delayTime: number) {
  const [shouldRender, setShouldRender] = React.useState('');

  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isMounted && !shouldRender) {
      timeoutId = setTimeout(() => setShouldRender(isMounted), delayTime);
    } else if (!isMounted && shouldRender) {
      timeoutId = setTimeout(() => setShouldRender(''), delayTime);
    }
    return () => clearTimeout(timeoutId);
  }, [isMounted, delayTime, shouldRender]);
  return shouldRender;
}

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
        animation: `${enterAnimation ? animations.inAnimation : animations.outAnimation} 600ms ${
          t.transitionTiming.$common
        }`,
      });
    },
    [prefersReducedMotion],
  );

  return {
    getFormTextAnimation,
  };
}

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
    direction,
    isFocused: _isFocused,
    debouncedState,
    ...rest
  } = props;
  const hasError = !!errorText && hasLostFocus;
  const isDisabled = props.isDisabled || card.isLoading;

  const InputElement = getInputElementForType(props.type);
  const isCheckbox = props.type === 'checkbox';

  const errorMessage = useDelayUnmount(debouncedState?.errorText || '', 500);
  const _successMessage = debouncedState?.isSuccessful ? 'Nice work. Your password is good' : '';
  const successMessage = useDelayUnmount(_successMessage || '', 500);
  const directionMessage = useDelayUnmount(debouncedState?.isFocused ? direction || '' : '', 500);

  const isSomeMessageVisible = directionMessage || successMessage || errorMessage;

  const [height, setHeight] = useState(24);

  const calculateHeight = useCallback((element: HTMLElement | null) => {
    if (element) {
      const fontSize = parseInt(getComputedStyle(element).fontSize.replace('px', ''));
      const width = parseInt(getComputedStyle(element).width.replace('px', ''));
      const lineHeight = parseInt(getComputedStyle(element).lineHeight.replace('px', '')) / 16;
      const characters = direction?.length || 0;

      setHeight(prevHeight => {
        const newHeight = 10 + fontSize * lineHeight * Math.ceil(characters / (width / (fontSize * 0.6))); //0.6 is an average character width
        if (prevHeight < newHeight) {
          return newHeight;
        }
        return prevHeight;
      });
    }
  }, []);

  const { getFormTextAnimation } = useFormTextAnimation();

  const shouldDisplayError = useMemo(() => {
    if (enableErrorAfterBlur) {
      if (submittedWithEnter) {
        return true;
      }
      return hasLostFocus;
    }
    return true;
  }, [enableErrorAfterBlur, hasLostFocus, submittedWithEnter]);

  return (
    <FormControlPrim
      elementDescriptor={descriptors.formField}
      elementId={descriptors.formField.setId(id)}
      id={id}
      hasError={hasError}
      isDisabled={isDisabled}
      isRequired={isRequired}
      setError={setError}
      isSuccessful={enableErrorAfterBlur ? hasLostFocus && isSuccessful : isSuccessful}
      setSuccessful={setSuccessful}
      sx={sx}
    >
      <Flex
        direction={isCheckbox ? 'row' : 'columnReverse'}
        sx={
          {
            // Setting height to 100% fixes issue with Firefox for our PhoneInput
            // height: '100%',
          }
        }
      >
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

      {isSomeMessageVisible && (
        <Box
          style={{
            height,
            position: 'relative',
          }}
          sx={getFormTextAnimation(
            !!debouncedState?.isFocused || !!debouncedState?.isSuccessful || !!debouncedState?.errorText,
          )}
        >
          {directionMessage && !successMessage && (
            <FormText
              variant='smallRegular'
              colorScheme='neutral'
              style={{
                position: 'absolute',
                top: '0px',
              }}
              ref={calculateHeight}
              sx={getFormTextAnimation(!!debouncedState?.isFocused && !debouncedState?.isSuccessful)}
            >
              {directionMessage}
            </FormText>
          )}
          {!directionMessage && errorMessage && (
            <FormErrorText
              elementDescriptor={descriptors.formFieldErrorText}
              elementId={descriptors.formFieldErrorText.setId(id)}
              style={{
                position: 'absolute',
                top: '0px',
              }}
              sx={getFormTextAnimation(!!debouncedState?.errorText)}
            >
              <Flex
                direction={'row'}
                align={'center'}
                gap={2}
              >
                <Icon
                  colorScheme={'danger'}
                  icon={ExclamationCircle}
                />
                {errorMessage}
              </Flex>
            </FormErrorText>
          )}
          {!errorMessage && successMessage && (
            <FormSuccessText
              elementDescriptor={descriptors.formFieldErrorText}
              elementId={descriptors.formFieldErrorText.setId(id)}
              colorScheme={'neutral'}
              style={{
                position: 'absolute',
                top: '0px',
              }}
              sx={getFormTextAnimation(!!debouncedState?.isSuccessful)}
            >
              <Flex
                direction={'row'}
                align={'center'}
                gap={2}
              >
                <Icon
                  colorScheme={'success'}
                  icon={CheckCircle}
                />
                {successMessage}
              </Flex>
            </FormSuccessText>
          )}
        </Box>
      )}
    </FormControlPrim>
  );
});
