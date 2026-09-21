import { describe, expect, it } from 'vitest';

import { compareRequiredFirstThenAlphabetical } from '../sort-reflections.mjs';

describe('compareRequiredFirstThenAlphabetical', () => {
  it('sorts required reflections first and alphabetizes within each group', () => {
    const reflections = [
      { name: 'zebra', flags: { isOptional: true } },
      { name: 'beta', flags: { isOptional: false } },
      { name: 'alpha', flags: { isOptional: true } },
      { name: 'alpha', flags: { isOptional: false } },
    ];

    expect(
      reflections
        .sort(compareRequiredFirstThenAlphabetical)
        .map(reflection => `${reflection.name}:${reflection.flags.isOptional ? 'optional' : 'required'}`),
    ).toEqual(['alpha:required', 'beta:required', 'alpha:optional', 'zebra:optional']);
  });
});
