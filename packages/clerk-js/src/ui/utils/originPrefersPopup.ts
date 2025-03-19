const POPUP_PREFERRED_ORIGINS = ['.lovable.app', '.lovableproject.com', '.webcontainer-api.io'];
export function originPrefersPopup(): boolean {
  return POPUP_PREFERRED_ORIGINS.some(origin => window.location.origin.endsWith(origin));
}
