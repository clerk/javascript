import { describe, expect, it } from 'vitest';

import { HmacSHA1 } from '../../vendor/crypto-es';
import { assertTokenSignature } from '../utils';

describe('assertTokenSignature(token, key, signature)', () => {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkIn0.0u5CllULtDVD9DUUmUMdJLbBCSNcnv4j3hCaPz4dNr8';
  const key = 'sk_test_mock';
  const validSignature = HmacSHA1(token, key).toString();

  it('passes when the signature matches', () => {
    expect(() => assertTokenSignature(token, key, validSignature)).not.toThrow();
  });

  it('throws when the signature is missing', () => {
    expect(() => assertTokenSignature(token, key, undefined)).toThrowError();
    expect(() => assertTokenSignature(token, key, null)).toThrowError();
    expect(() => assertTokenSignature(token, key, '')).toThrowError();
  });

  it('throws when the signature differs at the last character', () => {
    const tampered = validSignature.slice(0, -1) + (validSignature.endsWith('0') ? '1' : '0');
    expect(() => assertTokenSignature(token, key, tampered)).toThrowError();
  });

  it('throws when the signature differs in length', () => {
    expect(() => assertTokenSignature(token, key, validSignature.slice(0, -1))).toThrowError();
    expect(() => assertTokenSignature(token, key, validSignature + '0')).toThrowError();
  });
});
