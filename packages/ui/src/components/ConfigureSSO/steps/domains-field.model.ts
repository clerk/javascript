/**
 * Matches a bare domain such as `example.com` or `sub.example.co.uk`.
 * Each label must start and end with an alphanumeric character and a valid
 * TLD of at least two letters is required. Protocols, paths, ports, spaces
 * and single-label hostnames are rejected.
 */
const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
export const isValidDomain = (value: string): boolean => DOMAIN_REGEX.test(value);
