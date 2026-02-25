import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-clerk-types-to-shared-types.cjs';
import { fixtures } from './__fixtures__/transform-clerk-types-to-shared-types.fixtures';

describe('transform-clerk-types-to-shared-types', () => {
  it.each(fixtures)('$name', ({ source, output }) => {
    const result = applyTransform(transformer, {}, { source });

    expect(result).toEqual(output.trim());
  });
});
