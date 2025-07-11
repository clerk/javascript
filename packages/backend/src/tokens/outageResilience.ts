import type { AuthenticateContext } from './authenticateContext';

/**
 * Configuration for outage resilience behavior
 */
export interface OutageResilienceConfig {
  /** Whether outage resilience is enabled globally */
  enabled: boolean;
  /** Endpoints that support outage resilience */
  supportedEndpoints: string[];
  /** Maximum retry attempts to track */
  maxRetryAttempts: number;
}

/**
 * Default configuration for outage resilience
 */
export const DEFAULT_OUTAGE_RESILIENCE_CONFIG: OutageResilienceConfig = {
  enabled: true,
  supportedEndpoints: ['/v1/client/sync', '/v1/client/handshake'],
  maxRetryAttempts: 5,
};

/**
 * SDK capability indicators that can be used to detect outage resilience support
 */
export interface SdkCapabilityIndicators {
  /** Header indicating SDK supports outage resilience */
  outageResilientHeader?: string;
  /** SDK identifier header */
  sdkHeader?: string;
  /** SDK version header */
  sdkVersionHeader?: string;
  /** User-Agent string patterns */
  userAgent?: string;
  /** Query parameter indicating resilience */
  outageResilientParam?: string;
  /** Retry attempt header */
  retryAttemptHeader?: string;
}

/**
 * Result of SDK capability detection
 */
export interface SdkCapabilityResult {
  /** Whether the SDK supports built-in outage resilience */
  hasBuiltInOutageResiliency: boolean;
  /** SDK identifier if detected */
  sdkIdentifier?: string;
  /** SDK version if detected */
  sdkVersion?: string;
  /** Current retry attempt number */
  retryAttempt?: number;
  /** Reason for the determination */
  reason: string;
}

/**
 * Service for managing outage resilience behavior
 */
export class OutageResilienceService {
  private readonly config: OutageResilienceConfig;

  constructor(config: Partial<OutageResilienceConfig> = {}) {
    this.config = { ...DEFAULT_OUTAGE_RESILIENCE_CONFIG, ...config };
  }

  /**
   * Determines if a request has built-in outage resilience based on headers and context
   */
  public hasBuiltInOutageResiliency(authenticateContext: AuthenticateContext): SdkCapabilityResult {
    if (!this.config.enabled) {
      return {
        hasBuiltInOutageResiliency: false,
        reason: 'Outage resilience disabled globally',
      };
    }

    const indicators = this.extractSdkCapabilityIndicators(authenticateContext);

    // Check explicit outage resilience header
    if (indicators.outageResilientHeader?.toLowerCase() === 'true') {
      return {
        hasBuiltInOutageResiliency: true,
        sdkIdentifier: indicators.sdkHeader,
        sdkVersion: indicators.sdkVersionHeader,
        retryAttempt: this.parseRetryAttempt(indicators.retryAttemptHeader),
        reason: 'Explicit outage resilience header detected',
      };
    }

    // Check for known SDK patterns in User-Agent
    const sdkFromUserAgent = this.detectSdkFromUserAgent(indicators.userAgent);
    if (sdkFromUserAgent.hasBuiltInOutageResiliency) {
      return {
        ...sdkFromUserAgent,
        retryAttempt: this.parseRetryAttempt(indicators.retryAttemptHeader),
      };
    }

    // Check query parameter (fallback method)
    if (indicators.outageResilientParam?.toLowerCase() === 'true') {
      return {
        hasBuiltInOutageResiliency: true,
        reason: 'Outage resilience query parameter detected',
        retryAttempt: this.parseRetryAttempt(indicators.retryAttemptHeader),
      };
    }

    return {
      hasBuiltInOutageResiliency: false,
      reason: 'No resilience indicators found',
    };
  }

  /**
   * Checks if the current endpoint supports outage resilience
   */
  public isEndpointSupported(path: string): boolean {
    return this.config.supportedEndpoints.some(endpoint => path.includes(endpoint));
  }

  /**
   * Determines if we should serve an error page or redirect directly
   */
  public shouldServeErrorPage(
    authenticateContext: AuthenticateContext,
    endpoint: string,
  ): { shouldServeErrorPage: boolean; reason: string } {
    if (!this.isEndpointSupported(endpoint)) {
      return {
        shouldServeErrorPage: true,
        reason: 'Endpoint does not support outage resilience',
      };
    }

    const capability = this.hasBuiltInOutageResiliency(authenticateContext);

    if (capability.hasBuiltInOutageResiliency) {
      return {
        shouldServeErrorPage: false,
        reason: `SDK supports outage resilience: ${capability.reason}`,
      };
    }

    return {
      shouldServeErrorPage: true,
      reason: `SDK does not support outage resilience: ${capability.reason}`,
    };
  }

