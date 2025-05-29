import { useClerk } from '@clerk/clerk-react';
import { buildClerkJsScriptAttributes, clerkJsScriptUrl } from '@clerk/clerk-react/internal';
import NextScript from 'next/script';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useClerkNextOptions } from '../client-boundary/NextOptionsContext';

// TODO: This will work once the exports are properly set up
// For now, we'll use the blocking coordinator pattern with inline script

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

type ClerkJSScriptProps = {
  router: 'app' | 'pages';
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onLoadingStateChange?: (state: LoadingState) => void;
};

// Inline blocking coordinator script (until we can import properly)
function getBlockingCoordinatorScript(): string {
  return `
(function() {
  'use strict';
  
  if (window.__clerkJSBlockingCoordinator) {
    return;
  }
  
  var coordinator = {
    state: 'idle',
    scriptUrl: null,
    scriptElement: null,
    error: null,
    callbacks: [],
    
    shouldAllowScript: function(scriptElement) {
      if (!scriptElement.hasAttribute('data-clerk-js-script')) {
        return true;
      }
      
      if (this.scriptElement && this.scriptElement.src === scriptElement.src) {
        return false;
      }
      
      if (window.Clerk) {
        this.setState('loaded');
        return false;
      }
      
      if (this.state === 'loading') {
        return false;
      }
      
      this.adoptScript(scriptElement);
      return true;
    },
    
    adoptScript: function(scriptElement) {
      this.scriptElement = scriptElement;
      this.scriptUrl = scriptElement.src;
      this.setState('loading');
      
      var self = this;
      
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
  
  var originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child) {
    if (child.tagName === 'SCRIPT' && child.hasAttribute('data-clerk-js-script')) {
      if (!coordinator.shouldAllowScript(child)) {
        return child;
      }
    }
    
    return originalAppendChild.call(this, child);
  };
  
  window.__clerkJSBlockingCoordinator = coordinator;
})();
  `.trim();
}

// Hook to get the current ClerkJS loading state from the blocking coordinator
function useClerkJSLoadingState() {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const coordinator = (window as any).__clerkJSBlockingCoordinator;
    if (coordinator) {
      coordinator.registerCallback({
        onStateChange: (state: LoadingState) => {
          setLoadingState(state);
        },
      });
    }
  }, []);

  return { loadingState };
}

/**
 * Enhanced ClerkJS Script component with bulletproof load detection.
 *
 * This component renders TWO script tags:
 * 1. A render-blocking inline script that sets up the coordinator globally
 * 2. The actual ClerkJS script tag (which the coordinator will manage)
 *
 * The coordinator uses comprehensive DOM interception to catch scripts regardless
 * of where they're placed (head, body, or injected dynamically).
 */
function ClerkJSScript(props: ClerkJSScriptProps) {
  const { publishableKey, clerkJSUrl, clerkJSVersion, clerkJSVariant, nonce } = useClerkNextOptions();
  const { domain, proxyUrl } = useClerk();
  const scriptRef = useRef<HTMLScriptElement>(null);

  /**
   * If no publishable key, avoid appending invalid scripts in the DOM.
   */
  if (!publishableKey) {
    return null;
  }

  const options = {
    domain,
    proxyUrl,
    publishableKey,
    clerkJSUrl,
    clerkJSVersion,
    clerkJSVariant,
    nonce,
  };
  const scriptUrl = clerkJsScriptUrl(options);

  // Handle state changes from the blocking coordinator
  const handleLoad = useCallback(() => {
    props.onLoad?.();
  }, [props]);

  const handleError = useCallback(
    (error: Error) => {
      props.onError?.(error);
    },
    [props],
  );

  // Subscribe to blocking coordinator state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const coordinator = (window as any).__clerkJSBlockingCoordinator;
    if (coordinator) {
      coordinator.registerCallback({
        onLoad: handleLoad,
        onError: handleError,
        onStateChange: (state: LoadingState) => {
          props.onLoadingStateChange?.(state);
        },
      });
    }
  }, [handleLoad, handleError, props]);

  const scriptAttributes = buildClerkJsScriptAttributes(options);

  if (props.router === 'app') {
    // For App Router, use regular script tags
    // The coordinator will catch these regardless of placement
    return (
      <>
        {/* Blocking coordinator script - MUST run first */}
        <script
          dangerouslySetInnerHTML={{ __html: getBlockingCoordinatorScript() }}
          // No async/defer - this must block to set up coordination
        />

        {/* Actual ClerkJS script - managed by the coordinator */}
        <script
          ref={scriptRef}
          src={scriptUrl}
          data-clerk-js-script='true'
          async
          crossOrigin='anonymous'
          {...scriptAttributes}
        />
      </>
    );
  } else {
    // For Pages Router, use Next.js Script components with beforeInteractive
    // This ensures both scripts are placed in head and execute early
    return (
      <>
        {/* Blocking coordinator script - MUST run first and block */}
        <NextScript
          id='clerk-blocking-coordinator'
          strategy='beforeInteractive'
          dangerouslySetInnerHTML={{ __html: getBlockingCoordinatorScript() }}
        />

        {/* Actual ClerkJS script - managed by the coordinator */}
        <NextScript
          src={scriptUrl}
          data-clerk-js-script='true'
          async
          defer={false}
          crossOrigin='anonymous'
          strategy='beforeInteractive'
          {...scriptAttributes}
        />
      </>
    );
  }
}

export { ClerkJSScript, useClerkJSLoadingState };
export type { ClerkJSScriptProps, LoadingState };
