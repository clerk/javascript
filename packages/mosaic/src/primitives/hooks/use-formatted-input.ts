import React from 'react';

interface PendingCaret {
  input: HTMLInputElement;
  acceptedBeforeCaret: string;
  deleteForward: boolean;
}

export interface UseFormattedInputOptions {
  value: string;
  onChange: (value: string) => void;
  format: (value: string) => string;
  accept?: RegExp;
}

export interface FormattedInputProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export function useFormattedInput({
  value,
  onChange,
  format,
  accept = /\d/,
}: UseFormattedInputOptions): FormattedInputProps {
  const pendingRef = React.useRef<PendingCaret | null>(null);
  const [, rerender] = React.useReducer((count: number) => count + 1, 0);

  React.useLayoutEffect(() => {
    const pending = pendingRef.current;
    if (!pending) {
      return;
    }
    pendingRef.current = null;
    const caret = findCaret(pending.input.value, pending.acceptedBeforeCaret, accept, pending.deleteForward);
    pending.input.setSelectionRange(caret, caret);
  });

  return {
    value,
    onChange: event => {
      const input = event.currentTarget;
      const rawValue = input.value;
      const beforeCaret = rawValue.slice(0, input.selectionStart ?? rawValue.length);
      pendingRef.current = {
        input,
        acceptedBeforeCaret: keepAccepted(beforeCaret, accept),
        deleteForward: isDeleteForward(event.nativeEvent),
      };
      onChange(format(rawValue));
      rerender();
    },
  };
}

function findCaret(value: string, acceptedBeforeCaret: string, accept: RegExp, deleteForward: boolean): number {
  const accepted = [...value].flatMap((char, index) => (isAccepted(char, accept) ? [{ char, index }] : []));
  let caret = 0;
  let matched = 0;
  for (const char of acceptedBeforeCaret) {
    const next = accepted[matched];
    if (next?.char === char) {
      caret = next.index + 1;
      matched++;
    }
  }
  if (deleteForward) {
    while (caret < value.length && !isAccepted(value.charAt(caret), accept)) {
      caret++;
    }
  }
  return caret;
}

function keepAccepted(value: string, accept: RegExp): string {
  return [...value].filter(char => isAccepted(char, accept)).join('');
}

function isDeleteForward(event: Event): boolean {
  return 'inputType' in event && event.inputType === 'deleteContentForward';
}

function isAccepted(char: string, accept: RegExp): boolean {
  return char.search(accept) !== -1;
}
