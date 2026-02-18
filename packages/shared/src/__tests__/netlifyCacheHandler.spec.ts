/* eslint-disable turbo/no-undeclared-env-vars */
import { beforeEach, describe, expect, it } from 'vitest';

import { handleNetlifyCacheInDevInstance } from '../netlifyCacheHandler';

const mockPublishableKey = 'pk_test_YW55LW9mZabcZS1wYWdlX3BhZ2VfcG9pbnRlci1pZF90ZXN0XzE';

describe('handleNetlifyCacheInDevInstance', () => {
  beforeEach(() => {
    delete process.env.URL;
    delete process.env.NETLIFY;
    delete process.env.NETLIFY_DEV;
    delete process.env.DEPLOY_PRIME_URL;
    delete process.env.NETLIFY_FUNCTIONS_TOKEN;
  });

  it('should set Netlify-Vary header when on Netlify and in development', () => {
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

    expect(requestStateHeaders.get('Netlify-Vary')).toBe('cookie=__client, cookie=__session');
  });

  it('should set Netlify-Vary header even when handshake param is present', () => {
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

    // Unlike cache-bust, we always want the vary header
    expect(requestStateHeaders.get('Netlify-Vary')).toBe('cookie=__client, cookie=__session');
  });

  it('should not set Netlify-Vary header when not on Netlify', () => {
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

  it('should not set Netlify-Vary header when not a development instance', () => {
    process.env.NETLIFY = 'true';
    const prodPublishableKey = 'pk_live_Y2xlcmsuaW5jbHVkZWQua2l0dGVuLTk5LmxjbGNsZXJrLmNvbSQ';

    const requestStateHeaders = new Headers({
      Location: 'https://example.netlify.app',
    });
    const locationHeader = requestStateHeaders.get('Location') || '';

    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders,
      publishableKey: prodPublishableKey,
    });

    expect(requestStateHeaders.get('Netlify-Vary')).toBeNull();
  });

  it('should handle invalid URL env var', () => {
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

    // Should still detect via NETLIFY env var
    expect(requestStateHeaders.get('Netlify-Vary')).toBe('cookie=__client, cookie=__session');
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
