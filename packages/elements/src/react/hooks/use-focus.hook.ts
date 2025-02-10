import * as React from 'react';

export const useFocus = (inputRef: React.RefObject<HTMLInputElement>) => {
  const [isFocused, setIsFocused] = React.useState<boolean | undefined>(undefined);
  const isFocusedRef = React.useRef<boolean | undefined>(isFocused);

  isFocusedRef.current = isFocused;

  React.useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    const onFocus = () => setIsFocused(true);
    const onBlur = () => setIsFocused(false);
    input.addEventListener('focus', onFocus);
    input.addEventListener('blur', onBlur);

    if (isFocusedRef.current === undefined) {
      setIsFocused(document.activeElement === input);
    }

    return () => {
      input.removeEventListener('focus', onFocus);
      input.removeEventListener('blur', onBlur);
    };
  }, [inputRef, setIsFocused]);

  return Boolean(isFocused);
};
