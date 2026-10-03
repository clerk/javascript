import { describe, expect, it } from 'vitest';

import { errorMessages } from './errors.messages';

const paramsSupplied = new Set(['form_username_invalid_length']);

describe('errorMessages', () => {
  it('only asks for values its callers supply', () => {
    const needsValues = Object.entries(errorMessages)
      .filter(([, copy]) => /\{\w+\}/.test(copy))
      .map(([code]) => code);
    expect(needsValues.filter(code => !paramsSupplied.has(code))).toEqual([]);
  });
});
