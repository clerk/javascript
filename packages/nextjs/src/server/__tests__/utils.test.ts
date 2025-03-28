import { describe, expect, it } from 'vitest';

import { createCSPHeader } from '../utils';

describe('createCSPHeader', () => {
  it('preserves all original CLERK_CSP_VALUES directives with quoted self', () => {
    const result = createCSPHeader('custom-directive new-value;');

    // Each directive should be present exactly as defined in CLERK_CSP_VALUES with 'self' quoted
    expect(result).toContain("connect-src 'self' https://trusty-krill-94.clerk.accounts.dev");
    expect(result).toContain("default-src 'self'");
    expect(result).toContain("form-action 'self'");
    expect(result).toContain("frame-src 'self' https://challenges.cloudflare.com");
    expect(result).toContain("img-src 'self' https://img.clerk.com");
    expect(result).toContain("style-src 'self'");
    expect(result).toContain("worker-src 'self' blob:");

    // script-src varies based on NODE_ENV, so we check for common values
    expect(result).toContain("script-src 'self' strict-dynamic https: http:");
  });

  it('merges and deduplicates values for common directives with quoted self', () => {
    const result = createCSPHeader(`script-src 'self' new-value another-value;`);

    // The script-src directive should contain all values, deduplicated, with 'self' quoted
    expect(result).toContain("script-src 'self' strict-dynamic https: http: new-value existing-value");
  });

  it('adds new directives from custom CSP with quoted self', () => {
    const result = createCSPHeader(`new-directive 'self' value1 value2 ;`);

    // The new directive should be added exactly as specified, with 'self' quoted
    expect(result).toContain("new-directive 'self' value1 value2");
  });

  it('produces a complete CSP header with all expected directives and quoted self', () => {
    const result = createCSPHeader(`script-src new-value; new-directive 'self' value1 value2`);

    // Verify all directives are present with their exact values, with 'self' quoted
    expect(result).toContain("connect-src 'self' https://trusty-krill-94.clerk.accounts.dev");
    expect(result).toContain("default-src 'self'");
    expect(result).toContain("form-action 'self'");
    expect(result).toContain("frame-src 'self' https://challenges.cloudflare.com");
    expect(result).toContain("img-src 'self' https://img.clerk.com");
    expect(result).toContain("script-src 'self' strict-dynamic https: http: unsafe-eval new-value");
    expect(result).toContain("style-src 'self'");
    expect(result).toContain("worker-src 'self' blob:");
    expect(result).toContain("new-directive 'self' value1 value2");

    // Verify the header format (directives separated by semicolons)
    expect(result).toMatch(/^[^;]+(; [^;]+)*$/);
  });
});
