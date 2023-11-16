import type { ClerkAPIError, FieldId } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';

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
import { usePrefersReducedMotion } from '../hooks';
import { sanitizeInputProps } from '../primitives/hooks';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';
import type { FeedbackType } from '../utils';
import { useFormControlFeedback } from '../utils';
import { useCardState } from './contexts';
import { PhoneInput } from './PhoneInput';

type FormControlProps = Omit<PropsOfComponent<typeof Input>, 'label' | 'placeholder'> & {
  id: FieldId;
  isRequired?: boolean;
  isOptional?: boolean;
  isFocused?: boolean;
  onActionClicked?: React.MouseEventHandler;
  isDisabled?: boolean;
  label?: string | LocalizationKey;
  placeholder?: string | LocalizationKey;
  actionLabel?: string | LocalizationKey;
  icon?: React.ComponentType;
  setError: (error: string | ClerkAPIError | undefined) => void;
  setWarning: (warning: string) => void;
  setInfo: (info: string) => void;
  setSuccess: (message: string) => void;
  feedback: string;
  feedbackType: FeedbackType;
  clearFeedback: () => void;
  hasPassedComplexity: boolean;
  infoText?: string | LocalizationKey;
};

// TODO: Convert this into a Component?
const getInputElementForType = ({ type }: { type: FormControlProps['type'] }) => {
  const CustomInputs = {
    tel: PhoneInput,
  };

  if (!type) {
    return Input;
  }

  const customInput = type as keyof typeof CustomInputs;
  return CustomInputs[customInput] || Input;
};

export function useFormTextAnimation() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const getFormTextAnimation = useCallback(
    (enterAnimation: boolean, options?: { inDelay?: boolean }): ThemableCssProp => {
      if (prefersReducedMotion) {
        return {
          animation: 'none',
        };
      }

      const inAnimation = options?.inDelay ? animations.inDelayAnimation : animations.inAnimation;

      return t => ({
        animation: `${enterAnimation ? inAnimation : animations.outAnimation} ${t.transitionDuration.$textField} ${
          t.transitionTiming.$common
        }`,
        transition: `height ${t.transitionDuration.$slow} ${t.transitionTiming.$common}`, // This is expensive but required for a smooth layout shift
      });
    },
    [prefersReducedMotion],
  );

  return {
    getFormTextAnimation,
  };
}

export const useCalculateErrorTextHeight = ({ feedback }: { feedback: string }) => {
  const [height, setHeight] = useState(0);

  const calculateHeight = useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        const computedStyles = getComputedStyle(element);
        setHeight(element.scrollHeight + parseInt(computedStyles.marginTop.replace('px', '')));
      }
    },
    [feedback],
  );

  return {
    height,
    calculateHeight,
  };
};

export type FormFeedbackDescriptorsKeys = 'error' | 'warning' | 'info' | 'success';

type Feedback = { feedback?: string; feedbackType?: FeedbackType; shouldEnter: boolean };

export type FormFeedbackProps = Partial<ReturnType<typeof useFormControlFeedback>['debounced'] & { id: FieldId }> & {
  elementDescriptors?: Partial<Record<FormFeedbackDescriptorsKeys, ElementDescriptor>>;
};

