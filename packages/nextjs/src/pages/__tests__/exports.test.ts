import { describe, expect, it } from 'vitest';

import * as publicExports from '../ClerkProvider';

describe('/client public exports', () => {
  it('should not include a breaking change', () => {
    expect(publicExports).toMatchSnapshot();
  });
});
