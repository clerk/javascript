import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-protect-to-show.cjs';
import { fixtures } from './__fixtures__/transform-protect-to-show.fixtures';

describe('transform-protect-to-show', () => {
  it.each(fixtures)(`$name`, ({ source, output }) => {
    const result = applyTransform(transformer, {}, { source });

    if (output === null) {
      // null output means no transformation should occur
      expect(result).toBeFalsy();
    } else {
      expect(result).toEqual(output.trim());
    }
  });
});
