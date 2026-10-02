import { describe, expect, it } from 'vitest';

import type { VerificationResource } from '../../types';
import { sortIdentificationBasedOnVerification } from '../sortIdentificationBasedOnVerification';

function identification(id: string, status: VerificationResource['status'], expireAt: Date | null = null) {
  return { id, verification: { status, expireAt } };
}

describe('identification ordering', () => {
  it('orders primary, verified, expiring unverified, and absent verification without mutating the input', () => {
    const input = Object.freeze([
      identification('missing', null),
      identification('later', 'unverified', new Date(200)),
      identification('verified-b', 'verified'),
      identification('primary', 'unverified'),
      identification('earlier', 'unverified', new Date(100)),
      identification('verified-a', 'verified'),
    ]);
    const original = [...input];

    const sorted = sortIdentificationBasedOnVerification(input, 'primary');

    expect(sorted.map(item => item.id)).toEqual(['primary', 'verified-a', 'verified-b', 'earlier', 'later', 'missing']);
    expect(input).toEqual(original);
    expect(sorted[0]).toBe(input[3]);
  });

  it('keeps unverified identifications without expiry in their existing order', () => {
    const input = [identification('b', 'unverified'), identification('a', 'failed')];

    expect(sortIdentificationBasedOnVerification(input, null)).toEqual(input);
    expect(sortIdentificationBasedOnVerification(undefined, null)).toEqual([]);
  });
});
