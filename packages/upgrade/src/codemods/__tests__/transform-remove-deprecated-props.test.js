import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-remove-deprecated-props.cjs';
import { fixtures } from './__fixtures__/transform-remove-deprecated-props.fixtures';

describe('transform-remove-deprecated-props', () => {
  it.each(fixtures)('$name', ({ source, output }) => {
    const result = applyTransform(transformer, {}, { source });

    expect(result).toEqual(output.trim());
  });
});