  /**
   * Creates headers for outage resilience responses
   */
  public createResilienceHeaders(capability: SdkCapabilityResult): Headers {
    const headers = new Headers();

    if (capability.hasBuiltInOutageResiliency) {
      headers.set('X-Clerk-Outage-Resiliency', 'active');

      if (capability.sdkIdentifier) {
        headers.set('X-Clerk-SDK-Detected', capability.sdkIdentifier);
      }

      if (capability.retryAttempt) {
        headers.set('X-Clerk-Retry-Attempt', capability.retryAttempt.toString());
      }
    }

    // Always add cache control for error scenarios to prevent caching of temporary failures
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return headers;
  }

  /**
   * Extracts SDK capability indicators from the request context
   */
  private extractSdkCapabilityIndicators(authenticateContext: AuthenticateContext): SdkCapabilityIndicators {
    // Access headers from the request context
    const headers = authenticateContext.request?.headers;

    return {
      outageResilientHeader: headers?.get?.('X-Clerk-Outage-Resilient') || headers?.get?.('x-clerk-outage-resilient'),
      sdkHeader: headers?.get?.('X-Clerk-SDK') || headers?.get?.('x-clerk-sdk'),
      sdkVersionHeader: headers?.get?.('X-Clerk-SDK-Version') || headers?.get?.('x-clerk-sdk-version'),
      userAgent: headers?.get?.('User-Agent') || headers?.get?.('user-agent'),
      retryAttemptHeader: headers?.get?.('X-Clerk-Handshake-Retry') || headers?.get?.('x-clerk-handshake-retry'),
      outageResilientParam: authenticateContext.getQueryParam?.('outage_resilient'),
    };
  }

  /**
   * Detects SDK type and capabilities from User-Agent string
   */
  private detectSdkFromUserAgent(userAgent?: string): Omit<SdkCapabilityResult, 'retryAttempt'> {
    if (!userAgent) {
      return {
        hasBuiltInOutageResiliency: false,
        reason: 'No User-Agent header found',
      };
    }

    // Pattern matching for known SDKs with outage resilience support
    const sdkPatterns = [
      {
        pattern: /@clerk\/clerk-js@(\d+\.\d+\.\d+)/,
        name: 'clerk-js',
        hasOutageResiliency: (version: string) => this.isVersionAtLeast(version, '5.72.0'),
      },
      {
        pattern: /@clerk\/nextjs@(\d+\.\d+\.\d+)/,
        name: 'nextjs',
        hasOutageResiliency: (version: string) => this.isVersionAtLeast(version, '5.8.0'),
      },
      {
        pattern: /@clerk\/clerk-react@(\d+\.\d+\.\d+)/,
        name: 'clerk-react',
        hasOutageResiliency: (version: string) => this.isVersionAtLeast(version, '5.12.0'),
      },
      // Add more SDK patterns as they implement outage resilience
    ];

    for (const { pattern, name, hasOutageResiliency } of sdkPatterns) {
      const match = userAgent.match(pattern);
      if (match) {
        const version = match[1];
        const hasResilience = hasOutageResiliency(version);

        return {
          hasBuiltInOutageResiliency: hasResilience,
          sdkIdentifier: name,
          sdkVersion: version,
          reason: hasResilience
            ? `SDK ${name}@${version} supports outage resilience`
            : `SDK ${name}@${version} does not support outage resilience`,
        };
      }
    }

    return {
      hasBuiltInOutageResiliency: false,
      reason: 'No known resilient SDK detected in User-Agent',
    };
  }

  /**
   * Parses retry attempt number from header
   */
  private parseRetryAttempt(retryHeader?: string): number | undefined {
    if (!retryHeader) return undefined;

    const attempt = parseInt(retryHeader, 10);
    return isNaN(attempt) ? undefined : Math.min(attempt, this.config.maxRetryAttempts);
  }

  /**
   * Compares version strings to determine if a version meets minimum requirements
   */
  private isVersionAtLeast(version: string, minVersion: string): boolean {
    const parseVersion = (v: string) => v.split('.').map(n => parseInt(n, 10));

    const versionParts = parseVersion(version);
    const minVersionParts = parseVersion(minVersion);

    for (let i = 0; i < Math.max(versionParts.length, minVersionParts.length); i++) {
      const vPart = versionParts[i] || 0;
      const minPart = minVersionParts[i] || 0;

      if (vPart > minPart) return true;
      if (vPart < minPart) return false;
    }

    return true; // Equal versions
  }
}
