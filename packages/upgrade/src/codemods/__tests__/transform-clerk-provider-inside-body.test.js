import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-clerk-provider-inside-body.cjs';
import { fixtures } from './__fixtures__/transform-clerk-provider-inside-body.fixtures';

describe('transform-clerk-provider-inside-body', () => {
  it.each(fixtures)(`$name`, ({ source, output }) => {
    const result = applyTransform(transformer, {}, { source });

    expect(result).toEqual(output.trim());
  });
});
