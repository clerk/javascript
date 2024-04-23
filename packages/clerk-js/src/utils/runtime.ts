export function inBrowser() {
  return typeof globalThis.document !== 'undefined';
}

export function inActiveBrowserTab() {
  return inBrowser() && globalThis.document.hasFocus();
}

export function usesHttps() {
  return inBrowser() && window.location.protocol === 'https:';
}

export function inIframe() {
  // checks if the current window is an iframe
  // excludes the case where the current window runs in a Cypress test
  return inBrowser() && window.self !== window.top && !window.Cypress;
}

export function inCrossOriginIframe() {
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/frameElement
  // frameElement: if the document into which it's embedded has a different origin, the value is null instead.
  return inIframe() && !window.frameElement;
}

export function inSecureCrossOriginIframe() {
  return inCrossOriginIframe() && usesHttps();
}
