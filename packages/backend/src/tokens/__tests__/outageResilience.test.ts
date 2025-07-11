import { describe, expect, it, vi } from 'vitest';

import type { AuthenticateContext } from '../authenticateContext';
import type { SdkCapabilityResult } from '../outageResilience';
import { OutageResilienceService } from '../outageResilience';

describe('OutageResilienceService', () => {
  let service: OutageResilienceService;
  let mockContext: Partial<AuthenticateContext>;

  beforeEach(() => {
    service = new OutageResilienceService();
    mockContext = {
      request: {
        headers: new Map(),
      } as any,
      getQueryParam: vi.fn(),
    };
  });

  describe('hasBuiltInOutageResiliency', () => {
    it('should detect resilience via explicit header', () => {
      const headers = new Map([
        ['X-Clerk-Outage-Resilient', 'true'],
        ['X-Clerk-SDK', 'clerk-js'],
        ['X-Clerk-SDK-Version', '5.72.0'],
        ['X-Clerk-Handshake-Retry', '2'],
      ]);
      mockContext.request = { headers } as any;

      const result = service.hasBuiltInOutageResiliency(mockContext as AuthenticateContext);

      expect(result).toEqual({
        hasBuiltInOutageResiliency: true,
        sdkIdentifier: 'clerk-js',
        sdkVersion: '5.72.0',
        retryAttempt: 2,
        reason: 'Explicit outage resilience header detected',
      });
    });

    it('should detect resilience via User-Agent pattern', () => {
      const headers = new Map([['User-Agent', 'Mozilla/5.0 (compatible; @clerk/clerk-js@5.72.1)']]);
      mockContext.request = { headers } as any;

      const result = service.hasBuiltInOutageResiliency(mockContext as AuthenticateContext);

      expect(result).toEqual({
        hasBuiltInOutageResiliency: true,
        sdkIdentifier: 'clerk-js',
        sdkVersion: '5.72.1',
        reason: 'SDK clerk-js@5.72.1 supports outage resilience',
      });
    });

    it('should reject older SDK versions', () => {
      const headers = new Map([['User-Agent', 'Mozilla/5.0 (compatible; @clerk/clerk-js@5.71.0)']]);
      mockContext.request = { headers } as any;

      const result = service.hasBuiltInOutageResiliency(mockContext as AuthenticateContext);

      expect(result).toEqual({
        hasBuiltInOutageResiliency: false,
        sdkIdentifier: 'clerk-js',
        sdkVersion: '5.71.0',
        reason: 'SDK clerk-js@5.71.0 does not support outage resilience',
      });
    });

    it('should detect resilience via query parameter fallback', () => {
      mockContext.getQueryParam = vi.fn().mockReturnValue('true');

      const result = service.hasBuiltInOutageResiliency(mockContext as AuthenticateContext);

      expect(result).toEqual({
        hasBuiltInOutageResiliency: true,
        reason: 'Outage resilience query parameter detected',
      });
      expect(mockContext.getQueryParam).toHaveBeenCalledWith('outage_resilient');
    });

    it('should return false when no indicators found', () => {
      mockContext.request = { headers: new Map() } as any;
      mockContext.getQueryParam = vi.fn().mockReturnValue(undefined);

      const result = service.hasBuiltInOutageResiliency(mockContext as AuthenticateContext);

      expect(result).toEqual({
        hasBuiltInOutageResiliency: false,
        reason: 'No resilience indicators found',
      });
    });

    it('should return false when globally disabled', () => {
      service = new OutageResilienceService({ enabled: false });

      const result = service.hasBuiltInOutageResiliency(mockContext as AuthenticateContext);

      expect(result).toEqual({
        hasBuiltInOutageResiliency: false,
        reason: 'Outage resilience disabled globally',
      });
    });
  });

  describe('shouldServeErrorPage', () => {
    it('should serve error page for non-resilient clients', () => {
      mockContext.request = { headers: new Map() } as any;
      mockContext.getQueryParam = vi.fn().mockReturnValue(undefined);

      const result = service.shouldServeErrorPage(mockContext as AuthenticateContext, '/v1/client/handshake');

      expect(result).toEqual({
        shouldServeErrorPage: true,
        reason: 'SDK does not support outage resilience: No resilience indicators found',
      });
    });

    it('should skip error page for resilient clients', () => {
      const headers = new Map([['X-Clerk-Outage-Resilient', 'true']]);
      mockContext.request = { headers } as any;

      const result = service.shouldServeErrorPage(mockContext as AuthenticateContext, '/v1/client/handshake');

      expect(result).toEqual({
        shouldServeErrorPage: false,
        reason: 'SDK supports outage resilience: Explicit outage resilience header detected',
      });
    });

    it('should serve error page for unsupported endpoints', () => {
      const headers = new Map([['X-Clerk-Outage-Resilient', 'true']]);
      mockContext.request = { headers } as any;

      const result = service.shouldServeErrorPage(mockContext as AuthenticateContext, '/v1/users');

      expect(result).toEqual({
        shouldServeErrorPage: true,
        reason: 'Endpoint does not support outage resilience',
      });
    });
  });

  describe('createResilienceHeaders', () => {
    it('should create appropriate headers for resilient clients', () => {
      const capability: SdkCapabilityResult = {
        hasBuiltInOutageResiliency: true,
        sdkIdentifier: 'clerk-js',
        retryAttempt: 3,
        reason: 'Test',
      };

      const headers = service.createResilienceHeaders(capability);

      expect(headers.get('X-Clerk-Outage-Resiliency')).toBe('active');
      expect(headers.get('X-Clerk-SDK-Detected')).toBe('clerk-js');
      expect(headers.get('X-Clerk-Retry-Attempt')).toBe('3');
      expect(headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
      expect(headers.get('Pragma')).toBe('no-cache');
      expect(headers.get('Expires')).toBe('0');
    });

    it('should create cache headers for non-resilient clients', () => {
      const capability: SdkCapabilityResult = {
        hasBuiltInOutageResiliency: false,
        reason: 'Test',
      };

      const headers = service.createResilienceHeaders(capability);

      expect(headers.get('X-Clerk-Outage-Resiliency')).toBeNull();
      expect(headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
      expect(headers.get('Pragma')).toBe('no-cache');
      expect(headers.get('Expires')).toBe('0');
    });
  });

  describe('SDK version detection', () => {
    const testCases = [
      {
        userAgent: '@clerk/nextjs@5.8.0',
        expected: { hasResilience: true, name: 'nextjs', version: '5.8.0' },
      },
      {
        userAgent: '@clerk/nextjs@5.7.9',
        expected: { hasResilience: false, name: 'nextjs', version: '5.7.9' },
      },
      {
        userAgent: '@clerk/clerk-react@5.12.1',
        expected: { hasResilience: true, name: 'clerk-react', version: '5.12.1' },
      },
      {
        userAgent: '@clerk/clerk-react@5.11.9',
        expected: { hasResilience: false, name: 'clerk-react', version: '5.11.9' },
      },
    ];

    testCases.forEach(({ userAgent, expected }) => {
      it(`should correctly detect ${expected.name}@${expected.version} resilience: ${expected.hasResilience}`, () => {
        const headers = new Map([['User-Agent', userAgent]]);
        mockContext.request = { headers } as any;

        const result = service.hasBuiltInOutageResiliency(mockContext as AuthenticateContext);

        expect(result.hasBuiltInOutageResiliency).toBe(expected.hasResilience);
        expect(result.sdkIdentifier).toBe(expected.name);
        expect(result.sdkVersion).toBe(expected.version);
      });
    });
  });

  describe('configuration options', () => {
    it('should respect custom endpoint configuration', () => {
      service = new OutageResilienceService({
        supportedEndpoints: ['/custom/endpoint'],
      });

      expect(service.isEndpointSupported('/v1/client/handshake')).toBe(false);
      expect(service.isEndpointSupported('/custom/endpoint')).toBe(true);
    });

    it('should respect retry attempt limits', () => {
      service = new OutageResilienceService({
        maxRetryAttempts: 3,
      });

      const headers = new Map([['X-Clerk-Handshake-Retry', '5']]);
      mockContext.request = { headers } as any;

      const result = service.hasBuiltInOutageResiliency(mockContext as AuthenticateContext);

      expect(result.retryAttempt).toBe(3); // Capped at maxRetryAttempts
    });
  });
});
