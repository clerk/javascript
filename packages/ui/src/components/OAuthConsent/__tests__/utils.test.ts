import { describe, expect, it } from 'vitest';

import { getRedirectDisplay } from '../utils';

describe('getRedirectDisplay', () => {
  describe('ip literal', () => {
    it('classifies a loopback IPv4 and preserves the full address', () => {
      expect(getRedirectDisplay('http://127.0.0.1/cb')).toEqual({ kind: 'ip', value: '127.0.0.1' });
    });

    it('classifies any 127.x.x.x loopback and preserves the full address', () => {
      expect(getRedirectDisplay('http://127.5.5.5/cb')).toEqual({ kind: 'ip', value: '127.5.5.5' });
    });

    it('classifies a private IPv4 and preserves the full address', () => {
      expect(getRedirectDisplay('http://192.168.1.50/cb')).toEqual({ kind: 'ip', value: '192.168.1.50' });
    });

    it('classifies a public IPv4 and preserves the full address', () => {
      expect(getRedirectDisplay('http://203.0.113.7/cb')).toEqual({ kind: 'ip', value: '203.0.113.7' });
    });

    it('classifies IPv6 ::1 and wraps it in brackets', () => {
      expect(getRedirectDisplay('http://[::1]/cb')).toEqual({ kind: 'ip', value: '[::1]' });
    });

    it('classifies expanded IPv6 loopback and returns the compressed form in brackets', () => {
      expect(getRedirectDisplay('http://[0:0:0:0:0:0:0:1]/cb')).toEqual({ kind: 'ip', value: '[::1]' });
    });

    it('classifies a public IPv6 literal and wraps it in brackets', () => {
      expect(getRedirectDisplay('http://[2001:db8::1]/cb')).toEqual({ kind: 'ip', value: '[2001:db8::1]' });
    });
  });

  describe('hostname', () => {
    it('returns localhost as a hostname', () => {
      expect(getRedirectDisplay('http://localhost:3000/cb')).toEqual({ kind: 'hostname', value: 'localhost' });
    });

    it('lowercases the hostname', () => {
      expect(getRedirectDisplay('http://LocalHost/cb')).toEqual({ kind: 'hostname', value: 'localhost' });
    });

    it('extracts the root domain from a subdomain', () => {
      expect(getRedirectDisplay('https://app.example.com/cb')).toEqual({ kind: 'hostname', value: 'example.com' });
    });

    it('returns the bare root domain unchanged', () => {
      expect(getRedirectDisplay('https://example.com/cb')).toEqual({ kind: 'hostname', value: 'example.com' });
    });
  });

  describe('invalid', () => {
    it('returns invalid for an unparseable URL', () => {
      expect(getRedirectDisplay('not-a-url')).toEqual({ kind: 'invalid' });
    });

    it('returns invalid for an empty string', () => {
      expect(getRedirectDisplay('')).toEqual({ kind: 'invalid' });
    });

    it('returns invalid for a URL with no host', () => {
      expect(getRedirectDisplay('mailto:user@example.com')).toEqual({ kind: 'invalid' });
    });
  });
});
