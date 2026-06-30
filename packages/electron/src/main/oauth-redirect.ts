import type { OAuthRedirectStrategy } from '../shared/types';

/** Options for {@link httpRedirectStrategy}. `successUrl` and `successHtml` are mutually exclusive. */
export type HttpRedirectStrategyOptions =
  | { port?: number; successUrl?: string }
  | { port?: number; successHtml?: string };

/**
 * Builds an `http` (loopback) OAuth redirect strategy. The callback is received on
 * `http://127.0.0.1:<port>/sso-callback` (default port `45789`). Pass an absolute `http(s)`
 * `successUrl` to redirect the browser to your own page after the callback, or `successHtml` to
 * serve custom markup instead of the built-in completion page.
 *
 * @example
 * createClerkBridge({ storage: storage(), oauth: { redirect: httpRedirectStrategy({ port: 45789 }) } });
 */
export const httpRedirectStrategy = (options: HttpRedirectStrategyOptions = {}): OAuthRedirectStrategy => ({
  type: 'http',
  ...options,
});

/**
 * Builds a `deep-link` OAuth redirect strategy that receives the callback through the renderer's
 * custom URI scheme (`scheme://host/`). Requires `renderer` and OS-level protocol registration.
 *
 * @example
 * createClerkBridge({ storage: storage(), renderer, oauth: { redirect: deepLinkRedirectStrategy() } });
 */
export const deepLinkRedirectStrategy = (): OAuthRedirectStrategy => ({ type: 'deep-link' });
