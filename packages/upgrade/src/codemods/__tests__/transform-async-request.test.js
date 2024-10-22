import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-async-request.cjs';
import { fixtures } from './__fixtures__/transform-async-request.fixtures';

describe('transform-async-request', () => {
  it.each(fixtures)(`$name`, ({ source, output }) => {
    const result = applyTransform(transformer, {}, { source });

    expect(result).toEqual(output.trim());
  });
});
