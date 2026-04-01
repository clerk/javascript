import { describe, expect, it } from 'vitest';

import { resolveServerUrl } from '../application';

describe('resolveServerUrl', () => {
  describe('with opts.serverUrl', () => {
    it('appends port to a URL without an explicit port', () => {
      expect(resolveServerUrl('http://localhost', undefined, 3000)).toBe('http://localhost:3000');
    });

    it('appends port to an https URL without an explicit port', () => {
      expect(resolveServerUrl('https://example.com', undefined, 4000)).toBe('https://example.com:4000');
    });

    it('preserves an explicit port in the URL', () => {
      expect(resolveServerUrl('http://localhost:8080', undefined, 3000)).toBe('http://localhost:8080');
    });

    it('handles a URL with a path (returns origin only)', () => {
      expect(resolveServerUrl('http://localhost/some/path', undefined, 3000)).toBe('http://localhost:3000');
    });

    it('handles a bare hostname by appending port', () => {
      expect(resolveServerUrl('myhost', undefined, 5000)).toBe('myhost:5000');
    });

    it('handles a bare IP address by appending port', () => {
      expect(resolveServerUrl('127.0.0.1', undefined, 5000)).toBe('127.0.0.1:5000');
    });
  });

  describe('with fallback serverUrl', () => {
    it('uses fallback when opts.serverUrl is undefined', () => {
      expect(resolveServerUrl(undefined, 'http://fallback:9000', 3000)).toBe('http://fallback:9000');
    });

    it('prefers opts.serverUrl over fallback', () => {
      expect(resolveServerUrl('http://localhost', 'http://fallback:9000', 3000)).toBe('http://localhost:3000');
    });
  });

  describe('with no serverUrl at all', () => {
    it('defaults to http://localhost with the given port', () => {
      expect(resolveServerUrl(undefined, undefined, 4567)).toBe('http://localhost:4567');
    });

    it('defaults when fallback is empty string', () => {
      expect(resolveServerUrl(undefined, '', 4567)).toBe('http://localhost:4567');
    });
  });
});
