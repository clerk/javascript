import React from 'react';

export function useInput(callback: ((el: HTMLInputElement) => void) | null | undefined): {
  onChange: (e: React.ChangeEvent) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  ref: React.MutableRefObject<HTMLInputElement | null>;
} {
  const ref = React.useRef<HTMLInputElement | null>(null);

  function onChange(e: React.ChangeEvent) {
    e.persist();
    if (typeof callback === 'function') {
      callback(e.target as HTMLInputElement);
    }
  }

  function onKeyPress(e: React.KeyboardEvent) {
    const switcher: HTMLInputElement | null = e.currentTarget.querySelector('input[type=checkbox], input[type=radio]');

    if (switcher && !switcher.disabled) {
      const SPACE = 32;
      if (e.charCode !== SPACE) {
        return;
      }

      e.persist();
      e.preventDefault();

      switcher.checked = !switcher.checked;

      if (typeof callback === 'function') {
        callback(switcher);
      }
    }
  }

  return {
    onChange,
    onKeyPress,
    ref,
  };
}