export const FormFeedback = (props: FormFeedbackProps) => {
  const { id, elementDescriptors, feedback, feedbackType = 'info' } = props;
  const feedbacksRef = useRef<{
    a?: Feedback;
    b?: Feedback;
  }>({ a: undefined, b: undefined });

  const { getFormTextAnimation } = useFormTextAnimation();
  const defaultElementDescriptors = {
    error: descriptors.formFieldErrorText,
    warning: descriptors.formFieldWarningText,
    info: descriptors.formFieldInfoText,
    success: descriptors.formFieldSuccessText,
  };

  const feedbacks = useMemo(() => {
    const oldFeedbacks = feedbacksRef.current;
    let result: {
      a?: Feedback;
      b?: Feedback;
    };
    if (oldFeedbacks.a?.shouldEnter) {
      result = {
        a: { ...oldFeedbacks.a, shouldEnter: false },
        b: {
          feedback,
          feedbackType,
          shouldEnter: true,
        },
      };
    } else {
      result = {
        a: {
          feedback,
          feedbackType,
          shouldEnter: true,
        },
        b: { ...oldFeedbacks.b, shouldEnter: false },
      };
    }
    feedbacksRef.current = result;
    return result;
  }, [feedback, feedbackType]);

  const { calculateHeight: calculateHeightA, height: heightA } = useCalculateErrorTextHeight({
    feedback: feedbacks.a?.feedback || '',
  });
  const { calculateHeight: calculateHeightB, height: heightB } = useCalculateErrorTextHeight({
    feedback: feedbacks.b?.feedback || '',
  });
  const maxHeightRef = useRef(Math.max(heightA, heightB));

  const maxHeight = useMemo(() => {
    const max = Math.max(heightA, heightB, maxHeightRef.current);
    maxHeightRef.current = max;
    return max;
  }, [heightA, heightB]);

  const getElementProps = (type?: FormFeedbackDescriptorsKeys) => {
    if (!type) {
      return {};
    }
    const descriptor = (elementDescriptors?.[type] || defaultElementDescriptors[type]) as ElementDescriptor | undefined;
    return {
      elementDescriptor: descriptor,
      elementId: id ? descriptor?.setId?.(id) : undefined,
    };
  };

  const FormInfoComponent: Record<
    FeedbackType,
    typeof FormErrorText | typeof FormInfoText | typeof FormSuccessText | typeof FormWarningText
  > = {
    error: FormErrorText,
    info: FormInfoText,
    success: FormSuccessText,
    warning: FormWarningText,
  };

  const InfoComponentA = FormInfoComponent[feedbacks.a?.feedbackType || 'info'];
  const InfoComponentB = FormInfoComponent[feedbacks.b?.feedbackType || 'info'];

  return (
    <Box
      style={{
        height: feedback ? maxHeight : 0, // dynamic height
        position: 'relative',
      }}
      sx={[getFormTextAnimation(!!feedback)]}
    >
      <InfoComponentA
        {...getElementProps(feedbacks.a?.feedbackType)}
        ref={calculateHeightA}
        sx={[
          () => ({
            visibility: feedbacks.a?.shouldEnter ? 'visible' : 'hidden',
          }),
          getFormTextAnimation(!!feedbacks.a?.shouldEnter, { inDelay: true }),
        ]}
        localizationKey={feedbacks.a?.feedback}
      />
      <InfoComponentB
        {...getElementProps(feedbacks.b?.feedbackType)}
        ref={calculateHeightB}
        sx={[
          () => ({
            visibility: feedbacks.b?.shouldEnter ? 'visible' : 'hidden',
          }),
          getFormTextAnimation(!!feedbacks.b?.shouldEnter, { inDelay: true }),
        ]}
        localizationKey={feedbacks.b?.feedback}
      />
    </Box>
  );
};

export const FormControl = forwardRef<HTMLInputElement, PropsWithChildren<FormControlProps>>((props, ref) => {
  const { t } = useLocalizations();
  const card = useCardState();
  const {
    hasPassedComplexity,
    infoText,
    id,
    isRequired,
    isOptional,
    isFocused,
    label,
    actionLabel,
    onActionClicked,
    sx,
    placeholder,
    icon,
    setError,
    setSuccess,
    feedback,
    feedbackType,
    setWarning,
    setInfo,
    clearFeedback,
    ...inputProps
  } = props;

  // @ts-expect-error This is because setHasPassedValidation is now missing from the inputProps Form.Control shall no longer be used for password fields.
  const sanitizedInputProps = sanitizeInputProps(inputProps);
  const isDisabled = props.isDisabled || card.isLoading;

  const InputElement = getInputElementForType({
    type: props.type,
  });

  const { debounced: debouncedState } = useFormControlFeedback({ feedback, feedbackType, isFocused });

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
      title={t(localizationKeys('formFieldHintText__slug'))}
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
      hasError={debouncedState.feedbackType === 'error'}
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
      hasError={debouncedState.feedbackType === 'error'}
      isDisabled={isDisabled}
      isRequired={isRequired}
      {...sanitizedInputProps}
      ref={ref}
      placeholder={t(placeholder)}
    />
  );

  return (
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
      clearFeedback={clearFeedback}
      sx={sx}
    >
      <Flex
        justify={icon ? 'start' : 'between'}
        align='center'
        elementDescriptor={descriptors.formFieldLabelRow}
        elementId={descriptors.formFieldLabelRow.setId(id)}
        sx={theme => ({
          marginBottom: theme.space.$1,
          marginLeft: 0,
        })}
      >
        {FieldLabel}
        {Icon}
        {HintLabel}
        {ActionLabel}
      </Flex>
      {Input}

      <FormFeedback
        {...debouncedState}
        id={id}
      />
    </FormControlPrim>
  );
});
