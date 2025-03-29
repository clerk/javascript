import { describe, expect, it, vi } from 'vitest';

import { createCSPHeader } from '../utils';

describe('createCSPHeader', () => {
  it('preserves all original CLERK_CSP_VALUES directives with special keywords quoted', () => {
    const result = createCSPHeader('example.com', 'custom-directive new-value;');

    // Split the result into individual directives for precise testing
    const directives = result.split('; ');

    // Check each directive individually with exact matches
    expect(directives).toContainEqual("connect-src 'self' *.clerk.accounts.dev clerk.example.com");
    expect(directives).toContainEqual("default-src 'self'");
    expect(directives).toContainEqual("form-action 'self'");
    expect(directives).toContainEqual("frame-src 'self' https://challenges.cloudflare.com");
    expect(directives).toContainEqual("img-src 'self' https://img.clerk.com");
    expect(directives).toContainEqual("style-src 'self' 'unsafe-inline'");
    expect(directives).toContainEqual("worker-src 'self' blob:");
    expect(directives).toContainEqual('custom-directive new-value');

    // script-src varies based on NODE_ENV, so we check for common values
    const scriptSrc = directives.find(d => d.startsWith('script-src'));
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).toContain('https:');
    expect(scriptSrc).toContain('http:');
    expect(scriptSrc).toContain("'unsafe-inline'");
    // 'unsafe-eval' depends on NODE_ENV, so we verify conditionally
    if (process.env.NODE_ENV !== 'production') {
      expect(scriptSrc).toContain("'unsafe-eval'");
    }
  });

  it('includes script-src with development-specific values when NODE_ENV is not production', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const result = createCSPHeader('example.com', '');
    const directives = result.split('; ');

    const scriptSrc = directives.find(d => d.startsWith('script-src'));
    expect(scriptSrc).toBeDefined();

    // In development, script-src should include 'unsafe-eval'
    expect(scriptSrc).toContain("'unsafe-eval'");
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).toContain('https:');
    expect(scriptSrc).toContain('http:');
    expect(scriptSrc).toContain("'unsafe-inline'");
  });

  it('properly converts host to clerk subdomain in CSP directives', () => {
    const host = 'https://example.com';
    const result = createCSPHeader(host, '');

    // Split the result into individual directives for precise testing
    const directives = result.split('; ');

    // When full URL is provided, it should be parsed to clerk.domain.tld in all relevant directives
    expect(directives).toContainEqual(`connect-src 'self' *.clerk.accounts.dev clerk.example.com`);
    expect(directives).toContainEqual(`img-src 'self' https://img.clerk.com`);
    expect(directives).toContainEqual(`frame-src 'self' https://challenges.cloudflare.com`);

    // Check that other directives are present but don't contain the clerk subdomain
    expect(directives).toContainEqual(`default-src 'self'`);
    expect(directives).toContainEqual(`form-action 'self'`);
    expect(directives).toContainEqual(`style-src 'self' 'unsafe-inline'`);
    expect(directives).toContainEqual(`worker-src 'self' blob:`);
  });

  it('merges and deduplicates values for existing directives while preserving special keywords', () => {
    const result = createCSPHeader(
      'example.com',
      `script-src 'self' new-value another-value 'unsafe-inline' 'unsafe-eval';`,
    );

    // The script-src directive should contain both the default values and new values, with special keywords quoted
    const resultDirectives = result.split('; ');
    const scriptSrcDirective = resultDirectives.find(d => d.startsWith('script-src')) ?? '';
    expect(scriptSrcDirective).toBeDefined();

    // Verify it contains all expected values exactly once
    const values = new Set(scriptSrcDirective.replace('script-src ', '').split(' '));
    expect(values).toContain("'self'");
    expect(values).toContain("'unsafe-inline'");
    expect(values).toContain("'unsafe-eval'");
    expect(values).toContain('https:');
    expect(values).toContain('http:');
    expect(values).toContain('new-value');
    expect(values).toContain('another-value');
  });

  it('correctly adds new directives from custom CSP and preserves special keyword quoting', () => {
    const result = createCSPHeader('example.com', `new-directive 'self' value1 value2 'none' 'unsafe-inline';`);

    // The new directive should be added exactly as specified, with special keywords quoted
    expect(result).toContain("new-directive 'self' value1 value2 'none' 'unsafe-inline'");
  });

  it('produces a complete CSP header with all expected directives and special keywords quoted', () => {
    const result = createCSPHeader(
      'example.com',
      `script-src new-value 'unsafe-inline'; new-directive 'self' value1 value2 'none'`,
    );

    // Split the result into individual directives for precise testing
    const directives = result.split('; ');

    // Verify all directives are present with their exact values, with special keywords quoted
    expect(directives).toContainEqual("connect-src 'self' *.clerk.accounts.dev clerk.example.com");
    expect(directives).toContainEqual("default-src 'self'");
    expect(directives).toContainEqual("form-action 'self'");
    expect(directives).toContainEqual("frame-src 'self' https://challenges.cloudflare.com");
    expect(directives).toContainEqual("img-src 'self' https://img.clerk.com");
    expect(directives).toContainEqual("style-src 'self' 'unsafe-inline'");
    expect(directives).toContainEqual("worker-src 'self' blob:");
    expect(directives).toContainEqual("new-directive 'self' value1 value2 'none'");

    // Extract the script-src directive and check for each expected value individually
    const scriptSrcDirective = directives.find(d => d.startsWith('script-src')) ?? '';
    expect(scriptSrcDirective).toBeDefined();

    // Verify it contains all expected values regardless of order
    const scriptSrcValues = scriptSrcDirective.replace('script-src ', '').split(' ');
    expect(scriptSrcValues).toContain("'self'");
    expect(scriptSrcValues).toContain("'unsafe-inline'");
    expect(scriptSrcValues).toContain("'unsafe-eval'");
    expect(scriptSrcValues).toContain('https:');
    expect(scriptSrcValues).toContain('http:');
    expect(scriptSrcValues).toContain('new-value');

    // Verify the header format (directives separated by semicolons)
    expect(result).toMatch(/^[^;]+(; [^;]+)*$/);
  });

  it('automatically quotes special keywords in CSP directives regardless of input format', () => {
    const result = createCSPHeader(
      'example.com',
      `
      script-src self unsafe-inline unsafe-eval;
      new-directive none self unsafe-inline
    `,
    );

    // Verify that special keywords are always quoted in output, regardless of input format
    const resultDirectives = result.split('; ');

    // Verify script-src directive has properly quoted keywords
    const scriptSrcDirective = resultDirectives.find(d => d.startsWith('script-src')) ?? '';
    expect(scriptSrcDirective).toBeDefined();
    const scriptSrcValues = scriptSrcDirective.replace('script-src ', '').split(' ');
    expect(scriptSrcValues).toContain("'self'");
    expect(scriptSrcValues).toContain("'unsafe-inline'");
    expect(scriptSrcValues).toContain("'unsafe-eval'");

    // Verify new-directive has properly quoted keywords
    const newDirective = resultDirectives.find(d => d.startsWith('new-directive')) ?? '';
    expect(newDirective).toBeDefined();
    const newDirectiveValues = newDirective.replace('new-directive ', '').split(' ');
    expect(newDirectiveValues).toContain("'none'");
    expect(newDirectiveValues).toContain("'self'");
    expect(newDirectiveValues).toContain("'unsafe-inline'");
  });

  it('correctly merges clerk subdomain with existing CSP values', () => {
    const host = 'https://example.com';
    const existingCSP = `
      connect-src 'self' https://api.example.com;
      img-src 'self' https://images.example.com;
      frame-src 'self' https://frames.example.com;
    `;
    const result = createCSPHeader(host, existingCSP);

    // Split the result into individual directives for precise testing
    const directives = result.split('; ');

    // Verify clerk subdomain is added while preserving existing values
    // Check complete directive strings for exact matches
    expect(directives).toContainEqual(
      `connect-src 'self' *.clerk.accounts.dev clerk.example.com https://api.example.com`,
    );
    expect(directives).toContainEqual(`img-src 'self' https://img.clerk.com https://images.example.com`);
    expect(directives).toContainEqual(`frame-src 'self' https://challenges.cloudflare.com https://frames.example.com`);

    // Verify other directives are present and unchanged
    expect(directives).toContainEqual(`default-src 'self'`);
    expect(directives).toContainEqual(`form-action 'self'`);
    expect(directives).toContainEqual(`style-src 'self' 'unsafe-inline'`);
    expect(directives).toContainEqual(`worker-src 'self' blob:`);
  });
});
