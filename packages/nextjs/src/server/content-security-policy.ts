import { constants } from '@clerk/backend/internal';

/**
 * Valid CSP directives according to the CSP Level 3 specification
 */
export type ContentSecurityPolicyDirective =
  // Default resource directives
  | 'connect-src'
  | 'default-src'
  | 'font-src'
  | 'img-src'
  | 'media-src'
  | 'object-src'
  | 'script-src'
  | 'style-src'
  // Framing and navigation directives
  | 'base-uri'
  | 'child-src'
  | 'form-action'
  | 'frame-ancestors'
  | 'frame-src'
  | 'manifest-src'
  | 'navigate-to'
  | 'prefetch-src'
  | 'worker-src'
  // Sandbox and plugin directives
  | 'plugin-types'
  | 'require-sri-for'
  | 'sandbox'
  // Trusted types and upgrade directives
  | 'block-all-mixed-content'
  | 'require-trusted-types-for'
  | 'trusted-types'
  | 'upgrade-insecure-requests'
  // Reporting directives
  | 'report-to'
  | 'report-uri'
  // CSP Level 3 additional directives
  | 'script-src-attr'
  | 'script-src-elem'
  | 'style-src-attr'
  | 'style-src-elem';

/**
 * Partial record of directives and their values
 */
type ContentSecurityPolicyValues = Partial<Record<ContentSecurityPolicyDirective, string[]>>;

/**
 * Directives and their values
 */
type ContentSecurityPolicyDirectiveSet = Record<ContentSecurityPolicyDirective, Set<string>>;

export interface ContentSecurityPolicyHeaders {
  /**
   * Array of formatted headers to be added to the response.
   *
   * Includes both standard and report-only headers when applicable.
   * Includes nonce when strict mode is enabled.
   */
  headers: [string, string][];
}

export interface ContentSecurityPolicyOptions {
  /**
   * When set to true, enhances security by applying the `strict-dynamic` attribute to the `script-src` CSP directive
   */
  strict?: boolean;
  /**
   * Custom CSP directives to merge with Clerk's default directives
   */
  directives?: Partial<Record<ContentSecurityPolicyDirective, string[]>>;
  /**
   * When set to true, the Content-Security-Policy-Report-Only header will be used instead of
   * Content-Security-Policy. This allows monitoring policy violations without blocking content.
   */
  reportOnly?: boolean;
  /**
   * Specifies a reporting endpoint for CSP violations. This value will be used in the
   * 'report-to' directive of the Content-Security-Policy header.
   */
  reportTo?: string;
}

class ContentSecurityPolicyDirectiveManager {
  /** Set of special keywords that require quoting in CSP directives */
  private static readonly KEYWORDS = new Set([
    'none',
    'self',
    'strict-dynamic',
    'unsafe-eval',
    'unsafe-hashes',
    'unsafe-inline',
  ]);

  /** Default CSP directives and their values */
  static readonly DEFAULT_DIRECTIVES: ContentSecurityPolicyValues = {
    'connect-src': [
      'self',
      'https://clerk-telemetry.com',
      'https://*.clerk-telemetry.com',
      'https://api.stripe.com',
      'https://maps.googleapis.com',
      'https://img.clerk.com',
      'https://images.clerkstage.dev',
    ],
    'default-src': ['self'],
    'form-action': ['self'],
    'frame-src': [
      'self',
      'https://challenges.cloudflare.com',
      'https://*.js.stripe.com',
      'https://js.stripe.com',
      'https://hooks.stripe.com',
    ],
    'img-src': ['self', 'https://img.clerk.com'],
    'script-src': [
      'self',
      ...(process.env.NODE_ENV !== 'production' ? ['unsafe-eval'] : []),
      'unsafe-inline',
      'https:',
      'http:',
      'https://*.js.stripe.com',
      'https://js.stripe.com',
      'https://maps.googleapis.com',
    ],
    'style-src': ['self', 'unsafe-inline'],
    'worker-src': ['self', 'blob:'],
  };

  /**
   * Creates a new ContentSecurityPolicyDirectiveSet with default values
   * @returns A new ContentSecurityPolicyDirectiveSet with default values
   */
  static createDefaultDirectives(): ContentSecurityPolicyDirectiveSet {
    return Object.entries(this.DEFAULT_DIRECTIVES).reduce((acc, [key, values]) => {
      acc[key as ContentSecurityPolicyDirective] = new Set(values);
      return acc;
    }, {} as ContentSecurityPolicyDirectiveSet);
  }

  /**
   * Checks if a value is a special keyword that requires quoting
   * @param value - The value to check
   * @returns True if the value is a special keyword
   */
  static isKeyword(value: string): boolean {
    return this.KEYWORDS.has(value.replace(/^'|'$/g, ''));
  }

  /**
   * Formats a value according to CSP rules, adding quotes for special keywords
   * @param value - The value to format
   * @returns The formatted value
   */
  static formatValue(value: string): string {
    const unquoted = value.replace(/^'|'$/g, '');
    return this.isKeyword(unquoted) ? `'${unquoted}'` : value;
  }

  /**
   * Handles directive values, ensuring proper formatting and special case handling
   * @param values - Array of values to process
   * @returns Set of formatted values
   */
  static handleDirectiveValues(values: string[]): Set<string> {
    const result = new Set<string>();

    if (values.includes("'none'") || values.includes('none')) {
      result.add("'none'");
      return result;
    }

    values.forEach(v => result.add(this.formatValue(v)));
    return result;
  }
}

