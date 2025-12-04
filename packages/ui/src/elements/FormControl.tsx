import type { FieldId } from '@clerk/shared/types';
import { titleize } from '@clerk/shared/underscore';
import { useCallback, useMemo, useRef, useState } from 'react';

import {
  descriptors,
  Flex,
  FormErrorText,
  FormInfoText,
  FormSuccessText,
  FormWarningText,
  Span,
  useAppearance,
} from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import { usePrefersReducedMotion } from '../hooks';
import type { ThemableCssProp } from '../styledSystem';
import { animations, common } from '../styledSystem';
import type { FeedbackType, useFormControlFeedback } from '../utils/useFormControl';

function useFormTextAnimation() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: appearanceAnimations } = useAppearance().parsedOptions;

  const getFormTextAnimation = useCallback(
    (enterAnimation: boolean, options?: { inDelay?: boolean }): ThemableCssProp => {
      if (prefersReducedMotion || !appearanceAnimations) {
        return {
          animation: 'none',
        };
      }

      const inAnimation = options?.inDelay ? animations.inDelayAnimation : animations.inAnimation;

      return t => ({
        animation: `${enterAnimation ? inAnimation : animations.outAnimation} ${t.transitionDuration.$textField} ${
          t.transitionTiming.$common
        }`,
        transitionProperty: 'height',
        transitionDuration: t.transitionDuration.$slow,
        transitionTimingFunction: t.transitionTiming.$common,
      });
    },
    [prefersReducedMotion, appearanceAnimations],
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
        setHeight(element.scrollHeight + element.offsetTop * 2);
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
  center?: boolean;
  sx?: ThemableCssProp;
};

export const FormFeedback = (props: FormFeedbackProps) => {
  const { id, elementDescriptors, sx, feedback, feedbackType = 'info', center = false } = props;
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
      // Use legacy pattern for errors (backwards compatible), new pattern for other types
      id: type === 'error' ? `error-${id}` : `${id}-${type}-feedback`,
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
    <>
      {/* Screen reader only live region that updates when feedback changes */}
      <Span
        aria-live='polite'
        aria-atomic='true'
        sx={{
          ...common.visuallyHidden(),
        }}
      >
        {feedback ? titleize(feedback) : ''}
      </Span>
      <Flex
        style={{
          height: feedback ? maxHeight : 0, // dynamic height
          position: 'relative',
        }}
        center={center}
        sx={[getFormTextAnimation(!!feedback), sx]}
      >
        <InfoComponentA
          {...getElementProps(feedbacks.a?.feedbackType)}
          {...(feedbacks.a?.feedbackType && { 'data-testid': `form-feedback-${feedbacks.a.feedbackType}` })}
          ref={calculateHeightA}
          sx={[
            () => ({
              visibility: feedbacks.a?.shouldEnter ? 'visible' : 'hidden',
            }),
            getFormTextAnimation(!!feedbacks.a?.shouldEnter, { inDelay: true }),
          ]}
          localizationKey={titleize(feedbacks.a?.feedback)}
        />
        <InfoComponentB
          {...getElementProps(feedbacks.b?.feedbackType)}
          {...(feedbacks.b?.feedbackType && { 'data-testid': `form-feedback-${feedbacks.b.feedbackType}` })}
          ref={calculateHeightB}
          sx={[
            () => ({
              visibility: feedbacks.b?.shouldEnter ? 'visible' : 'hidden',
            }),
            getFormTextAnimation(!!feedbacks.b?.shouldEnter, { inDelay: true }),
          ]}
          localizationKey={titleize(feedbacks.b?.feedback)}
        />
      </Flex>
    </>
  );
};
