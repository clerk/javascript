/**
 * Type representing valid CSP directives
 */
export type CSPDirective =
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
 * Type representing the CSP mode
 */
export type CSPMode = 'standard' | 'strict-dynamic';

/**
 * Type representing CSP values as a record of directives to string arrays
 */
type CSPValues = Partial<Record<CSPDirective, string[]>>;

/**
 * Type representing CSP directives as a record of directives to Sets of strings
 */
type CSPDirectiveSet = Record<CSPDirective, Set<string>>;

/**
 * Interface representing the result of creating a CSP header
 */
export interface CSPHeaderResult {
  /** The formatted CSP header string */
  header: string;
  /** The generated nonce, if applicable */
  nonce?: string;
}

/**
 * Class responsible for managing CSP directives and their values
 */
class CSPDirectiveManager {
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
  static readonly DEFAULT_DIRECTIVES: CSPValues = {
    'connect-src': ['self'],
    'default-src': ['self'],
    'form-action': ['self'],
    'frame-src': ['self', 'https://challenges.cloudflare.com'],
    'img-src': ['self', 'https://img.clerk.com'],
    'script-src': [
      'self',
      ...(process.env.NODE_ENV !== 'production' ? ['unsafe-eval'] : []),
      'unsafe-inline',
      'https:',
      'http:',
    ],
    'style-src': ['self', 'unsafe-inline'],
    'worker-src': ['self', 'blob:'],
  };

  /**
   * Creates a new CSPDirectiveSet with default values
   * @returns A new CSPDirectiveSet with default values
   */
  static createDefaultDirectives(): CSPDirectiveSet {
    return Object.entries(this.DEFAULT_DIRECTIVES).reduce((acc, [key, values]) => {
      acc[key as CSPDirective] = new Set(values);
      return acc;
    }, {} as CSPDirectiveSet);
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
function handleExistingDirective(mergedCSP: CSPDirectiveSet, key: CSPDirective, values: string[]) {
  // Special case for 'none' value - it should replace all other values
  if (values.includes("'none'") || values.includes('none')) {
    mergedCSP[key] = new Set(["'none'"]);
    return;
  }

  // For existing directives, merge the values rather than replacing
  // Use a Set to deduplicate values
  const deduplicatedSet = new Set<string>();

  // First add existing values after formatting them
  mergedCSP[key].forEach(value => {
    deduplicatedSet.add(CSPDirectiveManager.formatValue(value));
  });

  // Then add new values after formatting them
  values.forEach(value => {
    deduplicatedSet.add(CSPDirectiveManager.formatValue(value));
  });

  // If this is script-src in production, make sure we don't add unsafe-eval
  if (key === 'script-src' && process.env.NODE_ENV === 'production') {
    deduplicatedSet.delete("'unsafe-eval'");
  }

  mergedCSP[key] = deduplicatedSet;
}

/**
 * Handles custom directives that are not part of the default set
 * @param customDirectives - Map of custom directives
 * @param key - The directive key
 * @param values - Values for the directive
 */
function handleCustomDirective(customDirectives: Map<string, Set<string>>, key: string, values: string[]) {
  // Special case for 'none' value - it should replace all other values
  if (values.includes("'none'") || values.includes('none')) {
    customDirectives.set(key, new Set(["'none'"]));
    return;
  }

  // For all other cases, create a new set with formatted values
  const formattedValues = new Set<string>();
  values.forEach(value => {
    const formattedValue = CSPDirectiveManager.formatValue(value);
    formattedValues.add(formattedValue);
  });

  customDirectives.set(key, formattedValues);
}

/**
 * Formats the CSP header string with proper ordering and formatting
 * @param mergedCSP - The merged CSP state to format
 * @returns Formatted CSP header string
 */
function formatCSPHeader(mergedCSP: Record<string, Set<string>>): string {
  const orderMap: Record<string, number> = {
    "'none'": 1,
    "'self'": 2,
    "'strict-dynamic'": 3,
    "'unsafe-eval'": 4,
    "'unsafe-inline'": 5,
    'http:': 6,
    'https:': 7,
  };

  // Sort directives to ensure consistent order
  const orderedEntries = Object.entries(mergedCSP).sort(([a], [b]) => a.localeCompare(b));

  return orderedEntries
    .map(([key, values]) => {
      // Sort values according to specific order
      const sortedValues = Array.from(values).sort((a, b) => {
        const formattedA = CSPDirectiveManager.formatValue(a);
        const formattedB = CSPDirectiveManager.formatValue(b);

        // If both values are in orderMap, sort by their order
        if (orderMap[formattedA] && orderMap[formattedB]) {
          return orderMap[formattedA] - orderMap[formattedB];
        }

        // If only one value is in orderMap, it should come first
        if (orderMap[formattedA]) return -1;
        if (orderMap[formattedB]) return 1;

        // Otherwise, sort alphabetically
        return formattedA.localeCompare(formattedB);
      });

      return `${key} ${sortedValues.map(v => CSPDirectiveManager.formatValue(v)).join(' ')}`;
    })
    .join('; ');
}

/**
 * Parses a host string to extract the clerk subdomain
 * @param input - The host string to parse
 * @returns The formatted clerk subdomain
 */
function parseHost(input: string): string {
  let hostname = input;
  try {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      hostname = new URL(input).hostname;
    }
  } catch {
    hostname = input;
  }
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    hostname = 'clerk.' + parts.slice(-2).join('.');
  }
  return hostname;
}

