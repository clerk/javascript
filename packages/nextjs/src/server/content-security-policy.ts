import { randomBytes } from 'crypto';

/**
 * Type representing valid CSP directives
 */
export type CSPDirective =
  | 'connect-src'
  | 'default-src'
  | 'form-action'
  | 'frame-src'
  | 'img-src'
  | 'script-src'
  | 'style-src'
  | 'worker-src';

/**
 * Type representing the CSP mode
 */
export type CSPMode = 'standard' | 'strict-dynamic';

/**
 * Type representing CSP values as a record of directives to string arrays
 */
type CSPValues = Record<CSPDirective, string[]>;

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
    "'unsafe-eval'": 3,
    "'unsafe-inline'": 4,
    'http:': 5,
    'https:': 6,
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
 * Parses a CSP header string into an array of directives
 * @param cspHeader - The CSP header string to parse
 * @returns Array of directive strings
 */
function parseCSPHeader(cspHeader: string): string[] {
  return cspHeader
    .split(';')
    .map(directive => directive.trim())
    .filter(Boolean);
}

/**
 * Generates a secure random nonce for CSP headers
 * @returns A base64-encoded random nonce
 */
export function generateNonce(): string {
  return randomBytes(16).toString('base64');
}

/**
 * Merges custom CSP directives with existing ones
 * @param mergedCSP - The current merged CSP state
 * @param customCSP - The custom CSP header to merge
 * @returns Updated CSPDirectiveSet
 */
function mergeCustomCSP(mergedCSP: CSPDirectiveSet, customCSP: string): CSPDirectiveSet {
  const directives = parseCSPHeader(customCSP);
  const customDirectives = new Map<string, Set<string>>();

  directives.forEach(directive => {
    const [key, ...values] = directive.split(' ');
    if (!key || values.length === 0) return;

    if (key in CSPDirectiveManager.DEFAULT_DIRECTIVES) {
      handleExistingDirective(mergedCSP, key as CSPDirective, values);
    } else {
      handleCustomDirective(customDirectives, key, values);
    }
  });

  // Add custom directives to the merged CSP object
  addCustomDirectivesToMergedCSP(mergedCSP, customDirectives);

  return mergedCSP;
}

/**
 * Adds custom directives to the merged CSP state
 * @param mergedCSP - The current merged CSP state
 * @param customDirectives - Map of custom directives to add
 */
function addCustomDirectivesToMergedCSP(mergedCSP: CSPDirectiveSet, customDirectives: Map<string, Set<string>>) {
  for (const [directive, values] of customDirectives.entries()) {
    // Ensure we don't override existing values if they exist
    if (directive in mergedCSP) {
      const existingValues = mergedCSP[directive as CSPDirective];
      const newSet = new Set<string>();
      // First add existing values
      existingValues.forEach(value => newSet.add(value));
      // Then add new values, which will automatically deduplicate
      values.forEach(value => newSet.add(value));
      (mergedCSP as Record<string, Set<string>>)[directive] = newSet;
    } else {
      (mergedCSP as Record<string, Set<string>>)[directive] = values;
    }
  }
}

/**
 * Creates a merged CSP state with all necessary directives
 * @param host - The host to include in CSP
 * @param existingCSP - Optional existing CSP header to merge
 * @param nonce - Optional nonce for strict-dynamic mode
 * @param mode - The CSP mode to use
 * @returns Merged CSPDirectiveSet
 */
function createMergedCSP(
  host: string,
  existingCSP?: string | null,
  nonce?: string,
  mode: CSPMode = 'standard',
): CSPDirectiveSet {
  // Initialize with default Clerk CSP values
  const mergedCSP = CSPDirectiveManager.createDefaultDirectives();

  // First, merge any existing CSP if provided
  if (existingCSP) {
    mergeCustomCSP(mergedCSP, existingCSP);
  }

  // Then add Clerk-specific values
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

  return mergedCSP;
}

/**
 * Creates a Content Security Policy (CSP) header with the specified mode and host
 * @param mode - The CSP mode to use ('standard' or 'strict-dynamic')
 * @param host - The host to include in the CSP
 * @param existingCSP - Optional existing CSP header to merge with
 * @returns Object containing the formatted CSP header and nonce (if in strict-dynamic mode)
 */
export function createCSPHeader(mode: CSPMode, host: string, existingCSP?: string | null): CSPHeaderResult {
  const nonce = mode === 'strict-dynamic' ? generateNonce() : undefined;
  const mergedCSP = createMergedCSP(host, existingCSP, nonce, mode);

  return {
    header: formatCSPHeader(mergedCSP),
    nonce,
  };
}
