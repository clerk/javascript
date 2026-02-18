/* eslint-disable turbo/no-undeclared-env-vars */
import { beforeEach, describe, expect, it } from 'vitest';

import { CLERK_NETLIFY_CACHE_BUST_PARAM, handleNetlifyCacheInDevInstance } from '../netlifyCacheHandler';

const mockPublishableKey = 'pk_test_YW55LW9mZabcZS1wYWdlX3BhZ2VfcG9pbnRlci1pZF90ZXN0XzE';

describe('handleNetlifyCacheInDevInstance', () => {
  beforeEach(() => {
    delete process.env.URL;
    delete process.env.NETLIFY;
  });

  it('should add cache bust parameter when on Netlify and in development', () => {
    process.env.NETLIFY = 'true';
    process.env.URL = 'https://example.netlify.app';

    const requestStateHeaders = new Headers({
      Location: 'https://example.netlify.app',
    });
    const locationHeader = requestStateHeaders.get('Location') || '';

    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders,
      publishableKey: mockPublishableKey,
    });

    const locationUrl = new URL(requestStateHeaders.get('Location') || '');
    expect(locationUrl.searchParams.has(CLERK_NETLIFY_CACHE_BUST_PARAM)).toBe(true);
  });

  it('should not modify the Location header if it has the handshake param', () => {
    process.env.URL = 'https://example.netlify.app';
    process.env.NETLIFY = 'true';

    const requestStateHeaders = new Headers({
      Location: 'https://example.netlify.app/redirect?__clerk_handshake=',
    });
    const locationHeader = requestStateHeaders.get('Location') || '';

    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders,
      publishableKey: mockPublishableKey,
    });

    expect(requestStateHeaders.get('Location')).toBe(locationHeader);
  });

  it('should not modify the Location header if not on Netlify', () => {
    const requestStateHeaders = new Headers({
      Location: 'https://example.netlify.app',
    });
    const locationHeader = requestStateHeaders.get('Location') || '';

    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders,
      publishableKey: mockPublishableKey,
    });

    expect(requestStateHeaders.get('Location')).toBe('https://example.netlify.app');
  });

  it('should ignore the URL environment variable if it is not a string', () => {
    // @ts-expect-error - Random object
    process.env.URL = {};
    process.env.NETLIFY = 'true';

    const requestStateHeaders = new Headers({
      Location: 'https://example.netlify.app',
    });
    const locationHeader = requestStateHeaders.get('Location') || '';

    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders,
      publishableKey: mockPublishableKey,
    });

    const locationUrl = new URL(requestStateHeaders.get('Location') || '');
    expect(locationUrl.searchParams.has(CLERK_NETLIFY_CACHE_BUST_PARAM)).toBe(true);
  });
});

describe('isNetlifyRuntime detection', () => {
  beforeEach(() => {
    delete process.env.NETLIFY;
    delete process.env.NETLIFY_DEV;
    delete process.env.DEPLOY_PRIME_URL;
    delete process.env.NETLIFY_FUNCTIONS_TOKEN;
    delete process.env.URL;
  });

  it('should detect Netlify via NETLIFY env var', () => {
    process.env.NETLIFY = 'true';

    const requestStateHeaders = new Headers({
      Location: 'https://example.netlify.app',
    });
    const locationHeader = requestStateHeaders.get('Location') || '';

    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders,
      publishableKey: mockPublishableKey,
    });

    expect(requestStateHeaders.get('Netlify-Vary')).toBe('cookie=__client, cookie=__session');
  });

  it('should detect Netlify via NETLIFY_DEV env var', () => {
    process.env.NETLIFY_DEV = 'true';

    const requestStateHeaders = new Headers({
      Location: 'https://example.netlify.app',
    });
    const locationHeader = requestStateHeaders.get('Location') || '';

    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders,
      publishableKey: mockPublishableKey,
    });

    expect(requestStateHeaders.get('Netlify-Vary')).toBe('cookie=__client, cookie=__session');
  });

  it('should detect Netlify via DEPLOY_PRIME_URL env var', () => {
    process.env.DEPLOY_PRIME_URL = 'https://deploy-123.netlify.app';

    const requestStateHeaders = new Headers({
      Location: 'https://example.netlify.app',
    });
    const locationHeader = requestStateHeaders.get('Location') || '';

    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders,
      publishableKey: mockPublishableKey,
    });

    expect(requestStateHeaders.get('Netlify-Vary')).toBe('cookie=__client, cookie=__session');
  });

  it('should detect Netlify via NETLIFY_FUNCTIONS_TOKEN env var', () => {
    process.env.NETLIFY_FUNCTIONS_TOKEN = 'some-token';

    const requestStateHeaders = new Headers({
      Location: 'https://example.netlify.app',
    });
    const locationHeader = requestStateHeaders.get('Location') || '';

    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders,
      publishableKey: mockPublishableKey,
    });

    expect(requestStateHeaders.get('Netlify-Vary')).toBe('cookie=__client, cookie=__session');
  });

  it('should detect Netlify via netlify.app URL', () => {
    process.env.URL = 'https://example.netlify.app';

    const requestStateHeaders = new Headers({
      Location: 'https://example.netlify.app',
    });
    const locationHeader = requestStateHeaders.get('Location') || '';

    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders,
      publishableKey: mockPublishableKey,
    });

    expect(requestStateHeaders.get('Netlify-Vary')).toBe('cookie=__client, cookie=__session');
  });

  it('should not detect Netlify when no env vars are set', () => {
    const requestStateHeaders = new Headers({
      Location: 'https://example.com',
    });
    const locationHeader = requestStateHeaders.get('Location') || '';

    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders,
      publishableKey: mockPublishableKey,
    });

    expect(requestStateHeaders.get('Netlify-Vary')).toBeNull();
  });
});
