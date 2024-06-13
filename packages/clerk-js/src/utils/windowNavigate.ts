export const CLERK_BEFORE_UNLOAD_EVENT = 'clerk:beforeunload';

const ALLOWED_PROTOCOLS = [
  'http:',
  'https:',
  // Refers to https://wails.io/
  'wails:',
];

export function windowNavigate(to: URL | string): void {
  let toURL = new URL(to, window.location.href);

  if (!ALLOWED_PROTOCOLS.includes(toURL.protocol)) {
    console.warn(
      `Clerk: "${toURL.protocol}" is not a valid protocol. Redirecting to "/" instead. If you think this is a mistake, please open an issue.`,
    );
    toURL = new URL('/', window.location.href);
  }

  window.dispatchEvent(new CustomEvent(CLERK_BEFORE_UNLOAD_EVENT));
  window.location.href = toURL.href;
}
