export function inBrowser() {
  return typeof globalThis.document !== 'undefined';
}

export function inActiveBrowserTab() {
  return inBrowser() && globalThis.document.hasFocus();
}
