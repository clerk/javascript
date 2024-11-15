/**
 * Uses a MutationObserver to wait for an element to be added to the DOM.
 */
export function waitForElement(selector: string): Promise<HTMLElement | null> {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector) as HTMLElement);
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector) as HTMLElement);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
}
