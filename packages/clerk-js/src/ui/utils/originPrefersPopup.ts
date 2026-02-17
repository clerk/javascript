import { inIframe } from '@/utils';
import { THIRD_PARTY_COOKIE_DOMAINS } from '@/utils/thirdPartyDomains';

/**
 * Returns `true` if the current origin is one that is typically embedded via an iframe, which would benefit from the
 * popup flow.
 * @returns {boolean} Whether the current origin prefers the popup flow.
 */
export function originPrefersPopup(): boolean {
  return inIframe() || THIRD_PARTY_COOKIE_DOMAINS.some(domain => window.location.hostname.endsWith(domain));
}
