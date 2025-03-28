import { describe, it, expect } from 'vitest';
import { createCSPHeader } from '../utils';
describe('createCSPHeader', () => {
  it('should return default Clerk CSP values when no header is provided', () => {
    const result = createCSPHeader();

    // Check for essential Clerk directives
    expect(result).toContain("default-src self");
    expect(result).toContain("connect-src self https://trusty-krill-94.clerk.accounts.dev");
    expect(result).toContain("script-src self strict-dynamic https: http:");
    expect(result).toContain("img-src self https://img.clerk.com");
  });

  it('should merge custom directives with Clerk defaults', () => {
    const customHeader = "default-src none; script-src self unsafe-inline";
    const result = createCSPHeader(customHeader);

    // Check that custom values override Clerk defaults
    expect(result).toContain("default-src none");
    expect(result).toContain("script-src self unsafe-inline");

    // Check that other Clerk defaults are still present
    expect(result).toContain("connect-src self https://trusty-krill-94.clerk.accounts.dev");
    expect(result).toContain("img-src self https://img.clerk.com");
  });

  it('should preserve custom directives not in Clerk defaults', () => {
    const customHeader = "custom-directive value; another-directive test";
    const result = createCSPHeader(customHeader);

    // Check that custom directives are preserved
    expect(result).toContain("custom-directive value");
    expect(result).toContain("another-directive test");

    // Check that Clerk defaults are still present
    expect(result).toContain("default-src self");
    expect(result).toContain("connect-src self https://trusty-krill-94.clerk.accounts.dev");
  });

  it('should handle multiple directives and values correctly', () => {
    const customHeader = "default-src none; script-src self unsafe-inline; custom-directive value";
    const result = createCSPHeader(customHeader);

    expect(result).toContain("default-src none");
    expect(result).toContain("script-src self unsafe-inline");
    expect(result).toContain("custom-directive value");

    // All 8 default CSP directives are preserved (even when overridden) + 2 modified/custom directives
    expect(result.split('; ')).toHaveLength(10);
  });

  it('should handle empty or invalid input gracefully', () => {
    const emptyResult = createCSPHeader('');
    expect(emptyResult).toBeTruthy();
    expect(emptyResult).toContain("default-src self");

    const invalidResult = createCSPHeader('invalid-directive');
    expect(invalidResult).toBeTruthy();
    expect(invalidResult).toContain("default-src self");
  });
});
