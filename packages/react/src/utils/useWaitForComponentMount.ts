import { useEffect, useRef, useState } from 'react';

const createAwaitableMutationObserver = (
  globalOptions: MutationObserverInit & {
    isReady: (el: HTMLElement | null, selector: string) => boolean;
  },
) => {
  const isReady = globalOptions?.isReady;

  return (options: { selector: string; root?: HTMLElement | null; timeout?: number }) =>
    new Promise<void>((resolve, reject) => {
      const { root = document?.body, selector, timeout = 0 } = options;

      if (!root) {
        reject(new Error('No root element provided'));
        return;
      }

      let elementToWatch: HTMLElement | null = root;
      if (selector) {
        elementToWatch = root?.querySelector(selector);
      }

      // Initial readiness check
      if (isReady(elementToWatch, selector)) {
        resolve();
        return;
      }

      // Set up a MutationObserver to detect when the element has children
      const observer = new MutationObserver(mutationsList => {
        for (const mutation of mutationsList) {
          if (!elementToWatch && selector) {
            elementToWatch = root?.querySelector(selector);
          }

          if (
            (globalOptions.childList && mutation.type === 'childList') ||
            (globalOptions.attributes && mutation.type === 'attributes')
          ) {
            if (isReady(elementToWatch, selector)) {
              observer.disconnect();
              resolve();
              return;
            }
          }
        }
      });

      observer.observe(root, globalOptions);

      // Set up an optional timeout to reject the promise if the element never gets child nodes
      if (timeout > 0) {
        setTimeout(() => {
          observer.disconnect();
          reject(new Error(`Timeout waiting for ${selector}`));
        }, timeout);
      }
    });
};

const waitForElementChildren = createAwaitableMutationObserver({
  childList: true,
  subtree: true,
  isReady: (el, selector) => !!el?.childElementCount && el?.matches?.(selector) && el.childElementCount > 0,
});

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
      const defaultSelector = `[data-clerk-component="${component}"]`;
      const selector = options?.selector;
      watcherRef.current = waitForElementChildren({
        selector: selector
          ? // Allows for `[data-clerk-component="xxxx"][data-some-attribute="123"] .my-class`
            defaultSelector + selector
          : defaultSelector,
      })
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
