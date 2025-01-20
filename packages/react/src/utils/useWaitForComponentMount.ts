import { useEffect, useRef, useState } from 'react';

/**
 * Used to detect when a Clerk component has been added to the DOM.
 */
function waitForElementChildren(options: { selector?: string; root?: HTMLElement | null; timeout?: number }) {
  const { root = document?.body, selector, timeout = 0 } = options;

  return new Promise<void>((resolve, reject) => {
    if (!root) {
      reject(new Error('No root element provided'));
      return;
    }

    let elementToWatch: HTMLElement | null = root;
    if (selector) {
      elementToWatch = root?.querySelector(selector);
    }

    // Check if the element already has child nodes
    const isElementAlreadyPresent = elementToWatch?.childElementCount && elementToWatch.childElementCount > 0;
    if (isElementAlreadyPresent) {
      resolve();
      return;
    }

    // Set up a MutationObserver to detect when the element has children
    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          if (!elementToWatch && selector) {
            elementToWatch = root?.querySelector(selector);
          }

          if (elementToWatch?.childElementCount && elementToWatch.childElementCount > 0) {
            observer.disconnect();
            resolve();
            return;
          }
        }
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    // Set up an optional timeout to reject the promise if the element never gets child nodes
    if (timeout > 0) {
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for element children`));
      }, timeout);
    }
  });
}

/**
 * Detect when a Clerk component has mounted by watching DOM updates to an element with a `data-clerk-component="${component}"` property.
 */
export function useWaitForComponentMount(component?: string) {
  const watcherRef = useRef<Promise<void>>();
  const [status, setStatus] = useState<'rendering' | 'rendered' | 'error'>('rendering');

  useEffect(() => {
    if (!component) {
      throw new Error('Clerk: no component name provided, unable to detect mount.');
    }

    if (typeof window !== 'undefined' && !watcherRef.current) {
      watcherRef.current = waitForElementChildren({ selector: `[data-clerk-component="${component}"]` })
        .then(() => {
          setStatus('rendered');
        })
        .catch(() => {
          setStatus('error');
        });
    }
  }, [component]);

  return status;
}
