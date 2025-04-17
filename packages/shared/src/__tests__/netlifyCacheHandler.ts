/* eslint-disable turbo/no-undeclared-env-vars */
import { CLERK_NETLIFY_CACHE_BUST_PARAM, handleNetlifyCacheInDevInstance } from '../netlifyCacheHandler';

const mockPublishableKey = 'pk_test_YW55LW9mZabcZS1wYWdlX3BhZ2VfcG9pbnRlci1pZF90ZXN0XzE';

describe('handleNetlifyCacheInDevInstance', () => {
  beforeEach(() => {
    delete process.env.NETLIFY;
  });

  it('should add cache bust parameter when on Netlify and in development', () => {
    process.env.NETLIFY = 'true';

    const requestStateHeaders = new Headers({
      Location: 'https://example.com',
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
    process.env.NETLIFY = 'true';

    const requestStateHeaders = new Headers({
      Location: 'https://example.com/redirect?__clerk_handshake=',
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
      Location: 'https://example.com',
    });
    const locationHeader = requestStateHeaders.get('Location') || '';

    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders,
      publishableKey: mockPublishableKey,
    });

    expect(requestStateHeaders.get('Location')).toBe('https://example.com');
  });
});
