/** Best-effort iOS detection, including iPadOS. Returns `false` outside a browser. */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return (
    /iP(hone|ad|od)/.test(navigator.platform) ||
    // iPadOS 13+ reports as a Mac, so additionally check for touch support.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}
