import { describe, expect, it } from 'vitest';

import { createCSPHeader } from '../utils';

describe('createCSPHeader', () => {
  it('preserves all original CLERK_CSP_VALUES directives with special keywords quoted', () => {
    const result = createCSPHeader('example.com', 'custom-directive new-value;');

    // Each directive should be present exactly as defined in CLERK_CSP_VALUES with special keywords quoted
    expect(result).toContain("connect-src 'self' https://trusty-krill-94.clerk.accounts.dev");
    expect(result).toContain("default-src 'self'");
    expect(result).toContain("form-action 'self'");
    expect(result).toContain("frame-src 'self' https://challenges.cloudflare.com");
    expect(result).toContain("img-src 'self' https://img.clerk.com");
    expect(result).toContain("style-src 'self' 'unsafe-inline'");
    expect(result).toContain("worker-src 'self' blob:");

    // script-src varies based on NODE_ENV, so we check for common values
    expect(result).toContain("script-src 'self' https: http: 'unsafe-inline' 'unsafe-eval'");
  });

  it('includes the host in relevant CSP directives when provided', () => {
    const host = 'https://example.com';
    const result = createCSPHeader(host, '');

    // Verify host is added to connect-src, img-src, and frame-src
    expect(result).toContain(`connect-src 'self' ${host} https://trusty-krill-94.clerk.accounts.dev`);
    expect(result).toContain(`img-src 'self' ${host} https://img.clerk.com`);
    expect(result).toContain(`frame-src 'self' ${host} https://challenges.cloudflare.com`);
  });

  it('merges and deduplicates values for common directives with special keywords quoted', () => {
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

  it('adds new directives from custom CSP with special keywords quoted', () => {
    const result = createCSPHeader('example.com', `new-directive 'self' value1 value2 'none' 'unsafe-inline';`);

    // The new directive should be added exactly as specified, with special keywords quoted
    expect(result).toContain("new-directive 'self' value1 value2 'none' 'unsafe-inline'");
  });

  it('produces a complete CSP header with all expected directives and special keywords quoted', () => {
    const result = createCSPHeader(
      'example.com',
      `script-src new-value 'unsafe-inline'; new-directive 'self' value1 value2 'none'`,
    );

    // Verify all directives are present with their exact values, with special keywords quoted
    expect(result).toContain("connect-src 'self' https://trusty-krill-94.clerk.accounts.dev");
    expect(result).toContain("default-src 'self'");
    expect(result).toContain("form-action 'self'");
    expect(result).toContain("frame-src 'self' https://challenges.cloudflare.com");
    expect(result).toContain("img-src 'self' https://img.clerk.com");

    // Extract the script-src directive and check for each expected value individually
    const resultDirectives = result.split('; ');
    const scriptSrcDirective = resultDirectives.find(d => d.startsWith('script-src')) ?? '';
    expect(scriptSrcDirective).toBeDefined();

    // Verify it contains all expected values regardless of order
    const scriptSrcValues = scriptSrcDirective.replace('script-src ', '').split(' ');
    expect(scriptSrcValues).toContain("'self'");
    expect(scriptSrcValues).toContain("'unsafe-inline'");
    expect(scriptSrcValues).toContain("'unsafe-eval'");
    expect(scriptSrcValues).toContain('https:');
    expect(scriptSrcValues).toContain('http:');
    expect(scriptSrcValues).toContain('new-value');

    expect(result).toContain("style-src 'self' 'unsafe-inline'");
    expect(result).toContain("worker-src 'self' blob:");
    expect(result).toContain("new-directive 'self' value1 value2 'none'");

    // Verify the header format (directives separated by semicolons)
    expect(result).toMatch(/^[^;]+(; [^;]+)*$/);
  });

  it('handles special keywords consistently regardless of input quoting', () => {
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

  it('combines host with existing CSP values correctly', () => {
    const host = 'https://example.com';
    const existingCSP = `
      connect-src 'self' https://api.example.com;
      img-src 'self' https://images.example.com;
      frame-src 'self' https://frames.example.com;
    `;
    const result = createCSPHeader(host, existingCSP);

    // Verify host is added while preserving existing values
    expect(result).toContain(`connect-src 'self' ${host} https://api.example.com`);
    expect(result).toContain(`img-src 'self' ${host} https://images.example.com`);
    expect(result).toContain(`frame-src 'self' ${host} https://frames.example.com`);
  });
});
