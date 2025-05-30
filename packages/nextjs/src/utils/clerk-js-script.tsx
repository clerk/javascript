import { useClerk } from '@clerk/clerk-react';
import { buildClerkJsScriptAttributes, clerkJsScriptUrl } from '@clerk/clerk-react/internal';
import Head from 'next/head';
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
 * This component ensures the blocking coordinator is loaded in the document head
 * before any ClerkJS scripts, regardless of the router type.
 */
function ClerkJSScript(props: ClerkJSScriptProps) {
  const { publishableKey, clerkJSUrl, clerkJSVersion, clerkJSVariant, nonce } = useClerkNextOptions();
  const { domain, proxyUrl } = useClerk();
  const scriptRef = useRef<HTMLScriptElement>(null);
  const coordinatorInjected = useRef(false);

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

  // Inject coordinator script into head manually to ensure it's there first
  useEffect(() => {
    if (typeof window === 'undefined' || coordinatorInjected.current) return;

    // Check if coordinator already exists
    if ((window as any).__clerkJSBlockingCoordinator) {
      coordinatorInjected.current = true;
      return;
    }

    // Create and inject coordinator script into head
    const coordinatorScript = document.createElement('script');
    coordinatorScript.id = 'clerk-blocking-coordinator';
    coordinatorScript.innerHTML = getBlockingCoordinatorScript();

    // Insert at the beginning of head to ensure it runs first
    if (document.head.firstChild) {
      document.head.insertBefore(coordinatorScript, document.head.firstChild);
    } else {
      document.head.appendChild(coordinatorScript);
    }

    coordinatorInjected.current = true;
  }, []);

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
    // For App Router, use Next.js Head component to ensure script goes to head
    return (
      <Head>
        <script
          ref={scriptRef}
          src={scriptUrl}
          data-clerk-js-script='true'
          async
          crossOrigin='anonymous'
          {...scriptAttributes}
        />
      </Head>
    );
  } else {
    // For Pages Router, use Next.js Script components with beforeInteractive
    return (
      <NextScript
        src={scriptUrl}
        data-clerk-js-script='true'
        async
        defer={false}
        crossOrigin='anonymous'
        strategy='beforeInteractive'
        {...scriptAttributes}
      />
    );
  }
}

export { ClerkJSScript, useClerkJSLoadingState };
export type { ClerkJSScriptProps, LoadingState };
