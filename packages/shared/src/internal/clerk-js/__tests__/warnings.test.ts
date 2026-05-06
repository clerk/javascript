import { describe, expect, it } from 'vitest';

import { warnings } from '../warnings';

describe('warnings', () => {
  describe('cannotOpenSignInOrSignUp', () => {
    it('explains that the behavior is expected', () => {
      expect(warnings.cannotOpenSignInOrSignUp).toContain('expected behavior');
    });

    it('mentions single-session mode', () => {
      expect(warnings.cannotOpenSignInOrSignUp).toContain('single-session mode');
    });

    it('mentions multi-session as the resolution', () => {
      expect(warnings.cannotOpenSignInOrSignUp).toContain('multi-session mode');
    });

    it('includes the development notice', () => {
      expect(warnings.cannotOpenSignInOrSignUp).toContain('This notice only appears in development');
    });
  });
});
