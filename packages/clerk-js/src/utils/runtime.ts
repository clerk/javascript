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
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/frameElement
  // frameElement: if the document into which it's embedded has a different origin, the value is null instead.
  return inIframe() && !window.frameElement;
}
