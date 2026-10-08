import { useEffect, useRef, useState } from 'react';

import type { InstantPasswordRowProps } from './instant-password-row.types';

export const useInstantPasswordRowController = (model: InstantPasswordRowProps) => {
  const [autofilled, setAutofilled] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const hasField = !!model.field;
  const hasValue = !!model.field?.value;
  const show = hasField && (autofilled || hasValue);

  // show password if it's autofilled by the browser
  useEffect(() => {
    if (!hasField || hasValue) {
      setAutofilled(false);
      return;
    }
    if (autofilled) {
      return;
    }
    let active = true;
    const intervalId = setInterval(() => {
      const input = ref.current;
      if (active && input) {
        const detected =
          window.getComputedStyle(input).animationName === 'onAutoFillStart' ||
          // https://github.com/facebook/react/issues/1159#issuecomment-1025423604
          [':autofill', ':-webkit-autofill'].some(selector => {
            try {
              return input.matches(selector);
            } catch {
              return false;
            }
          });
        if (detected) {
          active = false;
          clearInterval(intervalId);
          setAutofilled(true);
        }
      }
    }, 500);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [hasField, hasValue, autofilled]);

  return { ...model, inputRef: ref, show };
};
