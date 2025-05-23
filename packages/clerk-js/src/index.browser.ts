// It's crucial this is the first import,
// otherwise chunk loading will not work
// eslint-disable-next-line
import './utils/setWebpackChunkPublicPath';

import { Clerk } from './core/clerk';
import { createSharedWorkerConfig } from './utils/sharedWorkerUtils';

import { mountComponentRenderer } from './ui/Components';

declare global {
  interface Window {
    __clerk_publishable_key?: string;
    __clerk_proxy_url?: string;
    __clerk_domain?: string;
    __clerk_shared_worker?: string | boolean;
    __clerk_shared_worker_path?: string;
    Clerk?: Clerk;
  }
}

Clerk.mountComponentRenderer = mountComponentRenderer;

const publishableKey =
  document.querySelector('script[data-clerk-publishable-key]')?.getAttribute('data-clerk-publishable-key') ||
  window.__clerk_publishable_key ||
  '';

const proxyUrl =
  document.querySelector('script[data-clerk-proxy-url]')?.getAttribute('data-clerk-proxy-url') ||
  window.__clerk_proxy_url ||
  '';

const domain =
  document.querySelector('script[data-clerk-domain]')?.getAttribute('data-clerk-domain') || window.__clerk_domain || '';

const sharedWorkerEnabled =
  document.querySelector('script[data-clerk-shared-worker]')?.getAttribute('data-clerk-shared-worker') ||
  window.__clerk_shared_worker;

const sharedWorkerPath =
  document.querySelector('script[data-clerk-shared-worker-path]')?.getAttribute('data-clerk-shared-worker-path') ||
  window.__clerk_shared_worker_path;

if (!window.Clerk) {
  const clerkInstance = new Clerk(publishableKey, {
    proxyUrl,
    // @ts-expect-error - domain property may not be fully typed in ClerkOptions interface
    domain,
  });

  window.Clerk = clerkInstance;

  const shouldInitializeSharedWorker = sharedWorkerEnabled !== 'false' && sharedWorkerEnabled !== false;

  if (shouldInitializeSharedWorker && typeof SharedWorker !== 'undefined') {
    const baseUrl = sharedWorkerPath || '';

    console.log('[Clerk] Auto-initializing SharedWorker for cross-tab authentication sync');

    clerkInstance
      .load({
        sharedWorker: createSharedWorkerConfig(baseUrl),
      })
      .catch(error => {
        console.warn('Clerk: Failed to initialize with SharedWorker:', error);
        console.log('[Clerk] Falling back to standard initialization without SharedWorker');
        clerkInstance.load().catch(fallbackError => {
          console.error('Clerk: Failed to initialize:', fallbackError);
        });
      });
  } else if (typeof SharedWorker === 'undefined') {
    console.log('[Clerk] SharedWorker not supported in this browser, loading without cross-tab sync');
    clerkInstance.load().catch(error => {
      console.error('Clerk: Failed to initialize:', error);
    });
  } else {
    console.log('[Clerk] SharedWorker disabled, loading without cross-tab sync');
    clerkInstance.load().catch(error => {
      console.error('Clerk: Failed to initialize:', error);
    });
  }
}

if (module.hot) {
  module.hot.accept();
}
