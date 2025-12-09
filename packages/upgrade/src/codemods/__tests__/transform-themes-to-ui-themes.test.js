import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-themes-to-ui-themes.cjs';
import { fixtures } from './__fixtures__/transform-themes-to-ui-themes.fixtures';

describe('transform-themes-to-ui-themes', () => {
  it.each(fixtures)('$name', ({ source, output }) => {
    const result = applyTransform(transformer, {}, { source });

    expect(result).toEqual(output.trim());
  });
});
