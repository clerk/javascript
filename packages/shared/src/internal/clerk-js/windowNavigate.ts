export const CLERK_BEFORE_UNLOAD_EVENT = 'clerk:beforeunload';

/**
 * Additional protocols can be provided using the `allowedRedirectProtocols` Clerk option.
 */
export const ALLOWED_PROTOCOLS = [
  'http:',
  'https:',
  // Refers to https://wails.io/
  'wails:',
  'chrome-extension:',
];

export type WindowNavigateOptions = {
  /**
   * Protocol allowlist applied to the resolved URL. Defaults to `ALLOWED_PROTOCOLS`. Pass an
   * extended list (e.g. `Clerk`'s `#allowedRedirectProtocols`) to honor the customer-supplied
   * `allowedRedirectProtocols` option.
   */
  allowedProtocols?: ReadonlyArray<string>;
};

const SCHEME_RELATIVE_PREFIX = /^[/\\][/\\]/;

/**
 * Normalizes a string the same way the WHATWG URL parser does before it parses: strip leading C0
 * control and space characters, then remove ASCII tab/LF/CR from anywhere. Without this, inputs
 * like `/\t/evil.com` or `\x00//evil.com` slip past the scheme-relative check yet still resolve
 * scheme-relative (inheriting the base's allowlisted scheme) and redirect cross-origin.
 */
function stripUrlParserIgnoredChars(to: string): string {
  let start = 0;
  while (start < to.length && to.charCodeAt(start) <= 0x20) {
    start++;
  }
  let result = '';
  for (let i = start; i < to.length; i++) {
    const code = to.charCodeAt(i);
    if (code !== 0x09 && code !== 0x0a && code !== 0x0d) {
      result += to[i];
    }
  }
  return result;
}

/**
 * Helper utility to navigate via window.location.href. Also dispatches a clerk:beforeunload custom event.
 *
 * Navigations whose protocol is not in the allowlist (e.g. `javascript:`, `data:`) are aborted.
 * Scheme-relative inputs (`//host`, `\\host`) are also rejected: they adopt the base URL's scheme,
 * which is always in the allowlist, so they would otherwise pass the protocol check while
 * redirecting cross-origin.
 *
 * Callers that have already validated against an extended allowlist should pass it via
 * `options.allowedProtocols` so legitimate custom protocols (Wails, Tauri, etc.) are honored.
 *
 * @deprecated Use `clerk.__internal_windowNavigate` instead. It honors the customer-supplied
 * `allowedRedirectProtocols` option by default, so internal call sites can't accidentally
 * bypass it by forgetting to pass `options.allowedProtocols`. The bare export will be removed
 * in the next major version.
 */
export function windowNavigate(to: URL | string, options?: WindowNavigateOptions): void {
  if (typeof to === 'string' && SCHEME_RELATIVE_PREFIX.test(stripUrlParserIgnoredChars(to))) {
    console.warn(
      `Clerk: scheme-relative navigation to "${to}" is not allowed. Provide a same-origin path or an absolute URL.`,
    );
    return;
  }
  const toURL = new URL(to, window.location.href);
  const allowedProtocols = options?.allowedProtocols ?? ALLOWED_PROTOCOLS;
  if (!allowedProtocols.includes(toURL.protocol)) {
    console.warn(
      `Clerk: "${toURL.protocol}" is not a valid navigation protocol. Aborting navigation. If you think this is a mistake, please open an issue.`,
    );
    return;
  }
  window.dispatchEvent(new CustomEvent(CLERK_BEFORE_UNLOAD_EVENT));
  window.location.href = toURL.href;
}
