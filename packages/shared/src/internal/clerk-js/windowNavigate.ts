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

/**
 * Helper utility to navigate via window.location.href. Also dispatches a clerk:beforeunload custom event.
 *
 * Note that this utility should **never** be called with a user-provided URL. We make no specific checks against the contents of the URL here and assume it is safe. Use `Clerk.navigate()` instead for user-provided URLs.
 */
export function windowNavigate(to: URL | string): void {
  const toURL = new URL(to, window.location.href);
  window.dispatchEvent(new CustomEvent(CLERK_BEFORE_UNLOAD_EVENT));
  window.location.href = toURL.href;
}
