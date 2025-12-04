import type { SessionStatusClaim } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { createRedirect } from '../createRedirect';

describe('redirect(redirectAdapter)', () => {
  const returnBackUrl = 'http://current.url:3000/path?q=1#hash';
  const encodedUrl = 'http%3A%2F%2Fcurrent.url%3A3000%2Fpath%3Fq%3D1%23hash';

  describe.each(['active', 'pending'] satisfies Array<SessionStatusClaim>)('with %s session status', sessionStatus => {
    it('exposes redirectToSignIn / redirectToSignUp', () => {
      const helpers = createRedirect({
        redirectAdapter: vi.fn().mockImplementation(() => {}),
        publishableKey: '',
        baseUrl: 'http://www.clerk.com',
        sessionStatus,
      });
      expect(Object.keys(helpers).sort()).toEqual(['redirectToSignIn', 'redirectToSignUp']);
    });

    it('raises error without signInUrl and publishableKey in redirectToSignIn', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        signUpUrl: 'http://signin.url:3001/sign-up',
        baseUrl: 'http://www.clerk.com',
        sessionStatus,
      } as any);

      expect(() => redirectToSignIn({ returnBackUrl })).toThrowError(
        '@clerk/backend: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.',
      );
    });
  });

  describe('with active session status', () => {
    it('returns path based url with development publishableKey but without signUpUrl to redirectToSignUp', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
        sessionStatus: 'active',
      });

      const result = redirectToSignUp({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `https://accounts.included.katydid-92.lcl.dev/sign-up?redirect_url=${encodedUrl}`,
      );
    });

    it('returns path based url with production publishableKey but without signUpUrl to redirectToSignUp', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        sessionStatus: 'active',
      });

      const result = redirectToSignUp({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `https://accounts.example.com/sign-up?redirect_url=${encodedUrl}`,
      );
    });

    it('returns path based url with development (kima) publishableKey but without signUpUrl to redirectToSignUp', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_aW5jbHVkZWQua2F0eWRpZC05Mi5jbGVyay5hY2NvdW50cy5kZXYk',
        sessionStatus: 'active',
      });

      const result = redirectToSignUp({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `https://included.katydid-92.accounts.dev/sign-up?redirect_url=${encodedUrl}`,
      );
    });

    it('passed dev browser when cross-origin redirect in dev', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        devBrowserToken: 'deadbeef',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_aW5jbHVkZWQua2F0eWRpZC05Mi5jbGVyay5hY2NvdW50cy5kZXYk',
        sessionStatus: 'active',
      });

      const result = redirectToSignUp({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `https://included.katydid-92.accounts.dev/sign-up?redirect_url=${encodedUrl}&__clerk_db_jwt=deadbeef`,
      );
    });

    it('removes __clerk_synced when cross-origin redirect', () => {
      const returnBackUrl = 'https://current.url:3000/path?__clerk_synced=true&q=1#hash';
      const encodedUrl = 'https%3A%2F%2Fcurrent.url%3A3000%2Fpath%3Fq%3D1%23hash';
      const signUpUrl = 'https://lcl.dev/sign-up';

      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        devBrowserToken: 'deadbeef',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_Y2xlcmsubGNsLmRldiQ',
        sessionStatus: 'active',
        signUpUrl,
      });

      const result = redirectToSignUp({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `${signUpUrl}?redirect_url=${encodedUrl}&__clerk_db_jwt=deadbeef`,
      );
    });

    it('returns path based url with development (kima) publishableKey (with staging Clerk) but without signUpUrl to redirectToSignUp', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_aW5jbHVkZWQua2F0eWRpZC05Mi5jbGVyay5hY2NvdW50c3N0YWdlLmRldiQ',
        sessionStatus: 'active',
      });

      const result = redirectToSignUp({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `https://included.katydid-92.accountsstage.dev/sign-up?redirect_url=${encodedUrl}`,
      );
    });

    it('returns path based url with development publishableKey but without signInUrl to redirectToSignIn', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
        sessionStatus: 'active',
      });

      const result = redirectToSignIn({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=${encodedUrl}`,
      );
    });

    it('returns path based url with production publishableKey but without signInUrl to redirectToSignIn', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        sessionStatus: 'active',
      });

      const result = redirectToSignIn({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `https://accounts.example.com/sign-in?redirect_url=${encodedUrl}`,
      );
    });

    it('returns path based url with development (kima) publishableKey but without signInUrl to redirectToSignIn', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_aW5jbHVkZWQua2F0eWRpZC05Mi5jbGVyay5hY2NvdW50cy5kZXYk',
        sessionStatus: 'active',
      });

      const result = redirectToSignIn({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `https://included.katydid-92.accounts.dev/sign-in?redirect_url=${encodedUrl}`,
      );
    });

    it('returns path based url with signUpUrl as absolute path and returnBackUrl missing', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        signUpUrl: 'http://signin.url:3001/sign-up',
        baseUrl: 'http://www.clerk.com',
        publishableKey: '',
        sessionStatus: 'active',
      });

      const result = redirectToSignUp();
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(`http://signin.url:3001/sign-up`);
    });

    it('returns path based url with signUpUrl as relative path', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        signUpUrl: '/sign-up',
        baseUrl: 'http://current.url:3000',
        publishableKey: '',
        sessionStatus: 'active',
      });

      const result = redirectToSignUp({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(`http://current.url:3000/sign-up?redirect_url=${encodedUrl}`);
    });

    it('returns path based url with signUpUrl as absolute path', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        signUpUrl: 'http://signup.url:3001/sign-up',
        baseUrl: 'http://www.clerk.com',
        publishableKey: '',
        sessionStatus: 'active',
      });

      const result = redirectToSignUp({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(`http://signup.url:3001/sign-up?redirect_url=${encodedUrl}`);
    });

    it('raises error without signUpUrl and publishableKey in redirectToSignUp', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        publishableKey: '',
        baseUrl: 'http://www.clerk.com',
        sessionStatus: 'active',
      });

      expect(() => redirectToSignUp({ returnBackUrl })).toThrowError(
        '@clerk/backend: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.',
      );
    });

    it('returns path based url with signInUrl as absolute path and returnBackUrl missing', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        signInUrl: 'http://signin.url:3001/sign-in',
        signUpUrl: 'http://signin.url:3001/sign-up',
        publishableKey: '',
        sessionStatus: 'active',
      });

      const result = redirectToSignIn();
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(`http://signin.url:3001/sign-in`);
    });

    it('returns path based url with signInUrl as relative path', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        baseUrl: 'http://current.url:3000',
        signInUrl: '/sign-in',
        signUpUrl: '/sign-up',
        publishableKey: '',
        sessionStatus: 'active',
      });

      const result = redirectToSignIn({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(`http://current.url:3000/sign-in?redirect_url=${encodedUrl}`);
    });

    it('returns path based url with signInUrl as absolute path', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        signInUrl: 'http://signin.url:3001/sign-in',
        signUpUrl: 'http://signin.url:3001/sign-up',
        publishableKey: '',
        baseUrl: 'http://www.clerk.com',
        sessionStatus: 'active',
      });

      const result = redirectToSignIn({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(`http://signin.url:3001/sign-in?redirect_url=${encodedUrl}`);
    });
  });

  describe('with pending session status', () => {
    it('on redirectToSignIn, redirects to tasks', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
        sessionStatus: 'pending',
      });

      const result = redirectToSignIn({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `https://accounts.included.katydid-92.lcl.dev/sign-in/tasks?redirect_url=${encodedUrl}`,
      );
    });

    it('on redirectToSignUp, redirects to tasks', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        sessionStatus: 'pending',
      });

      const result = redirectToSignUp({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `https://accounts.example.com/sign-up/tasks?redirect_url=${encodedUrl}`,
      );
    });

    it('passed dev browser when cross-origin redirect in dev', () => {
      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        devBrowserToken: 'deadbeef',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_aW5jbHVkZWQua2F0eWRpZC05Mi5jbGVyay5hY2NvdW50cy5kZXYk',
        sessionStatus: 'pending',
      });

      const result = redirectToSignUp({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `https://included.katydid-92.accounts.dev/sign-up/tasks?redirect_url=${encodedUrl}&__clerk_db_jwt=deadbeef`,
      );
    });

    it('removes __clerk_synced when cross-origin redirect', () => {
      const returnBackUrl = 'https://current.url:3000/path?__clerk_synced=true&q=1#hash';
      const encodedUrl = 'https%3A%2F%2Fcurrent.url%3A3000%2Fpath%3Fq%3D1%23hash';

      const redirectAdapterSpy = vi.fn().mockImplementation(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        devBrowserToken: 'deadbeef',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_Y2xlcmsubGNsLmRldiQ',
        sessionStatus: 'pending',
      });

      const result = redirectToSignUp({ returnBackUrl });
      expect(result).toBe('redirectAdapterValue');
      expect(redirectAdapterSpy).toHaveBeenCalledWith(
        `https://accounts.lcl.dev/sign-up/tasks?redirect_url=${encodedUrl}&__clerk_db_jwt=deadbeef`,
      );
    });
  });
});
