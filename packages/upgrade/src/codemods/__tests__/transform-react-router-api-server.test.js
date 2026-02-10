import { applyTransform } from 'jscodeshift/dist/testUtils';
import { describe, expect, it } from 'vitest';

import transformer from '../transform-react-router-api-server.cjs';
import { fixtures } from './__fixtures__/transform-react-router-api-server.fixtures';

describe('transform-react-router-api-server', () => {
  it.each(fixtures)('$name', ({ source, output }) => {
    const result = applyTransform(transformer, {}, { source });

    expect(result).toEqual(output.trim());
  });
});
