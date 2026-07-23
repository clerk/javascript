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

  describe('createCannotRenderComponentWhenPermissionIsMissing', () => {
    const message = warnings.createCannotRenderComponentWhenPermissionIsMissing(
      'InviteMembers',
      'org:sys_memberships:manage',
    );

    it('names the component and the missing permission', () => {
      expect(message).toContain('<InviteMembers/>');
      expect(message).toContain('org:sys_memberships:manage');
    });

    it('explains it is a no-op and how to gate the component', () => {
      expect(message).toContain('this is no-op');
      expect(message).toContain('<Show when=');
    });

    it('includes the development notice', () => {
      expect(message).toContain('This notice only appears in development');
    });
  });
});
