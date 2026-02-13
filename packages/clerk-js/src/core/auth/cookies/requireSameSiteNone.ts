/**
 * Certain hosting origins (e.g. .replit.dev) require cookies to be set with
 * SameSite=None to work correctly, even outside of cross-origin iframe contexts.
 */
export const requiresSameSiteNone = (): boolean => {
  try {
    return window.location.hostname.endsWith('.replit.dev');
  } catch {
    return false;
  }
};
