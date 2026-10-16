import { describe, expect, it } from 'vitest';

import {
  addCertificates,
  areCertificateBodies,
  getIdpCertificateStatus,
  haveCertificatesChanged,
  parseCertificateFile,
  removeCertificate,
  toIdpCertificateEntries,
  toIdpCertificatesParam,
} from '../idpCertificates';

const pem = (body: string) => `-----BEGIN CERTIFICATE-----\n${body}\n-----END CERTIFICATE-----\n`;

const entry = (certificate: string, expiresAt: number | null = null) => ({
  certificate,
  issuedAt: null,
  expiresAt,
});

describe('toIdpCertificateEntries', () => {
  it('prefers the list over the single certificate', () => {
    const list = [entry('a', 1), entry('b', 2)];
    expect(toIdpCertificateEntries({ idpCertificate: 'a', idpCertificates: list })).toBe(list);
  });

  it('falls back to the single certificate and its validity columns', () => {
    expect(toIdpCertificateEntries({ idpCertificate: 'a' })).toEqual([entry('a')]);
    expect(toIdpCertificateEntries({ idpCertificate: 'a', idpCertificates: [] })).toEqual([entry('a')]);
    expect(
      toIdpCertificateEntries({ idpCertificate: 'a', idpCertificateIssuedAt: 1, idpCertificateExpiresAt: 2 }),
    ).toEqual([{ certificate: 'a', issuedAt: 1, expiresAt: 2 }]);
    expect(toIdpCertificateEntries({ idpCertificate: 'a', idpCertificateExpiresAt: 0 })).toEqual([entry('a')]);
  });

  it('is empty without a connection or certificate', () => {
    expect(toIdpCertificateEntries(null)).toEqual([]);
    expect(toIdpCertificateEntries({ idpCertificate: '' })).toEqual([]);
  });
});

describe('parseCertificateFile', () => {
  it('reads one PEM certificate', () => {
    expect(parseCertificateFile(pem('AAAA\nBBBB'))).toEqual(['AAAABBBB']);
  });

  it('reads every block of a PEM bundle, ignoring text between blocks', () => {
    expect(parseCertificateFile(`subject=CN=a\n${pem('AAAA')}subject=CN=b\r\n${pem('BBBB')}`)).toEqual([
      'AAAA',
      'BBBB',
    ]);
  });

  it('reads a bare base64 certificate with whitespace', () => {
    expect(parseCertificateFile('  AAAA\n  BBBB\n')).toEqual(['AAAABBBB']);
  });

  it('is empty for an empty file', () => {
    expect(parseCertificateFile('   ')).toEqual([]);
  });
});

describe('areCertificateBodies', () => {
  it('accepts base64 bodies and rejects anything else, such as a private key', () => {
    expect(areCertificateBodies(['MIICozCCAYs=', 'AAAA'])).toBe(true);
    expect(areCertificateBodies([])).toBe(false);
    expect(
      areCertificateBodies(parseCertificateFile('-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----\n')),
    ).toBe(false);
  });
});

describe('addCertificates', () => {
  it('appends new certificates and skips ones already in the list', () => {
    expect(addCertificates([entry('AAAA', 1)], ['AAAA', 'BBBB'])).toEqual([entry('AAAA', 1), entry('BBBB')]);
  });

  it('returns the same list when nothing is new', () => {
    const entries = [entry('AAAA', 1)];
    expect(addCertificates(entries, ['AAAA'])).toBe(entries);
  });

  it('adds a bundle in order without duplicates', () => {
    expect(addCertificates([], ['AAAA', 'BBBB', 'AAAA'])).toEqual([entry('AAAA'), entry('BBBB')]);
  });

  it('never grows the list past the maximum', () => {
    const four = ['A', 'B', 'C', 'D'].map(c => entry(c));
    expect(addCertificates(four, ['E', 'F'])).toEqual([...four, entry('E')]);
    expect(addCertificates([...four, entry('E')], ['F'])).toEqual([...four, entry('E')]);
  });
});

describe('removeCertificate', () => {
  it('drops the matching entry', () => {
    expect(removeCertificate([entry('a'), entry('b')], 'a')).toEqual([entry('b')]);
  });
});

describe('haveCertificatesChanged', () => {
  const original = [entry('a', 1), entry('b', 2)];

  it('is false for the same certificates in the same order', () => {
    expect(haveCertificatesChanged([entry('a'), entry('b')], original)).toBe(false);
  });

  it('is true when one is added, removed, or reordered', () => {
    expect(haveCertificatesChanged([entry('a'), entry('b'), entry('c')], original)).toBe(true);
    expect(haveCertificatesChanged([entry('a')], original)).toBe(true);
    expect(haveCertificatesChanged([entry('b'), entry('a')], original)).toBe(true);
  });
});

describe('toIdpCertificatesParam', () => {
  it('sends the certificate bodies in order', () => {
    expect(toIdpCertificatesParam([entry('a'), entry('b')])).toEqual(['a', 'b']);
  });
});

describe('getIdpCertificateStatus', () => {
  const now = Date.UTC(2026, 8, 30);
  const day = 24 * 60 * 60 * 1000;

  it('classifies by the expiry date', () => {
    expect(getIdpCertificateStatus(entry('a'), now)).toBe('unknown');
    expect(getIdpCertificateStatus(entry('a', now - day), now)).toBe('expired');
    expect(getIdpCertificateStatus(entry('a', now), now)).toBe('expired');
    expect(getIdpCertificateStatus(entry('a', now + 10 * day), now)).toBe('expiring');
    expect(getIdpCertificateStatus(entry('a', now + 31 * day), now)).toBe('valid');
  });
});
