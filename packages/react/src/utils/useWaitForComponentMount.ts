import { useEffect, useRef, useState } from 'react';

/**
 * Used to detect when a Clerk component has been added to the DOM or meets a custom readiness check.
 */
function waitForElementChildren(options: {
  selector?: string;
  root?: HTMLElement | null;
  readySelector?: string;
  timeout?: number;
}) {
  const { root = document?.body, selector, readySelector, timeout = 0 } = options;

  return new Promise<void>((resolve, reject) => {
    if (!root) {
      reject(new Error('No root element provided'));
      return;
    }

    let elementToWatch: HTMLElement | null = root;
    if (selector) {
      elementToWatch = root?.querySelector(selector);
    }

    const isReady = (el: HTMLElement | null) => {
      if (readySelector) {
        if (el?.matches?.(readySelector)) {
          return true;
        }
        return !!el?.querySelector?.(readySelector);
      }
      return !!(el?.childElementCount && el.childElementCount > 0);
    };

    // Initial readiness check
    if (isReady(elementToWatch)) {
      resolve();
      return;
    }

    // Set up a MutationObserver to detect when the element has children
    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (!elementToWatch && selector) {
          elementToWatch = root?.querySelector(selector);
        }

        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          if (isReady(elementToWatch)) {
            observer.disconnect();
            resolve();
            return;
          }
        }
      }
    });

    observer.observe(root, { childList: true, attributes: true, subtree: true });

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
export function useWaitForComponentMount(
  component?: string,
  options?: { selector: string },
): 'rendering' | 'rendered' | 'error' {
  const watcherRef = useRef<Promise<void>>();
  const [status, setStatus] = useState<'rendering' | 'rendered' | 'error'>('rendering');

  useEffect(() => {
    if (!component) {
      throw new Error('Clerk: no component name provided, unable to detect mount.');
    }

    if (typeof window !== 'undefined' && !watcherRef.current) {
      const selector = `[data-clerk-component="${component}"]`;
      const readySelector = options?.selector;
      watcherRef.current = waitForElementChildren({ selector, readySelector })
        .then(() => {
          setStatus('rendered');
        })
        .catch(() => {
          setStatus('error');
        });
    }
  }, [component, options?.selector]);

  return status;
}
