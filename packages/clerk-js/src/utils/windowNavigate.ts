export const CLERK_BEFORE_UNLOAD_EVENT = 'clerk:beforeunload';

export function windowNavigate(to: URL | string): void {
  let toURL = new URL(to, window.location.href);

  if (toURL.protocol !== 'http:' && toURL.protocol !== 'https:') {
    console.warn('Clerk: Not a valid protocol. Redirecting to /');
    toURL = new URL('/', window.location.href);
  }

  window.dispatchEvent(new CustomEvent(CLERK_BEFORE_UNLOAD_EVENT));
  window.location.href = toURL.href;
}
