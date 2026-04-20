import { describe, expect, it } from 'vitest';

import { getRedirectDisplay } from '../utils';

describe('getRedirectDisplay', () => {
  describe('ip literal', () => {
    it('preserves a loopback IPv4', () => {
      expect(getRedirectDisplay('http://127.0.0.1/cb')).toBe('127.0.0.1');
    });

    it('preserves any 127.x.x.x loopback', () => {
      expect(getRedirectDisplay('http://127.5.5.5/cb')).toBe('127.5.5.5');
    });

    it('preserves a private IPv4', () => {
      expect(getRedirectDisplay('http://192.168.1.50/cb')).toBe('192.168.1.50');
    });

    it('preserves a public IPv4', () => {
      expect(getRedirectDisplay('http://203.0.113.7/cb')).toBe('203.0.113.7');
    });

    it('wraps IPv6 ::1 in brackets', () => {
      expect(getRedirectDisplay('http://[::1]/cb')).toBe('[::1]');
    });

    it('returns the compressed IPv6 loopback in brackets for the expanded form', () => {
      expect(getRedirectDisplay('http://[0:0:0:0:0:0:0:1]/cb')).toBe('[::1]');
    });

    it('wraps a public IPv6 literal in brackets', () => {
      expect(getRedirectDisplay('http://[2001:db8::1]/cb')).toBe('[2001:db8::1]');
    });
  });

  describe('hostname', () => {
    it('returns localhost as-is', () => {
      expect(getRedirectDisplay('http://localhost:3000/cb')).toBe('localhost');
    });

    it('extracts the root domain from a subdomain', () => {
      expect(getRedirectDisplay('https://app.example.com/cb')).toBe('example.com');
    });

    it('returns the bare root domain unchanged', () => {
      expect(getRedirectDisplay('https://example.com/cb')).toBe('example.com');
    });
  });

  describe('invalid', () => {
    it('returns an empty string for an unparseable URL', () => {
      expect(getRedirectDisplay('not-a-url')).toBe('');
    });

    it('returns an empty string for an empty input', () => {
      expect(getRedirectDisplay('')).toBe('');
    });

    it('returns an empty string for a URL with no host', () => {
      expect(getRedirectDisplay('mailto:user@example.com')).toBe('');
    });
  });
});
