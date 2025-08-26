import { useEffect, useRef, useState } from 'react';

const createAwaitableMutationObserver = (
  globalOptions: MutationObserverInit & {
    isReady: (el: HTMLElement | null, selector: string) => boolean;
  },
) => {
  const isReady = globalOptions?.isReady;

  return (options: { selector: string; root?: HTMLElement | null; timeout?: number }) =>
    new Promise<void>((resolve, reject) => {
      console.log('Selector', options.selector);
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
          console.log('Mutation', mutation);
          if (!elementToWatch && selector) {
            elementToWatch = root?.querySelector(selector);
          }
          console.log('elementToWatch', elementToWatch);

          if (
            (globalOptions.childList && mutation.type === 'childList') ||
            (globalOptions.attributes && mutation.type === 'attributes')
          ) {
            console.log('isReady', isReady(elementToWatch, selector));
            if (isReady(elementToWatch, selector)) {
              console.log('disconnecting');
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
  isReady: (el: HTMLElement | null) => !!el?.childElementCount && el.childElementCount > 0,
});

const waitForElementAttribute = createAwaitableMutationObserver({
  attributes: true,
  // childList: true,
  // subtree: true,
  isReady: (el: HTMLElement | null, selector: string) => {
    return el?.matches?.(selector) ?? false;
  },
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
      const selector = `[data-clerk-component="${component}"]`;
      const attributeSelector = options?.selector;
      console.log('attributeSelector', attributeSelector, attributeSelector + selector);
      watcherRef.current = (
        attributeSelector
          ? waitForElementAttribute({ selector: attributeSelector + selector })
          : waitForElementChildren({ selector })
      )
        .then(() => {
          console.log('rendered', component);
          setStatus('rendered');
        })
        .catch(() => {
          console.log('error', component);
          setStatus('error');
        });
    }
  }, [component, options?.selector]);

  return status;
}
