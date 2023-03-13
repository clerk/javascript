import type { Clerk as ClerkInterface, ClerkOptions } from '@clerk/types';

export const handleIsSatelliteBooleanOrFn = <T extends { isSatellite?: ClerkOptions['isSatellite'] }>(
  opts: T,
  url: URL,
): boolean => {
  if (typeof opts.isSatellite === 'function') {
    return opts.isSatellite(url);
  }
  return opts.isSatellite || false;
};

export const handleDomainStringOrFn = <T extends { domain?: ClerkInterface['domain'] }>(opts: T, url: URL): string => {
  if (typeof opts.domain === 'function') {
    return opts.domain(url);
  }
  return opts.domain || '';
};
