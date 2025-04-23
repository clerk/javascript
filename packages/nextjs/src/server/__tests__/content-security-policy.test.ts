import { describe, expect, it, vi } from 'vitest';

import { createContentSecurityPolicyHeaders, generateNonce } from '../content-security-policy';

describe('CSP Header Utils', () => {
  describe('generateNonce', () => {
    it('should generate a base64 nonce of correct length', () => {
      const nonce = generateNonce();
      expect(nonce).toMatch(/^[A-Za-z0-9+/=]+$/);
      expect(Buffer.from(nonce, 'base64')).toHaveLength(16);
    });

    it('should generate unique nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe('createContentSecurityPolicyHeaders', () => {
    const testHost = 'clerk.example.com';

    it('should create standard CSP headers with default directives', () => {
      const result = createContentSecurityPolicyHeaders(testHost, {});

      expect(result.headers).toHaveLength(1);
      const [headerName, headerValue] = result.headers[0];
      expect(headerName).toBe('content-security-policy');

      const directives = headerValue.split('; ');

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
    });

    it('should create strict-dynamic CSP headers with nonce', () => {
      const result = createContentSecurityPolicyHeaders(testHost, { strict: true });

      expect(result.headers).toHaveLength(2);
      const [cspHeader, nonceHeader] = result.headers;
      expect(cspHeader[0]).toBe('content-security-policy');
      expect(nonceHeader[0]).toBe('x-nonce');

      const directives = cspHeader[1].split('; ');
      const scriptSrcDirective = directives.find(d => d.startsWith('script-src')) ?? '';
      expect(scriptSrcDirective).toBeDefined();

      const scriptSrcValues = scriptSrcDirective.replace('script-src ', '').split(' ');
      expect(scriptSrcValues).toContain("'self'");
      expect(scriptSrcValues).toContain("'unsafe-inline'");
      expect(scriptSrcValues).toContain("'strict-dynamic'");
      expect(scriptSrcValues.some(val => val.startsWith("'nonce-"))).toBe(true);

      expect(nonceHeader[1]).toMatch(/^[A-Za-z0-9+/=]+$/);
      expect(cspHeader[1]).toContain(`'nonce-${nonceHeader[1]}'`);
    });

    it('should handle report-only mode', () => {
      const result = createContentSecurityPolicyHeaders(testHost, { reportOnly: true });

      expect(result.headers).toHaveLength(1);
      const [headerName, headerValue] = result.headers[0];
      expect(headerName).toBe('content-security-policy-report-only');

      const directives = headerValue.split('; ');
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
    });

    it('should handle report-to functionality', () => {
      const result = createContentSecurityPolicyHeaders(testHost, { reportTo: 'https://example.com/reports' });

      expect(result.headers).toHaveLength(2);
      const [cspHeader, reportHeader] = result.headers;
      expect(cspHeader[0]).toBe('content-security-policy');
      expect(reportHeader[0]).toBe('reporting-endpoints');

      expect(cspHeader[1]).toContain('report-to csp-endpoint');

      expect(reportHeader[1]).toBe('csp-endpoint="https://example.com/reports"');
    });

    it('should handle custom directives', () => {
      const result = createContentSecurityPolicyHeaders(testHost, {
        directives: {
          'default-src': ['none'],
          'img-src': ['self', 'https://example.com'],
          'frame-src': ['value'],
        },
      });

      expect(result.headers).toHaveLength(1);
      const [headerName, headerValue] = result.headers[0];
      expect(headerName).toBe('content-security-policy');

      const directives = headerValue.split('; ');
      expect(directives).toContainEqual("default-src 'none'");

      const imgSrcDirective = directives.find(d => d.startsWith('img-src'));
      expect(imgSrcDirective).toBeDefined();
      expect(imgSrcDirective).toContain("'self'");
      expect(imgSrcDirective).toContain('https://img.clerk.com');
      expect(imgSrcDirective).toContain('https://example.com');

      const frameSrcDirective = directives.find(d => d.startsWith('frame-src'));
      expect(frameSrcDirective).toBeDefined();
      expect(frameSrcDirective).toContain('value');
    });

    it('should handle development environment specific directives', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const result = createContentSecurityPolicyHeaders(testHost, {});
      const directives = result.headers[0][1].split('; ');
      const scriptSrcDirective = directives.find(d => d.startsWith('script-src'));
      expect(scriptSrcDirective).toBeDefined();
      expect(scriptSrcDirective).toContain("'unsafe-eval'");
      expect(scriptSrcDirective).toContain("'self'");
      expect(scriptSrcDirective).toContain('https:');
      expect(scriptSrcDirective).toContain('http:');
      expect(scriptSrcDirective).toContain("'unsafe-inline'");
      vi.stubEnv('NODE_ENV', 'production');
    });

    it('should handle multiple configurations together', () => {
      const result = createContentSecurityPolicyHeaders(testHost, {
        strict: true,
        reportTo: 'https://example.com/reports',
        directives: {
          'script-src': ['self', 'https://custom-cdn.com'],
        },
      });

      expect(result.headers).toHaveLength(3);
      const cspHeader = result.headers.find(([name]) => name === 'content-security-policy');
      const nonceHeader = result.headers.find(([name]) => name === 'x-nonce');
      const reportHeader = result.headers.find(([name]) => name === 'reporting-endpoints');

      expect(cspHeader).toBeDefined();
      if (!cspHeader) throw new Error('CSP header not found');
      expect(cspHeader[1]).toContain('report-to csp-endpoint');
      expect(cspHeader[1]).toContain('https://custom-cdn.com');
      expect(cspHeader[1]).toContain("'strict-dynamic'");

      expect(nonceHeader).toBeDefined();
      if (!nonceHeader) throw new Error('Nonce header not found');
      expect(nonceHeader[1]).toMatch(/^[A-Za-z0-9+/=]+$/);

      expect(reportHeader).toBeDefined();
      if (!reportHeader) throw new Error('Report header not found');
      expect(reportHeader[1]).toBe('csp-endpoint="https://example.com/reports"');
    });

    it('should handle special keywords in directives', () => {
      const result = createContentSecurityPolicyHeaders(testHost, {
        directives: {
          'script-src': ['self', 'unsafe-inline', 'unsafe-eval', 'custom-domain.com'],
          'object-src': ['none'],
        },
      });

      const directives = result.headers[0][1].split('; ');
      const scriptSrcDirective = directives.find(d => d.startsWith('script-src'));
      expect(scriptSrcDirective).toBeDefined();
      if (!scriptSrcDirective) throw new Error('script-src directive not found');
      const scriptSrcValues = scriptSrcDirective.replace('script-src ', '').split(' ');
      expect(scriptSrcValues).toContain("'self'");
      expect(scriptSrcValues).toContain("'unsafe-inline'");
      expect(scriptSrcValues).toContain("'unsafe-eval'");
      expect(scriptSrcValues).toContain('custom-domain.com');

      const objectSrcDirective = directives.find(d => d.startsWith('object-src'));
      expect(objectSrcDirective).toBeDefined();
      if (!objectSrcDirective) throw new Error('object-src directive not found');
      const objectSrcValues = objectSrcDirective.replace('object-src ', '').split(' ');
      expect(objectSrcValues).toContain("'none'");
      expect(objectSrcValues).toHaveLength(1);
    });

    it('should merge clerk subdomain with existing CSP values', () => {
      const result = createContentSecurityPolicyHeaders(testHost, {
        directives: {
          'connect-src': ['self', 'https://api.example.com'],
          'img-src': ['self', 'https://images.example.com'],
          'frame-src': ['self', 'https://frames.example.com'],
        },
      });

      const directives = result.headers[0][1].split('; ');
      expect(directives).toContainEqual(
        `connect-src 'self' https://clerk-telemetry.com https://*.clerk-telemetry.com https://api.stripe.com https://maps.googleapis.com clerk.example.com https://api.example.com`,
      );

      const imgSrcDirective = directives.find(d => d.startsWith('img-src')) || '';
      expect(imgSrcDirective).toBeDefined();
      expect(imgSrcDirective).toContain("'self'");
      expect(imgSrcDirective).toContain('https://img.clerk.com');
      expect(imgSrcDirective).toContain('https://images.example.com');

      expect(directives).toContainEqual(
        `frame-src 'self' https://challenges.cloudflare.com https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com https://frames.example.com`,
      );
    });
  });
});
