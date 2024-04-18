import { snakeToCamel } from '@clerk/shared/underscore';
import type { RedirectOptions } from '@clerk/types';

import { RedirectUrls } from '../redirectUrls';

const oldWindowLocation = window.location;

describe('redirectUrls', () => {
  let mockWindowLocation: Window['location'];

  beforeEach(() => {
    mockWindowLocation = new URL('https://www.clerk.com') as any as Window['location'];
    Object.defineProperty(global.window, 'location', { value: mockWindowLocation });
  });

  afterAll(() => {
    Object.defineProperty(global.window, 'location', {
      value: oldWindowLocation,
    });
  });

  describe('parse input values', () => {
    it('parses options or props', () => {
      const options: [keyof RedirectOptions, string][] = [
        ['signInForceRedirectUrl', 'sign-in-force-redirect-url'],
        ['signInFallbackRedirectUrl', 'sign-in-fallback-redirect'],
        ['signUpForceRedirectUrl', 'sign-up-force-redirect'],
        ['signUpFallbackRedirectUrl', 'sign-up-fallback-redirect'],
      ];

      // test options (first param)
      for (const [k, v] of options) {
        const redirectUrls = new RedirectUrls({ [k]: v });
        // @ts-expect-error ignoring private modifier
        expect(redirectUrls.fromOptions[k]).toBe(`${mockWindowLocation.href}${v}`);
      }

      // test props (second param)
      for (const [k, v] of options) {
        const redirectUrls = new RedirectUrls({}, { [k]: v });
        // @ts-expect-error ignoring private modifier
        expect(redirectUrls.fromProps[k]).toBe(`${mockWindowLocation.href}${v}`);
      }
    });

    it('parses search params', () => {
      const params = [
        ['sign_in_force_redirect_url', 'sign-in-force-redirect'],
        ['sign_in_fallback_redirect_url', 'sign-in-fallback-redirect'],
        ['sign_up_force_redirect_url', 'sign-up-force-redirect'],
        ['sign_up_fallback_redirect_url', 'sign-up-fallback-redirect'],
      ];

      for (const [key, val] of params) {
        const redirectUrls = new RedirectUrls({}, {}, { [key]: val });
        // @ts-expect-error ignoring private modifier
        expect(redirectUrls.fromSearchParams[snakeToCamel(key)]).toBe(`${mockWindowLocation.href}${val}`);
      }
    });

    it('filters origins that are not allowed', () => {
      const redirectUrls = new RedirectUrls(
        {
          allowedRedirectOrigins: ['https://www.clerk.com'],
          // This would take priority but its not allowed
          signInForceRedirectUrl: 'https://www.other.com/sign-in-force-redirect-url',
        },
        {
          // This will be used instead
          signInForceRedirectUrl: 'https://www.clerk.com/sign-in-force-redirect-url',
        },
      );

      expect(redirectUrls.getAfterSignInUrl()).toBe('https://www.clerk.com/sign-in-force-redirect-url');
    });
  });

  describe('get redirect urls', () => {
    it('prioritizes force urls among other urls in the same group', () => {
      const redirectUrls = new RedirectUrls({
        signInForceRedirectUrl: 'sign-in-force-redirect-url',
        signInFallbackRedirectUrl: 'sign-in-fallback-redirect-url',
        signUpForceRedirectUrl: 'sign-up-force-redirect-url',
        signUpFallbackRedirectUrl: 'sign-up-fallback-redirect-url',
      });

      expect(redirectUrls.getAfterSignInUrl()).toBe(`${mockWindowLocation.href}sign-in-force-redirect-url`);
      expect(redirectUrls.getAfterSignUpUrl()).toBe(`${mockWindowLocation.href}sign-up-force-redirect-url`);
    });

    it('uses fallback urls if force do not exist', () => {
      const redirectUrls = new RedirectUrls({
        signInFallbackRedirectUrl: 'sign-in-fallback-redirect-url',
        signUpFallbackRedirectUrl: 'sign-up-fallback-redirect-url',
      });
      expect(redirectUrls.getAfterSignInUrl()).toBe(`${mockWindowLocation.href}sign-in-fallback-redirect-url`);
      expect(redirectUrls.getAfterSignUpUrl()).toBe(`${mockWindowLocation.href}sign-up-fallback-redirect-url`);
    });

    it('prioritizes props over options', () => {
      const redirectUrls = new RedirectUrls(
        {
          signInFallbackRedirectUrl: 'sign-in-fallback-redirect-url',
          signUpFallbackRedirectUrl: 'sign-up-fallback-redirect-url',
        },
        {
          signInFallbackRedirectUrl: 'prop-sign-in-fallback-redirect-url',
          signUpFallbackRedirectUrl: 'prop-sign-up-fallback-redirect-url',
        },
      );
      expect(redirectUrls.getAfterSignInUrl()).toBe(`${mockWindowLocation.href}prop-sign-in-fallback-redirect-url`);
      expect(redirectUrls.getAfterSignUpUrl()).toBe(`${mockWindowLocation.href}prop-sign-up-fallback-redirect-url`);
    });

    it('prioritizes force even if props take priority over options', () => {
      const redirectUrls = new RedirectUrls(
        {
          signInForceRedirectUrl: 'sign-in-fallback-redirect-url',
          signUpForceRedirectUrl: 'sign-up-fallback-redirect-url',
        },
        {
          signInFallbackRedirectUrl: 'prop-sign-in-fallback-redirect-url',
          signUpFallbackRedirectUrl: 'prop-sign-up-fallback-redirect-url',
        },
      );
      expect(redirectUrls.getAfterSignInUrl()).toBe(`${mockWindowLocation.href}sign-in-fallback-redirect-url`);
      expect(redirectUrls.getAfterSignUpUrl()).toBe(`${mockWindowLocation.href}sign-up-fallback-redirect-url`);
    });

    it('prioritizes searchParams over all else', () => {
      const redirectUrls = new RedirectUrls(
        {
          signInFallbackRedirectUrl: 'sign-in-fallback-redirect-url',
          signUpFallbackRedirectUrl: 'sign-up-fallback-redirect-url',
        },
        {
          signInFallbackRedirectUrl: 'prop-sign-in-fallback-redirect-url',
          signUpFallbackRedirectUrl: 'prop-sign-up-fallback-redirect-url',
        },
        {
          sign_in_fallback_redirect_url: 'search-param-sign-in-fallback-redirect-url',
          sign_up_fallback_redirect_url: 'search-param-sign-up-fallback-redirect-url',
        },
      );
      expect(redirectUrls.getAfterSignInUrl()).toBe(
        `${mockWindowLocation.href}search-param-sign-in-fallback-redirect-url`,
      );
      expect(redirectUrls.getAfterSignUpUrl()).toBe(
        `${mockWindowLocation.href}search-param-sign-up-fallback-redirect-url`,
      );
    });

    it('prioritizes force even if searchParams exist', () => {
      const redirectUrls = new RedirectUrls(
        {
          signInForceRedirectUrl: 'sign-in-force-redirect-url',
          signUpForceRedirectUrl: 'sign-up-force-redirect-url',
        },
        {
          signInFallbackRedirectUrl: 'prop-sign-in-fallback-redirect-url',
          signUpFallbackRedirectUrl: 'prop-sign-up-fallback-redirect-url',
        },
        {
          sign_in_fallback_redirect_url: 'search-param-sign-in-fallback-redirect-url',
          sign_up_fallback_redirect_url: 'search-param-sign-up-fallback-redirect-url',
        },
      );
      expect(redirectUrls.getAfterSignInUrl()).toBe(`${mockWindowLocation.href}sign-in-force-redirect-url`);
      expect(redirectUrls.getAfterSignUpUrl()).toBe(`${mockWindowLocation.href}sign-up-force-redirect-url`);
    });

    it('prioritizes redirect_url from searchParamsover fallback urls', () => {
      const redirectUrls = new RedirectUrls(
        {
          signInFallbackRedirectUrl: 'sign-in-fallback-redirect-url',
          signUpFallbackRedirectUrl: 'sign-up-fallback-redirect-url',
        },
        {
          signInFallbackRedirectUrl: 'prop-sign-in-fallback-redirect-url',
          signUpFallbackRedirectUrl: 'prop-sign-up-fallback-redirect-url',
        },
        {
          redirect_url: 'search-param-redirect-url',
        },
      );
      expect(redirectUrls.getAfterSignInUrl()).toBe(`${mockWindowLocation.href}search-param-redirect-url`);
      expect(redirectUrls.getAfterSignUpUrl()).toBe(`${mockWindowLocation.href}search-param-redirect-url`);
    });
  });

  describe('search params', () => {
    it('appends only the preserved props', () => {
      const redirectUrls = new RedirectUrls(
        {
          signInFallbackRedirectUrl: 'sign-in-fallback-redirect-url',
        },
        {
          signInFallbackRedirectUrl: 'props-sign-in-fallback-redirect-url',
          signInForceRedirectUrl: 'props-sign-in-force-redirect-url',
        },
        {
          sign_up_fallback_redirect_url: 'search-param-sign-up-fallback-redirect-url',
          redirect_url: 'search-param-redirect-url',
        },
      );

      const params = redirectUrls.toSearchParams();
      expect([...params.keys()].length).toBe(1);
      expect(params.get('redirect_url')).toBe(`${mockWindowLocation.href}search-param-redirect-url`);
    });
  });

  describe('append to url', () => {
    it('does not append redirect urls from options to the url if the url is same origin', () => {
      const redirectUrls = new RedirectUrls({
        signInFallbackRedirectUrl: 'sign-in-fallback-redirect-url',
        signUpFallbackRedirectUrl: 'sign-up-fallback-redirect-url',
      });

      const url = redirectUrls.appendPreservedPropsToUrl('https://www.clerk.com');
      expect(url).toBe('https://www.clerk.com/');
    });

    it('appends redirect urls from options to the url if the url is cross origin', () => {
      const redirectUrls = new RedirectUrls({}, {}, { redirect_url: '/search-param-redirect-url' });

      const url = redirectUrls.appendPreservedPropsToUrl('https://www.example.com');
      expect(url).toContain('search-param-redirect-url');
    });

    it('overrides the existing search params', () => {
      const redirectUrls = new RedirectUrls(
        {
          signInFallbackRedirectUrl: 'sign-in-fallback-redirect-url',
          signUpFallbackRedirectUrl: 'sign-up-fallback-redirect-url',
        },
        {},
        { redirect_url: '/search-param-redirect-url' },
      );

      const url = redirectUrls.appendPreservedPropsToUrl('https://www.example.com?redirect_url=existing');
      expect(url).toBe(
        'https://www.example.com/?redirect_url=existing#/?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fsearch-param-redirect-url',
      );
    });

    it('appends redirect urls from props to the url even if the url is same origin', () => {
      const redirectUrls = new RedirectUrls({}, {}, { redirect_url: '/search-param-redirect-url' });

      const url = redirectUrls.appendPreservedPropsToUrl('https://www.clerk.com');
      expect(url).toContain('search-param-redirect-url');
    });

    it('does not append redirect urls from props to the url if the url is same origin if they match the options urls', () => {
      const redirectUrls = new RedirectUrls(
        {
          signInFallbackRedirectUrl: 'sign-in-fallback-redirect-url',
          signUpFallbackRedirectUrl: 'sign-up-fallback-redirect-url',
        },
        {
          signInFallbackRedirectUrl: 'sign-in-fallback-redirect-url',
          signUpFallbackRedirectUrl: 'sign-up-fallback-redirect-url',
        },
      );

      const url = redirectUrls.appendPreservedPropsToUrl('https://www.clerk.com');
      expect(url).toBe('https://www.clerk.com/');
    });
  });
});
