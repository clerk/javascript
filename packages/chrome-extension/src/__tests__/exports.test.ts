import { describe, expect, it } from 'vitest';

import * as publicExports from '../index';
import * as legacyExports from '../legacy';

describe('public exports', () => {
  it('should not include a breaking change', () => {
    expect(Object.keys(publicExports).sort()).toMatchSnapshot();
  });
});

describe('legacy public exports', () => {
  it('should not include a breaking change', () => {
    expect(Object.keys(legacyExports).sort()).toEqual(['useSignIn', 'useSignUp']);
  });
});
