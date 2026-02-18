import { parseUrlForNavigation } from '../client/utils';

const BASE_URL = 'https://example.com';

describe('parseUrlForNavigation', () => {
  it('parses pathname only', () => {
    const result = parseUrlForNavigation('/sign-in', BASE_URL);
    expect(result).toEqual({
      to: '/sign-in',
      search: undefined,
      hash: undefined,
    });
  });

  it('parses pathname with query parameters', () => {
    const result = parseUrlForNavigation('/sign-in?redirect_url=https://example.com', BASE_URL);
    expect(result).toEqual({
      to: '/sign-in',
      search: { redirect_url: 'https://example.com' },
      hash: undefined,
    });
  });

  it('parses pathname with multiple query parameters', () => {
    const result = parseUrlForNavigation('/sign-in?redirect_url=https://example.com&foo=bar', BASE_URL);
    expect(result).toEqual({
      to: '/sign-in',
      search: { redirect_url: 'https://example.com', foo: 'bar' },
      hash: undefined,
    });
  });

  it('parses pathname with hash', () => {
    const result = parseUrlForNavigation('/sign-in#section', BASE_URL);
    expect(result).toEqual({
      to: '/sign-in',
      search: undefined,
      hash: 'section',
    });
  });

  it('parses pathname with query parameters and hash', () => {
    const result = parseUrlForNavigation('/sign-in?redirect_url=https://example.com#section', BASE_URL);
    expect(result).toEqual({
      to: '/sign-in',
      search: { redirect_url: 'https://example.com' },
      hash: 'section',
    });
  });

  it('handles encoded query parameters', () => {
    const result = parseUrlForNavigation('/sign-in?redirect_url=https%3A%2F%2Fexample.com%2Fpath', BASE_URL);
    expect(result).toEqual({
      to: '/sign-in',
      search: { redirect_url: 'https://example.com/path' },
      hash: undefined,
    });
  });

  it('handles root path', () => {
    const result = parseUrlForNavigation('/', BASE_URL);
    expect(result).toEqual({
      to: '/',
      search: undefined,
      hash: undefined,
    });
  });

  it('handles nested paths', () => {
    const result = parseUrlForNavigation('/auth/sign-in?foo=bar', BASE_URL);
    expect(result).toEqual({
      to: '/auth/sign-in',
      search: { foo: 'bar' },
      hash: undefined,
    });
  });

  it('handles empty hash', () => {
    const result = parseUrlForNavigation('/sign-in#', BASE_URL);
    expect(result).toEqual({
      to: '/sign-in',
      search: undefined,
      hash: undefined,
    });
  });

  it('handles complex satellite redirect URL', () => {
    const result = parseUrlForNavigation(
      '/sign-in?redirect_url=https%3A%2F%2Fsatellite.example.com%2Fdashboard&sign_in_force_redirect_url=https%3A%2F%2Fmain.example.com',
      BASE_URL,
    );
    expect(result).toEqual({
      to: '/sign-in',
      search: {
        redirect_url: 'https://satellite.example.com/dashboard',
        sign_in_force_redirect_url: 'https://main.example.com',
      },
      hash: undefined,
    });
  });

  it('handles hash that looks like a path with query params (PathRouter format)', () => {
    // This is what PathRouter converts from: /sign-in#/?redirect_url=...
    // After mergeFragmentIntoUrl, it becomes: /sign-in?redirect_url=...
    // We should correctly handle both formats
    const result = parseUrlForNavigation('/sign-in?redirect_url=https://satellite.com', BASE_URL);
    expect(result).toEqual({
      to: '/sign-in',
      search: { redirect_url: 'https://satellite.com' },
      hash: undefined,
    });
  });
});