/**
 * Generates a secure random nonce for CSP headers
 * @returns A base64-encoded random nonce
 */
export function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Creates a merged CSP state with all necessary directives
 * @param mode - The CSP mode to use
 * @param host - The host to include in CSP
 * @param customDirectives - Optional custom directives to merge with
 * @param nonce - Optional nonce for strict-dynamic mode
 * @returns Merged CSPDirectiveSet
 */
function createMergedCSP(
  mode: CSPMode,
  host: string,
  customDirectives?: Record<string, string[]>,
  nonce?: string,
): Record<string, Set<string>> {
  // Initialize with default Clerk CSP values
  const mergedCSP = CSPDirectiveManager.createDefaultDirectives();

  // Add Clerk-specific values
  const parsedHost = parseHost(host);
  mergedCSP['connect-src'].add('*.clerk.accounts.dev').add(parsedHost);

  // Handle strict-dynamic mode specific changes
  if (mode === 'strict-dynamic') {
    mergedCSP['script-src'].delete('http:');
    mergedCSP['script-src'].delete('https:');
    mergedCSP['script-src'].add("'strict-dynamic'");
    if (nonce) {
      mergedCSP['script-src'].add(`'nonce-${nonce}'`);
    }
  }

  // Create a separate map for custom directives
  const customDirectivesMap = new Map<string, Set<string>>();

  // Add custom directives if provided
  if (customDirectives) {
    Object.entries(customDirectives).forEach(([key, values]) => {
      const valuesArray = Array.isArray(values) ? values : [values];
      if (CSPDirectiveManager.DEFAULT_DIRECTIVES[key as CSPDirective]) {
        handleExistingDirective(mergedCSP, key as CSPDirective, valuesArray);
      } else {
        handleCustomDirective(customDirectivesMap, key, valuesArray);
      }
    });
  }

  // Combine standard directives with custom directives
  const finalCSP: Record<string, Set<string>> = { ...mergedCSP };

  // Add custom directives to the final result
  customDirectivesMap.forEach((values, key) => {
    finalCSP[key] = values;
  });

  return finalCSP;
}

/**
 * Creates a Content Security Policy (CSP) header with the specified mode and host
 * @param mode - The CSP mode to use ('standard' or 'strict-dynamic')
 * @param host - The host to include in the CSP
 * @param customDirectives - Optional custom directives to merge with
 * @returns Object containing the formatted CSP header and nonce (if in strict-dynamic mode)
 */
export function createCSPHeader(
  mode: CSPMode,
  host: string,
  customDirectives?: Record<string, string[]>,
): CSPHeaderResult {
  const nonce = mode === 'strict-dynamic' ? generateNonce() : undefined;

  return {
    header: formatCSPHeader(createMergedCSP(mode, host, customDirectives, nonce)),
    nonce,
  };
}
