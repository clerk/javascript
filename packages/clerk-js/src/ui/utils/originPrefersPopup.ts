const POPUP_PREFERRED_ORIGINS = ['.lovable.app', '.lovableproject.com', '.webcontainer-api.io', '.vusercontent.net'];

/**
 * Returns `true` if the current origin is one that is typically embedded via an iframe, which would benefit from the
 * popup flow.
 * @returns {boolean} Whether the current origin prefers the popup flow.
 */
export function originPrefersPopup(): boolean {
  return POPUP_PREFERRED_ORIGINS.some(origin => window.location.origin.endsWith(origin));
}
