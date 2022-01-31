export const CLERK_BEFORE_UNLOAD_EVENT = 'clerk:beforeunload';

export function windowNavigate(to: URL | string): void {
  window.dispatchEvent(new CustomEvent(CLERK_BEFORE_UNLOAD_EVENT));
  window.location.href = typeof to === 'string' ? to : to.href;
}
