import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-appearance-layout-to-options.cjs';
import { fixtures } from './__fixtures__/transform-appearance-layout-to-options.fixtures';

describe('transform-appearance-layout-to-options', () => {
  it.each(fixtures)('$name', ({ source, output }) => {
    const result = applyTransform(transformer, {}, { source });

    expect(result).toEqual(output.trim());
  });
});
