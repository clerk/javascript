import type { ClerkRequest } from '@clerk/backend/internal';
import { describe, expect, it, vi } from 'vitest';

import { loadOptions } from '../loadOptions';

vi.mock('../constants', () => ({ commonEnvs: () => ({}) }));

const request = {} as ClerkRequest;

describe('loadOptions', () => {
  it.each([
    ['only the secret key is missing', { publishableKey: 'pk_test_Zm9vLWJhci0xMi5jbGVyay5hY2NvdW50cy5kZXYk' }],
    ['both keys are missing', {}],
  ])('throws the CLI-pointing error when %s', (_, overrides) => {
    expect(() => loadOptions(request, overrides)).toThrow(/Missing secretKey[\s\S]*npx clerk@latest init/);
  });
});
