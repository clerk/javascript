/* eslint-disable turbo/no-undeclared-env-vars */
import { beforeEach, describe, expect, it } from 'vitest';

import { getCookieSuffix } from '../keys';
import { CLERK_NETLIFY_CACHE_BUST_PARAM, handleNetlifyCacheHeaders } from '../netlifyCacheHandler';

const mockDevPublishableKey = 'pk_test_YW55LW9mZabcZS1wYWdlX3BhZ2VfcG9pbnRlci1pZF90ZXN0XzE';
const mockProdPublishableKey = 'pk_live_YW55LW9mZabcZS1wYWdlX3BhZ2VfcG9pbnRlci1pZF90ZXN0XzE';

describe('handleNetlifyCacheHeaders', () => {
  beforeEach(() => {
    delete process.env.URL;
    delete process.env.NETLIFY;
    delete process.env.NETLIFY_FUNCTIONS_TOKEN;
  });

  describe('Netlify-Vary header', () => {
    it('should set Netlify-Vary header with unsuffixed and suffixed cookie names when on Netlify', async () => {
      process.env.NETLIFY = 'true';

      const headers = new Headers();
      await handleNetlifyCacheHeaders({ headers, publishableKey: mockProdPublishableKey });

      const suffix = await getCookieSuffix(mockProdPublishableKey);
      expect(headers.get('Netlify-Vary')).toBe(
        `cookie=__client_uat,cookie=__session,cookie=__client_uat_${suffix},cookie=__session_${suffix}`,
      );
    });

    it('should not set Netlify-Vary header when not on Netlify', async () => {
      const headers = new Headers();
      await handleNetlifyCacheHeaders({ headers, publishableKey: mockProdPublishableKey });

      expect(headers.get('Netlify-Vary')).toBeNull();
    });

    it('should detect Netlify via NETLIFY_FUNCTIONS_TOKEN', async () => {
      process.env.NETLIFY_FUNCTIONS_TOKEN = 'some-token';

      const headers = new Headers();
      await handleNetlifyCacheHeaders({ headers, publishableKey: mockProdPublishableKey });

      expect(headers.get('Netlify-Vary')).toContain('cookie=__client_uat');
    });

    it('should detect Netlify via URL ending with netlify.app', async () => {
      process.env.URL = 'https://example.netlify.app';

      const headers = new Headers();
      await handleNetlifyCacheHeaders({ headers, publishableKey: mockProdPublishableKey });

      expect(headers.get('Netlify-Vary')).toContain('cookie=__client_uat');
    });

    it('should fall back to unsuffixed cookies only when publishableKey is empty', async () => {
      process.env.NETLIFY = 'true';

      const headers = new Headers();
      await handleNetlifyCacheHeaders({ headers, publishableKey: '' });

      expect(headers.get('Netlify-Vary')).toBe('cookie=__client_uat,cookie=__session');
    });
  });

  describe('cache bust parameter (dev instances)', () => {
    it('should add cache bust parameter when on Netlify and in development with Location header', async () => {
      process.env.NETLIFY = 'true';

      const headers = new Headers({ Location: 'https://example.netlify.app' });
      await handleNetlifyCacheHeaders({ headers, publishableKey: mockDevPublishableKey });

      const locationUrl = new URL(headers.get('Location') || '');
      expect(locationUrl.searchParams.has(CLERK_NETLIFY_CACHE_BUST_PARAM)).toBe(true);
    });

    it('should not add cache bust parameter for production instances', async () => {
      process.env.NETLIFY = 'true';

      const headers = new Headers({ Location: 'https://example.netlify.app' });
      await handleNetlifyCacheHeaders({ headers, publishableKey: mockProdPublishableKey });

      const locationUrl = new URL(headers.get('Location') || '');
      expect(locationUrl.searchParams.has(CLERK_NETLIFY_CACHE_BUST_PARAM)).toBe(false);
    });

    it('should not modify the Location header if it has the handshake param', async () => {
      process.env.NETLIFY = 'true';

      const locationValue = 'https://example.netlify.app/redirect?__clerk_handshake=';
      const headers = new Headers({ Location: locationValue });
      await handleNetlifyCacheHeaders({ headers, publishableKey: mockDevPublishableKey });

      expect(headers.get('Location')).toBe(locationValue);
    });

    it('should not modify the Location header if not on Netlify', async () => {
      const headers = new Headers({ Location: 'https://example.com' });
      await handleNetlifyCacheHeaders({ headers, publishableKey: mockDevPublishableKey });

      expect(headers.get('Location')).toBe('https://example.com');
    });

    it('should ignore the URL environment variable if it is not a string', async () => {
      // @ts-expect-error - Random object
      process.env.URL = {};
      process.env.NETLIFY = 'true';

      const headers = new Headers({ Location: 'https://example.netlify.app' });
      await handleNetlifyCacheHeaders({ headers, publishableKey: mockDevPublishableKey });

      const locationUrl = new URL(headers.get('Location') || '');
      expect(locationUrl.searchParams.has(CLERK_NETLIFY_CACHE_BUST_PARAM)).toBe(true);
    });
  });
});
