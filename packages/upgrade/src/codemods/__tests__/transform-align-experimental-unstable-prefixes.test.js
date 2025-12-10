import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-align-experimental-unstable-prefixes.cjs';
import { fixtures } from './__fixtures__/transform-align-experimental-unstable-prefixes.fixtures';

describe('transform-align-experimental-unstable-prefixes', () => {
  it.each(fixtures)('$name', ({ source, output }) => {
    const result = applyTransform(transformer, {}, { source }) || source.trim();

    expect(result).toEqual(output.trim());
  });
});
