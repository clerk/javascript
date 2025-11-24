import { describe, expect, it } from 'vitest';

import * as publicExports from '../index';

describe('public exports', () => {
  it('should not include a breaking change', () => {
    expect(Object.keys(publicExports).sort()).toMatchSnapshot();
  });
});