/**
 * Handles merging of existing directives with new values
 * @param mergedCSP - The current merged CSP state
 * @param key - The directive key to handle
 * @param values - New values to merge
 */
function handleExistingDirective(
  mergedCSP: ContentSecurityPolicyDirectiveSet,
  key: ContentSecurityPolicyDirective,
  values: string[],
) {
  // None overrides all other values
  if (values.includes("'none'") || values.includes('none')) {
    mergedCSP[key] = new Set(["'none'"]);
    return;
  }

  // For existing directives, merge the values rather than replacing
  const deduplicatedSet = new Set<string>();

  mergedCSP[key].forEach(value => {
    deduplicatedSet.add(ContentSecurityPolicyDirectiveManager.formatValue(value));
  });

  values.forEach(value => {
    deduplicatedSet.add(ContentSecurityPolicyDirectiveManager.formatValue(value));
  });

  mergedCSP[key] = deduplicatedSet;
}

/**
 * Handles custom directives that are not part of the default set
 * @param customDirectives - Map of custom directives
 * @param key - The directive key
 * @param values - Values for the directive
 */
function handleCustomDirective(customDirectives: Map<string, Set<string>>, key: string, values: string[]) {
  // None overrides all other values
  if (values.includes("'none'") || values.includes('none')) {
    customDirectives.set(key, new Set(["'none'"]));
    return;
  }

  const formattedValues = new Set<string>();
  values.forEach(value => {
    const formattedValue = ContentSecurityPolicyDirectiveManager.formatValue(value);
    formattedValues.add(formattedValue);
  });

  customDirectives.set(key, formattedValues);
}

/**
 * Applies formatting to the CSP header
 * @param mergedCSP - The merged CSP state to format
 * @returns Formatted CSP header string
 */
function formatCSPHeader(mergedCSP: Record<string, Set<string>>): string {
  return Object.entries(mergedCSP)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, values]) => {
      const valueObjs = Array.from(values).map(v => ({
        raw: v,
        formatted: ContentSecurityPolicyDirectiveManager.formatValue(v),
      }));

      return `${key} ${valueObjs.map(item => item.formatted).join(' ')}`;
    })
    .join('; ');
}

/**
 * Generates a secure random nonce for CSP headers
 * @returns A base64-encoded random nonce
 */
export function generateNonce(): string {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const binaryString = Array.from(randomBytes, byte => String.fromCharCode(byte)).join('');
  return btoa(binaryString);
}

/**
 * Builds a complete set of CSP directives by combining defaults with custom directives,
 * applying special configurations like strict mode and nonce, and formatting them into a valid CSP string.
 */
function buildContentSecurityPolicyDirectives(
  strict: boolean,
  host: string,
  customDirectives?: Partial<Record<ContentSecurityPolicyDirective, string[]>>,
  nonce?: string,
): string {
  const directives = Object.entries(ContentSecurityPolicyDirectiveManager.DEFAULT_DIRECTIVES).reduce(
    (acc, [key, values]) => {
      acc[key as ContentSecurityPolicyDirective] = new Set(values);
      return acc;
    },
    {} as ContentSecurityPolicyDirectiveSet,
  );

  directives['connect-src'].add(host);

  if (strict) {
    directives['script-src'].delete('http:');
    directives['script-src'].delete('https:');
    directives['script-src'].add("'strict-dynamic'");
    if (nonce) {
      directives['script-src'].add(`'nonce-${nonce}'`);
    }
  }

  if (customDirectives) {
    const customDirectivesMap = new Map<string, Set<string>>();
    Object.entries(customDirectives).forEach(([key, values]) => {
      const valuesArray = Array.isArray(values) ? values : [values];
      if (ContentSecurityPolicyDirectiveManager.DEFAULT_DIRECTIVES[key as ContentSecurityPolicyDirective]) {
        handleExistingDirective(directives, key as ContentSecurityPolicyDirective, valuesArray);
      } else {
        handleCustomDirective(customDirectivesMap, key, valuesArray);
      }
    });

    // Merge all custom directives into the final directives object
    customDirectivesMap.forEach((values, key) => {
      directives[key as ContentSecurityPolicyDirective] = values;
    });
  }

  return formatCSPHeader(directives);
}

/**
 * Creates Content Security Policy (CSP) headers with the specified configuration
 * @returns Object containing the formatted CSP headers
 */
export function createContentSecurityPolicyHeaders(
  host: string,
  options: ContentSecurityPolicyOptions,
): ContentSecurityPolicyHeaders {
  const headers: [string, string][] = [];

  const nonce = options.strict ? generateNonce() : undefined;

  let cspHeader = buildContentSecurityPolicyDirectives(options.strict ?? false, host, options.directives, nonce);

  if (options.reportTo) {
    cspHeader += '; report-to csp-endpoint';
    headers.push([constants.Headers.ReportingEndpoints, `csp-endpoint="${options.reportTo}"`]);
  }

  if (options.reportOnly) {
    headers.push([constants.Headers.ContentSecurityPolicyReportOnly, cspHeader]);
  } else {
    headers.push([constants.Headers.ContentSecurityPolicy, cspHeader]);
  }

  if (nonce) {
    headers.push([constants.Headers.Nonce, nonce]);
  }

  return {
    headers,
  };
}
