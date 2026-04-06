import { describe, expect, it } from 'vitest';

import * as publicExports from '..';

describe('module exports', () => {
  it('should not change unless explicitly set', () => {
    expect(Object.keys(publicExports).sort()).toMatchSnapshot();
  });
});
