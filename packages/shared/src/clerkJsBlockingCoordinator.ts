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
 * This script sets up the global coordinator immediately.
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
      
      // Set up load monitoring
      var originalOnLoad = scriptElement.onload;
      var originalOnError = scriptElement.onerror;
      
      scriptElement.onload = function(event) {
        scriptElement.setAttribute('data-clerk-loaded', 'true');
        self.setState('loaded');
        if (originalOnLoad) originalOnLoad.call(this, event);
      };
      
      scriptElement.onerror = function(event) {
        self.setState('error', new Error('ClerkJS failed to load'));
        if (originalOnError) originalOnError.call(this, event);
      };
      
      // Also use addEventListener for better compatibility
      scriptElement.addEventListener('load', function() {
        scriptElement.setAttribute('data-clerk-loaded', 'true');
        self.setState('loaded');
      });
      
      scriptElement.addEventListener('error', function() {
        self.setState('error', new Error('ClerkJS failed to load'));
      });
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
  
  // Intercept script creation to catch ClerkJS scripts before they load
  var originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    var element = originalCreateElement.apply(this, arguments);
    
    if (tagName.toLowerCase() === 'script') {
      // Set up a property setter to intercept src assignment
      var originalSrc = element.src;
      var srcSet = false;
      
      Object.defineProperty(element, 'src', {
        get: function() {
          return originalSrc;
        },
        set: function(value) {
          originalSrc = value;
          srcSet = true;
          
          // Check if this should be allowed after src is set
          // (need to wait for src to be set to make decision)
          setTimeout(function() {
            if (!coordinator.shouldAllowScript(element)) {
              // Prevent the script from loading by clearing its src
              element.src = '';
              element.remove();
            }
          }, 0);
        },
        configurable: true
      });
    }
    
    return element;
  };
  
  // Also intercept appendChild to catch scripts added directly
  var originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child) {
    if (child.tagName === 'SCRIPT' && child.hasAttribute('data-clerk-js-script')) {
      if (!coordinator.shouldAllowScript(child)) {
        // Return a dummy element to prevent errors
        return child;
      }
    }
    
    return originalAppendChild.call(this, child);
  };
  
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
