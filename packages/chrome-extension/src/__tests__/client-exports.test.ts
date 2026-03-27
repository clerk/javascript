import { describe, expect, it } from 'vitest';

import * as publicExports from '../client';

describe('client public exports', () => {
  it('should not include a breaking change', () => {
    expect(Object.keys(publicExports).sort()).toMatchSnapshot();
  });
});
