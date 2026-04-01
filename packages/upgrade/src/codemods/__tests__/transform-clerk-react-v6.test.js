import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-clerk-react-v6.cjs';
import { fixtures } from './__fixtures__/transform-clerk-react-v6.fixtures';

describe('transform-clerk-react-v6', () => {
  it.each(fixtures)(`$name`, ({ source, output }) => {
    const result = applyTransform(transformer, {}, { source });

    expect(result).toEqual(output.trim());
  });
});
