import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-clerk-provider-dynamic.cjs';
import { fixtures } from './__fixtures__/transform-clerk-provider-dynamic.fixtures';

describe('transform-clerk-provider-dynamic', () => {
  it.each(fixtures)(`$name`, ({ source, output }) => {
    const result = applyTransform(transformer, {}, { source });

    expect(result).toEqual(output.trim());
  });
});
