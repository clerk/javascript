import type { SSOBypassEntry, SSOBypassSkipReason } from './sso-bypass.types';

export const DOMAIN_NOT_SERVED = 'sso_bypass_domain_not_served';
export const NOT_A_MEMBER = 'resource_not_found';

export function matchesSearch(entry: SSOBypassEntry, term: string): boolean {
  const haystack = [entry.name, entry.identifier, entry.username].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(term);
}

export function filterEntries(entries: readonly SSOBypassEntry[], search: string): SSOBypassEntry[] {
  const term = search.trim().toLowerCase();
  return term ? entries.filter(entry => matchesSearch(entry, term)) : [...entries];
}

export function skipReason(codes: readonly string[]): SSOBypassSkipReason {
  const shared = codes.length > 0 && codes.every(code => code === codes[0]) ? codes[0] : null;
  if (shared === DOMAIN_NOT_SERVED) {
    return 'domainNotServed';
  }
  if (shared === NOT_A_MEMBER) {
    return 'notMember';
  }
  return 'unknown';
}
