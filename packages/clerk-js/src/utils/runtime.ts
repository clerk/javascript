export function inBrowser() {
  return typeof globalThis.document !== 'undefined';
}

export function inActiveBrowserTab() {
  return inBrowser() && globalThis.document.hasFocus();
}

export function inIframe() {
  if (!inBrowser()) {
    return false;
  }

  try {
    // checks if the current window is an iframe
    return window.self !== window.top;
  } catch {
    // Cross-origin access denied - we're definitely in an iframe
    return true;
  }
}

export function inCrossOriginIframe() {
  if (!inIframe()) {
    return false;
  }

  try {
    // Try to access top window's location to check if any ancestor is cross-origin
    // This will throw a SecurityError if any iframe in the chain is cross-origin
    // Handles nested iframes where immediate parent might be same-origin
    // but a higher-level ancestor is cross-origin
    void window.top?.location.href;
    return false;
  } catch {
    // SecurityError thrown - we're in a cross-origin iframe (at any level)
    return true;
  }
}
