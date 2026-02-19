import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-internal-clerk-js-ui-props.cjs';
import { fixtures } from './__fixtures__/transform-internal-clerk-js-ui-props.fixtures';

describe('transform-internal-clerk-js-ui-props', () => {
  it.each(fixtures)('$name', ({ source, output, noChange }) => {
    const result = applyTransform(transformer, {}, { source });

    if (noChange) {
      expect(result).toEqual('');
    } else {
      expect(result).toEqual(output.trim());
    }
  });
});
