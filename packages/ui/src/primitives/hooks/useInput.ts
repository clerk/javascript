import type { FormEvent } from 'react';
import React from 'react';

export function useInput(callback: React.FormEventHandler<HTMLInputElement> | null | undefined): {
  onChange: React.FormEventHandler<HTMLInputElement>;
  ref: React.MutableRefObject<HTMLInputElement | null>;
} {
  const ref = React.useRef<HTMLInputElement | null>(null);

  function onChange(e: FormEvent<HTMLInputElement>) {
    e.persist();
    if (typeof callback === 'function') {
      callback(e);
    }
  }

  return {
    onChange,
    ref,
  };
}
