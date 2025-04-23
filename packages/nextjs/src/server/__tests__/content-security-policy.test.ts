import { describe, expect, it, vi } from 'vitest';

import { createCSPHeader, generateNonce } from '../content-security-policy';

describe('CSP Header Utils', () => {
  describe('generateNonce', () => {
    it('should generate a base64 nonce of correct length', () => {
      const nonce = generateNonce();
      expect(nonce).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64 pattern
      expect(Buffer.from(nonce, 'base64')).toHaveLength(16);
    });

    it('should generate unique nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe('createCSPHeader', () => {
    const testHost = 'clerk.example.com';

    it('should create a standard CSP header with default directives', () => {
      const result = createCSPHeader(false, testHost);

      const directives = result.header.split('; ');

      expect(directives).toContainEqual("default-src 'self'");
      expect(directives).toContainEqual(
        "connect-src 'self' https://clerk-telemetry.com https://*.clerk-telemetry.com https://api.stripe.com https://maps.googleapis.com clerk.example.com",
      );
      expect(directives).toContainEqual("form-action 'self'");
      expect(directives).toContainEqual(
        "frame-src 'self' https://challenges.cloudflare.com https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com",
      );
      expect(directives).toContainEqual("img-src 'self' https://img.clerk.com");
      expect(directives).toContainEqual("style-src 'self' 'unsafe-inline'");
      expect(directives).toContainEqual("worker-src 'self' blob:");

      // script-src can vary based on env, so check each value separately
      const scriptSrc = directives.find(d => d.startsWith('script-src'));
      expect(scriptSrc).toBeDefined();
      expect(scriptSrc).toContain("'self'");
      expect(scriptSrc).toContain("'unsafe-inline'");
      expect(scriptSrc).toContain('https:');
      expect(scriptSrc).toContain('http:');
      expect(scriptSrc).toContain('https://*.js.stripe.com');
      expect(scriptSrc).toContain('https://js.stripe.com');
      expect(scriptSrc).toContain('https://maps.googleapis.com');
      if (process.env.NODE_ENV !== 'production') {
        expect(scriptSrc).toContain("'unsafe-eval'");
      }

      expect(result.nonce).toBeUndefined();
    });

    it('should create a strict-dynamic CSP header with nonce', () => {
      const result = createCSPHeader(true, testHost);

      // Extract the script-src directive and verify it contains the required values
      const directives = result.header.split('; ');
      const scriptSrcDirective = directives.find((d: string) => d.startsWith('script-src')) ?? '';
      expect(scriptSrcDirective).toBeDefined();

      const scriptSrcValues = scriptSrcDirective.replace('script-src ', '').split(' ');
      expect(scriptSrcValues).toContain("'self'");
      expect(scriptSrcValues).toContain("'unsafe-inline'");
      expect(scriptSrcValues).toContain("'strict-dynamic'");
      expect(scriptSrcValues.some(val => val.startsWith("'nonce-"))).toBe(true);

      expect(result.nonce).toBeDefined();
      expect(result.nonce).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it('should handle custom directives as an object', () => {
      const customDirectives = {
        'default-src': ['none'],
        'img-src': ['self', 'https://example.com'],
        'custom-directive': ['value'],
      };
      const result = createCSPHeader(false, testHost, customDirectives);

      expect(result.header).toContain("default-src 'none'");
      // Check for the presence of all required values in the img-src directive
      const directives = result.header.split('; ');
      const imgSrcDirective = directives.find(d => d.startsWith('img-src'));
      expect(imgSrcDirective).toBeDefined();
      expect(imgSrcDirective).toContain("'self'");
      expect(imgSrcDirective).toContain('https://img.clerk.com');
      expect(imgSrcDirective).toContain('https://example.com');
      expect(result.header).toContain('custom-directive value');
    });

    it('should handle development environment specific directives', () => {
      const result = createCSPHeader(false, testHost);
      const directives = result.header.split('; ');
      const scriptSrcDirective = directives.find(d => d.startsWith('script-src'));
      expect(scriptSrcDirective).toBeDefined();
      expect(scriptSrcDirective).toContain("'self'");
      expect(scriptSrcDirective).toContain("'unsafe-eval'");
      expect(scriptSrcDirective).toContain("'unsafe-inline'");
      expect(scriptSrcDirective).toContain('https:');
      expect(scriptSrcDirective).toContain('http:');
      expect(scriptSrcDirective).toContain('https://*.js.stripe.com');
      expect(scriptSrcDirective).toContain('https://js.stripe.com');
      expect(scriptSrcDirective).toContain('https://maps.googleapis.com');
    });

    it('preserves all original CLERK_CSP_VALUES directives with special keywords quoted', () => {
      const result = createCSPHeader(false, testHost);

      // Split the result into individual directives for precise testing
      const directives = result.header.split('; ');

      // Check each directive individually with exact matches
      expect(directives).toContainEqual(
        "connect-src 'self' https://clerk-telemetry.com https://*.clerk-telemetry.com https://api.stripe.com https://maps.googleapis.com clerk.example.com",
      );
      expect(directives).toContainEqual("default-src 'self'");
      expect(directives).toContainEqual("form-action 'self'");
      expect(directives).toContainEqual(
        "frame-src 'self' https://challenges.cloudflare.com https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com",
      );
      expect(directives).toContainEqual("img-src 'self' https://img.clerk.com");
      expect(directives).toContainEqual("style-src 'self' 'unsafe-inline'");
      expect(directives).toContainEqual("worker-src 'self' blob:");

      // script-src varies based on NODE_ENV, so we check for common values
      const scriptSrc = directives.find((d: string) => d.startsWith('script-src'));
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

      const result = createCSPHeader(false, testHost);
      const directives = result.header.split('; ');

      const scriptSrc = directives.find((d: string) => d.startsWith('script-src'));
      expect(scriptSrc).toBeDefined();

      // In development, script-src should include 'unsafe-eval'
      expect(scriptSrc).toContain("'unsafe-eval'");
      expect(scriptSrc).toContain("'self'");
      expect(scriptSrc).toContain('https:');
      expect(scriptSrc).toContain('http:');
      expect(scriptSrc).toContain("'unsafe-inline'");

      vi.stubEnv('NODE_ENV', 'production');
    });

    it('properly converts host to clerk subdomain in CSP directives', () => {
      const host = 'clerk.example.com';
      const result = createCSPHeader(false, host);

      // Split the result into individual directives for precise testing
      const directives = result.header.split('; ');

      // When full URL is provided, it should be parsed to clerk.domain.tld in all relevant directives
      expect(directives).toContainEqual(
        `connect-src 'self' https://clerk-telemetry.com https://*.clerk-telemetry.com https://api.stripe.com https://maps.googleapis.com clerk.example.com`,
      );
      expect(directives).toContainEqual(`img-src 'self' https://img.clerk.com`);
      expect(directives).toContainEqual(
        `frame-src 'self' https://challenges.cloudflare.com https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com`,
      );

      // Check that other directives are present but don't contain the clerk subdomain
      expect(directives).toContainEqual(`default-src 'self'`);
      expect(directives).toContainEqual(`form-action 'self'`);
      expect(directives).toContainEqual(`style-src 'self' 'unsafe-inline'`);
      expect(directives).toContainEqual(`worker-src 'self' blob:`);
    });

    it('merges and deduplicates values for existing directives while preserving special keywords', () => {
      const customDirectives = {
        'script-src': ["'self'", 'new-value', 'another-value', "'unsafe-inline'", "'unsafe-eval'"],
      };
      const result = createCSPHeader(false, testHost, customDirectives);

      // The script-src directive should contain both the default values and new values, with special keywords quoted
      const resultDirectives = result.header.split('; ');
      const scriptSrcDirective = resultDirectives.find((d: string) => d.startsWith('script-src')) ?? '';
      expect(scriptSrcDirective).toBeDefined();

      // Verify it contains all expected values exactly once
      const values = new Set(scriptSrcDirective.replace('script-src ', '').split(' '));
      expect(values).toContain("'self'");
      expect(values).toContain("'unsafe-inline'");
      expect(values).toContain('new-value');
      expect(values).toContain('another-value');
    });

    it('correctly adds new directives from custom directives object and preserves special keyword quoting', () => {
      const customDirectives = {
        'object-src': ['self', 'value1', 'value2', 'unsafe-inline'],
      };
      const result = createCSPHeader(false, testHost, customDirectives);

      // The new directive should be added
      const directives = result.header.split('; ');
      const newDirective = directives.find((d: string) => d.startsWith('object-src')) ?? '';
      expect(newDirective).toBeDefined();

      const newDirectiveValues = newDirective.replace('object-src ', '').split(' ');
      expect(newDirectiveValues).toContain("'self'");
      expect(newDirectiveValues).toContain('value1');
      expect(newDirectiveValues).toContain('value2');
      expect(newDirectiveValues).toContain("'unsafe-inline'");
    });

    it('produces a complete CSP header with all expected directives and special keywords quoted', () => {
      const customDirectives = {
        'script-src': ['new-value', 'unsafe-inline'],
        'object-src': ['self', 'value1', 'value2'],
      };
      const result = createCSPHeader(false, testHost, customDirectives);

      // Split the result into individual directives for precise testing
      const directives = result.header.split('; ');

      // Verify all directives are present with their exact values, with special keywords quoted
      expect(directives).toContainEqual(
        "connect-src 'self' https://clerk-telemetry.com https://*.clerk-telemetry.com https://api.stripe.com https://maps.googleapis.com clerk.example.com",
      );
      expect(directives).toContainEqual("default-src 'self'");
      expect(directives).toContainEqual("form-action 'self'");
      expect(directives).toContainEqual(
        "frame-src 'self' https://challenges.cloudflare.com https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com",
      );
      expect(directives).toContainEqual("img-src 'self' https://img.clerk.com");
      expect(directives).toContainEqual("style-src 'self' 'unsafe-inline'");
      expect(directives).toContainEqual("worker-src 'self' blob:");

      // Verify the new directive exists and has expected values
      const newDirective = directives.find((d: string) => d.startsWith('object-src')) ?? '';
      expect(newDirective).toBeDefined();

      const newDirectiveValues = newDirective.replace('object-src ', '').split(' ');
      expect(newDirectiveValues).toContain("'self'");
      expect(newDirectiveValues).toContain('value1');
      expect(newDirectiveValues).toContain('value2');

      // Extract the script-src directive and check for each expected value individually
      const scriptSrcDirective = directives.find((d: string) => d.startsWith('script-src')) ?? '';
      expect(scriptSrcDirective).toBeDefined();

      // Verify it contains all expected values regardless of order
      const scriptSrcValues = scriptSrcDirective.replace('script-src ', '').split(' ');
      expect(scriptSrcValues).toContain("'self'");
      expect(scriptSrcValues).toContain("'unsafe-inline'");
      expect(scriptSrcValues).toContain('https:');
      expect(scriptSrcValues).toContain('http:');
      expect(scriptSrcValues).toContain('new-value');

      // Verify the header format (directives separated by semicolons)
      expect(result.header).toMatch(/^[^;]+(; [^;]+)*$/);
    });

    it('automatically quotes special keywords in CSP directives regardless of input format', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const customDirectives = {
        'script-src': ['self', 'unsafe-inline', 'unsafe-eval', 'custom-domain.com'],
        'new-directive': ['none'],
      };
      const result = createCSPHeader(false, testHost, customDirectives);

      // Verify that special keywords are always quoted in output, regardless of input format
      const resultDirectives = result.header.split('; ');

      // Verify script-src directive has properly quoted keywords
      const scriptSrcDirective = resultDirectives.find((d: string) => d.startsWith('script-src')) ?? '';
      expect(scriptSrcDirective).toBeDefined();
      const scriptSrcValues = scriptSrcDirective.replace('script-src ', '').split(' ');
      expect(scriptSrcValues).toContain("'self'");
      expect(scriptSrcValues).toContain("'unsafe-inline'");
      expect(scriptSrcValues).toContain("'unsafe-eval'");
      expect(scriptSrcValues).toContain('custom-domain.com');
      // Verify default values for standard mode
      expect(scriptSrcValues).toContain('http:');
      expect(scriptSrcValues).toContain('https:');

      // Verify new-directive has properly quoted keywords and is the sole value
      const newDirective = resultDirectives.find((d: string) => d.startsWith('new-directive')) ?? '';
      expect(newDirective).toBeDefined();
      const newDirectiveValues = newDirective.replace('new-directive ', '').split(' ');
      expect(newDirectiveValues).toContain("'none'");
      expect(newDirectiveValues).toHaveLength(1);

      vi.stubEnv('NODE_ENV', 'production');
    });

    it('correctly merges clerk subdomain with existing CSP values', () => {
      const customDirectives = {
        'connect-src': ['self', 'https://api.example.com'],
        'img-src': ['self', 'https://images.example.com'],
        'frame-src': ['self', 'https://frames.example.com'],
      };
      const result = createCSPHeader(false, testHost, customDirectives);

      const directives = result.header.split('; ');

      // Verify clerk subdomain is added while preserving existing values
      expect(directives).toContainEqual(
        `connect-src 'self' https://clerk-telemetry.com https://*.clerk-telemetry.com https://api.stripe.com https://maps.googleapis.com clerk.example.com https://api.example.com`,
      );
      // Verify all required domains are present in the img-src directive
      const imgSrcDirective = directives.find(d => d.startsWith('img-src')) || '';
      expect(imgSrcDirective).toBeDefined();
      expect(imgSrcDirective).toContain("'self'");
      expect(imgSrcDirective).toContain('https://img.clerk.com');
      expect(imgSrcDirective).toContain('https://images.example.com');
      expect(directives).toContainEqual(
        `frame-src 'self' https://challenges.cloudflare.com https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com https://frames.example.com`,
      );

      // Verify other directives are present and unchanged
      expect(directives).toContainEqual(`default-src 'self'`);
      expect(directives).toContainEqual(`form-action 'self'`);
      expect(directives).toContainEqual(`style-src 'self' 'unsafe-inline'`);
      expect(directives).toContainEqual(`worker-src 'self' blob:`);
    });

    it('correctly implements strict-dynamic mode with nonce-based script-src', () => {
      const result = createCSPHeader(true, testHost);
      const directives = result.header.split('; ');

      // Extract the script-src directive and check for specific values
      const scriptSrcDirective = directives.find((d: string) => d.startsWith('script-src')) ?? '';
      expect(scriptSrcDirective).toBeDefined();

      // In strict-dynamic mode, script-src should contain 'strict-dynamic' and a nonce
      const scriptSrcValues = scriptSrcDirective.replace('script-src ', '').split(' ');
      expect(scriptSrcValues).toContain("'strict-dynamic'");
      expect(scriptSrcValues.some(val => val.startsWith("'nonce-"))).toBe(true);

      // Should not contain http: or https: in strict-dynamic mode
      expect(scriptSrcValues).not.toContain('http:');
      expect(scriptSrcValues).not.toContain('https:');

      // Other directives should still be present
      expect(directives).toContainEqual(
        "connect-src 'self' https://clerk-telemetry.com https://*.clerk-telemetry.com https://api.stripe.com https://maps.googleapis.com clerk.example.com",
      );
      expect(directives).toContainEqual("default-src 'self'");
      expect(directives).toContainEqual("form-action 'self'");
      expect(directives).toContainEqual(
        "frame-src 'self' https://challenges.cloudflare.com https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com",
      );
      expect(directives).toContainEqual("img-src 'self' https://img.clerk.com");
      expect(directives).toContainEqual("style-src 'self' 'unsafe-inline'");
      expect(directives).toContainEqual("worker-src 'self' blob:");
    });
  });
});
