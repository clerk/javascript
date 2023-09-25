import type { FieldId } from '@clerk/types';
import type { ClerkAPIError } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
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
import { usePrefersReducedMotion } from '../hooks';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';
import type { FeedbackType } from '../utils';
import { useFormControlFeedback } from '../utils';
import { useCardState } from './contexts';
import { InputGroup } from './InputGroup';
import { PasswordInput } from './PasswordInput';
import { PhoneInput } from './PhoneInput';
import { RadioGroup } from './RadioGroup';

type FormControlProps = Omit<PropsOfComponent<typeof Input>, 'label' | 'placeholder'> & {
  id: FieldId;
  isRequired?: boolean;
  isOptional?: boolean;
  onActionClicked?: React.MouseEventHandler;
  isDisabled?: boolean;
  label?: string | LocalizationKey;
  placeholder?: string | LocalizationKey;
  actionLabel?: string | LocalizationKey;
  icon?: React.ComponentType;
  validatePassword?: boolean;
  setError: (error: string | ClerkAPIError | undefined) => void;
  setWarning: (warning: string) => void;
  setInfo: (info: string) => void;
  setSuccess: (message: string) => void;
  feedback: string;
  feedbackType: FeedbackType;
  setHasPassedComplexity: (b: boolean) => void;
  hasPassedComplexity: boolean;
  infoText?: string | LocalizationKey;
  radioOptions?: {
    value: string;
    label: string | LocalizationKey;
    description?: string | LocalizationKey;
  }[];
  groupPreffix?: string;
  groupSuffix?: string;
};

// TODO: Convert this into a Component?
const getInputElementForType = ({
  type,
  groupPreffix,
  groupSuffix,
}: {
  type: FormControlProps['type'];
  groupPreffix: string | undefined;
  groupSuffix: string | undefined;
}) => {
  const CustomInputs = {
    password: PasswordInput,
    tel: PhoneInput,
    radio: RadioGroup,
  };

  if (groupPreffix || groupSuffix) {
    return InputGroup;
  }
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
        transition: `height ${t.transitionDuration.$slow} ${t.transitionTiming.$common}`, // This is expensive but required for a smooth layout shift
      });
    },
    [prefersReducedMotion],
  );

  return {
    getFormTextAnimation,
  };
}

const useCalculateErrorTextHeight = ({ feedback }: { feedback: string }) => {
  const [height, setHeight] = useState(0);

  const calculateHeight = useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        setHeight(element.scrollHeight);
      }
    },
    [feedback],
  );

  return {
    height,
    calculateHeight,
  };
};

type FormFeedbackDescriptorsKeys = 'error' | 'warning' | 'info' | 'success';

type Feedback = { feedback?: string; feedbackType?: FeedbackType; shouldEnter: boolean };

type FormFeedbackProps = Partial<ReturnType<typeof useFormControlFeedback>['debounced'] & { id: FieldId }> & {
  elementDescriptors?: Partial<Record<FormFeedbackDescriptorsKeys, ElementDescriptor>>;
};

export const FormFeedback = (props: FormFeedbackProps) => {
  const { id, elementDescriptors, feedback, feedbackType = 'info' } = props;
  const [feedbacks, setFeedbacks] = useState<{
    a?: Feedback;
    b?: Feedback;
  }>({ a: { feedback, feedbackType, shouldEnter: true }, b: undefined });
  const { calculateHeight: calculateHeightA, height: heightA } = useCalculateErrorTextHeight({
    feedback: feedbacks.a?.feedback || '',
  });
  const { calculateHeight: calculateHeightB, height: heightB } = useCalculateErrorTextHeight({
    feedback: feedbacks.b?.feedback || '',
  });
  const [heightMax, setHeightMax] = useState(Math.max(heightA, heightB));

  const { getFormTextAnimation } = useFormTextAnimation();
  const defaultElementDescriptors = {
    error: descriptors.formFieldErrorText,
    warning: descriptors.formFieldWarningText,
    info: descriptors.formFieldInfoText,
    success: descriptors.formFieldSuccessText,
  };

  useEffect(() => {
    setFeedbacks(oldFeedbacks => {
      if (oldFeedbacks.a?.shouldEnter) {
        return {
          a: { ...oldFeedbacks.a, shouldEnter: false },
          b: {
            feedback,
            feedbackType,
            shouldEnter: true,
          },
        };
      } else {
        return {
          a: {
            feedback,
            feedbackType,
            shouldEnter: true,
          },
          b: { ...oldFeedbacks.b, shouldEnter: false },
        };
      }
    });
  }, [feedback, feedbackType]);

  useEffect(() => {
    setHeightMax(h => Math.max(heightA, heightB, h));
  }, [heightA, heightB]);

  const getElementProps = (type: FormFeedbackDescriptorsKeys) => {
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
        height: feedback ? heightMax : 0, // dynamic height
        position: 'relative',
      }}
      sx={[getFormTextAnimation(!!feedback)]}
    >
      <Box>
        <InfoComponentA
          {...(feedbacks.a?.feedbackType ? getElementProps(feedbacks.a.feedbackType) : {})}
          ref={calculateHeightA}
          sx={[
            () => ({
              visibility: feedbacks.a?.shouldEnter ? 'visible' : 'hidden',
            }),
            getFormTextAnimation(!!feedbacks.a?.shouldEnter),
          ]}
          localizationKey={feedbacks.a?.feedback}
        />
        <InfoComponentB
          {...(feedbacks.b?.feedbackType ? getElementProps(feedbacks.b.feedbackType) : {})}
          ref={calculateHeightB}
          sx={[
            () => ({
              visibility: feedbacks.b?.shouldEnter ? 'visible' : 'hidden',
            }),
            getFormTextAnimation(!!feedbacks.b?.shouldEnter),
          ]}
          localizationKey={feedbacks.b?.feedback}
        />
      </Box>
    </Box>
  );
};

export const FormControl = forwardRef<HTMLInputElement, PropsWithChildren<FormControlProps>>((props, ref) => {
  const { t } = useLocalizations();
  const card = useCardState();
  const [isFocused, setIsFocused] = useState(false);
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasPassedComplexity,
    infoText,
    id,
    isRequired,
    isOptional,
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
    setHasPassedComplexity,
    radioOptions,
    groupPreffix,
    groupSuffix,
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

    if (groupPreffix || groupSuffix) {
      return {
        ...inputProps,
        groupPreffix,
        groupSuffix,
      };
    }

    if (!props.type) {
      return inputProps;
    }
    const type = props.type as keyof typeof propMap;
    return propMap[type] || inputProps;
  }, [restInputProps]);

  const InputElement = getInputElementForType({
    type: props.type,
    groupPreffix,
    groupSuffix,
  });

  const isCheckbox = props.type === 'checkbox';

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
      {...inputElementProps}
      onFocus={e => {
        inputElementProps.onFocus?.(e);
        setIsFocused(true);
      }}
      onBlur={e => {
        inputElementProps.onBlur?.(e);
        // set a timeout because new errors might appear
        // and we don't want to spam layout shifts
        setTimeout(() => {
          setIsFocused(false);
        }, 500);
      }}
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
