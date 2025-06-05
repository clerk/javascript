/**
 * ClerkJS Blocking Coordinator
 *
 * This script MUST run synchronously before any ClerkJS script tags are processed.
 * It sets up global coordination and can intercept script loading to prevent duplicates.
 *
 * This should be injected as an inline, render-blocking script tag.
 */

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

interface BlockingCoordinator {
  state: LoadingState;
  scriptUrl?: string;
  scriptElement?: HTMLScriptElement;
  error?: Error;
  promise?: Promise<HTMLScriptElement>;
  callbacks: Array<{
    onLoad?: () => void;
    onError?: (error: Error) => void;
    onStateChange?: (state: LoadingState) => void;
  }>;

  shouldAllowScript(scriptElement: HTMLScriptElement): boolean;
  registerCallback(callback: {
    onLoad?: () => void;
    onError?: (error: Error) => void;
    onStateChange?: (state: LoadingState) => void;
  }): void;
  setState(newState: LoadingState, error?: Error): void;
}

/**
 * Returns the inline script content that should be injected as a blocking script.
 * This script sets up the global coordinator immediately and intercepts all script loading.
 */
export function getBlockingCoordinatorScript(): string {
  return `
(function() {
  'use strict';
  
  // Prevent multiple initialization
  if (window.__clerkJSBlockingCoordinator) {
    return;
  }
  
  var coordinator = {
    state: 'idle',
    scriptUrl: null,
    scriptElement: null,
    error: null,
    promise: null,
    callbacks: [],
    
    shouldAllowScript: function(scriptElement) {
      // Only manage ClerkJS scripts
      if (!scriptElement.hasAttribute('data-clerk-js-script')) {
        return true; // Allow non-ClerkJS scripts
      }
      
      // If we already have a ClerkJS script, prevent duplicates
      if (this.scriptElement && this.scriptElement.src === scriptElement.src) {
        return false;
      }
      
      // If ClerkJS is already loaded globally, prevent new scripts
      if (window.Clerk) {
        this.setState('loaded');
        return false;
      }
      
      // If we're currently loading, prevent new scripts
      if (this.state === 'loading') {
        return false;
      }
      
      // This is the first ClerkJS script, adopt it
      this.adoptScript(scriptElement);
      return true;
    },
    
    adoptScript: function(scriptElement) {
      this.scriptElement = scriptElement;
      this.scriptUrl = scriptElement.src;
      this.setState('loading');
      
      var self = this;
      
      // Set up load monitoring with multiple methods for better compatibility
      var handleLoad = function() {
        scriptElement.setAttribute('data-clerk-loaded', 'true');
        self.setState('loaded');
      };
      
      var handleError = function() {
        self.setState('error', new Error('ClerkJS failed to load'));
      };
      
      // Use multiple approaches to catch load events
      if (scriptElement.onload !== undefined) {
        var originalOnLoad = scriptElement.onload;
        scriptElement.onload = function(event) {
          handleLoad();
          if (originalOnLoad) originalOnLoad.call(this, event);
        };
      }
      
      if (scriptElement.onerror !== undefined) {
        var originalOnError = scriptElement.onerror;
        scriptElement.onerror = function(event) {
          handleError();
          if (originalOnError) originalOnError.call(this, event);
        };
      }
      
      // Also use addEventListener for better compatibility
      scriptElement.addEventListener('load', handleLoad);
      scriptElement.addEventListener('error', handleError);
    },
    
    registerCallback: function(callback) {
      this.callbacks.push(callback);
      
      // Call immediately if we have a current state
      if (callback.onStateChange) {
        callback.onStateChange(this.state);
      }
      
      if (this.state === 'loaded' && callback.onLoad) {
        callback.onLoad();
      } else if (this.state === 'error' && callback.onError && this.error) {
        callback.onError(this.error);
      }
    },
    
    setState: function(newState, error) {
      this.state = newState;
      if (error) this.error = error;
      
      // Notify all callbacks
      for (var i = 0; i < this.callbacks.length; i++) {
        var callback = this.callbacks[i];
        try {
          if (callback.onStateChange) {
            callback.onStateChange(newState);
          }
          
          if (newState === 'loaded' && callback.onLoad) {
            callback.onLoad();
          } else if (newState === 'error' && callback.onError && error) {
            callback.onError(error);
          }
        } catch (e) {
          console.error('ClerkJS coordinator callback error:', e);
        }
      }
    }
  };
  
  // Function to check and potentially intercept a script
  function interceptScript(scriptElement) {
    if (scriptElement && scriptElement.tagName === 'SCRIPT') {
      if (scriptElement.hasAttribute('data-clerk-js-script')) {
        return coordinator.shouldAllowScript(scriptElement);
      }
    }
    return true;
  }
  
  // Intercept appendChild on all nodes
  var originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child) {
    if (!interceptScript(child)) {
      // Create a dummy script element to return
      var dummy = document.createElement('script');
      dummy.src = child.src;
      Object.keys(child.attributes || {}).forEach(function(key) {
        var attr = child.attributes[key];
        if (attr && attr.name && attr.value) {
          dummy.setAttribute(attr.name, attr.value);
        }
      });
      return dummy;
    }
    
    return originalAppendChild.call(this, child);
  };
  
  // Intercept insertBefore
  var originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (!interceptScript(newNode)) {
      var dummy = document.createElement('script');
      dummy.src = newNode.src;
      return dummy;
    }
    
    return originalInsertBefore.call(this, newNode, referenceNode);
  };
  
  // Also watch for scripts being set via innerHTML or similar
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        Array.prototype.slice.call(mutation.addedNodes).forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'SCRIPT' && node.hasAttribute('data-clerk-js-script')) {
              if (!coordinator.shouldAllowScript(node)) {
                node.remove();
              }
            }
            
            // Also check children in case scripts are added in bulk
            var scripts = node.querySelectorAll ? node.querySelectorAll('script[data-clerk-js-script]') : [];
            for (var i = 0; i < scripts.length; i++) {
              if (!coordinator.shouldAllowScript(scripts[i])) {
                scripts[i].remove();
              }
            }
          }
        });
      }
    });
  });
  
  // Start observing
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } else {
    // If body doesn't exist yet, wait for it
    document.addEventListener('DOMContentLoaded', function() {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }
  
  // Also observe head if it exists
  if (document.head) {
    observer.observe(document.head, {
      childList: true,
      subtree: true
    });
  }
  
  // Expose the coordinator globally
  window.__clerkJSBlockingCoordinator = coordinator;
})();
`.trim();
}

/**
 * Get the current state from the blocking coordinator.
 */
export function getBlockingCoordinatorState(): LoadingState {
  if (typeof window === 'undefined') return 'idle';
  const coordinator = (window as any).__clerkJSBlockingCoordinator;
  return coordinator ? coordinator.state : 'idle';
}

/**
 * Register callbacks with the blocking coordinator.
 */
export function registerWithBlockingCoordinator(callback: {
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: LoadingState) => void;
}): () => void {
  if (typeof window === 'undefined') return () => {};

  const coordinator = (window as any).__clerkJSBlockingCoordinator;
  if (coordinator) {
    coordinator.registerCallback(callback);
  }

  // Return a no-op unsubscribe function since the blocking coordinator
  // doesn't need complex unsubscription
  return () => {};
}

/**
 * Check if ClerkJS is loaded according to the blocking coordinator.
 */
export function isClerkJSLoadedBlocking(): boolean {
  if (typeof window === 'undefined') return false;
  const coordinator = (window as any).__clerkJSBlockingCoordinator;
  return coordinator ? coordinator.state === 'loaded' : false;
}

export type { LoadingState, BlockingCoordinator };
