import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-satellite-auto-sync.cjs';
import { fixtures } from './__fixtures__/transform-satellite-auto-sync.fixtures';

describe('transform-satellite-auto-sync', () => {
  it.each(fixtures)('$name', ({ source, output, noChange }) => {
    const result = applyTransform(transformer, {}, { source });

    if (noChange) {
      expect(result).toEqual('');
    } else {
      expect(result).toEqual(output.trim());
    }
  });
});
