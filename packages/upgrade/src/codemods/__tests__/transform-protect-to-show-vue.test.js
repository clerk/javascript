import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-protect-to-show-vue.cjs';
import { fixtures } from './__fixtures__/transform-protect-to-show-vue.fixtures';

describe('transform-protect-to-show-vue', () => {
  it.each(fixtures)(`$name`, ({ source, output, path }) => {
    const result = applyTransform(transformer, {}, { source, path });

    if (output === null) {
      // null output means no transformation should occur
      expect(result).toBeFalsy();
    } else {
      expect(result).toEqual(output.trim());
    }
  });
});
