/**
 * Utilities for working with Clerk SharedWorker
 */

/**
 * SharedWorker configuration options for bundled scripts
 */
export interface SharedWorkerOptions {
  /**
   * The URL or path to the SharedWorker script.
   * Required for bundled SharedWorker mode.
   */
  scriptUrl: string;
  /**
   * Optional name for the SharedWorker.
   */
  name?: string;
  /**
   * Whether to enable SharedWorker functionality.
   * @default true
   */
  enabled?: boolean;
  /**
   * Custom options to pass to the SharedWorker constructor.
   */
  options?: WorkerOptions;
  /**
   * Callback function called when the SharedWorker is successfully initialized.
   */
  onReady?: (worker: SharedWorker) => void;
  /**
   * Callback function called when SharedWorker initialization fails.
   */
  onError?: (error: Error) => void;
  /**
   * Whether to automatically start the SharedWorker during Clerk initialization.
   * @default true
   */
  autoStart?: boolean;
}

/**
 * Gets the path to the bundled Clerk SharedWorker script
 * @param baseUrl - The base URL where your clerk-js assets are served from (e.g., '/static/js/' or 'https://cdn.example.com/')
 * @returns The full URL to the SharedWorker script
 */
export function getClerkSharedWorkerPath(baseUrl: string = ''): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/clerk-shared-worker.js`;
}

/**
 * Creates configuration for using the bundled SharedWorker script
 * @param baseUrl - The base URL where your clerk-js assets are served from
 * @returns SharedWorker configuration object
 */
export function createBundledSharedWorkerConfig(baseUrl: string = ''): SharedWorkerOptions {
  return {
    scriptUrl: getClerkSharedWorkerPath(baseUrl),
    enabled: true,
    autoStart: true,
  };
}

/**
 * Creates SharedWorker configuration using the bundled script
 * @param baseUrl - The base URL where your clerk-js assets are served from
 * @returns SharedWorker configuration object
 */
export function createSharedWorkerConfig(baseUrl: string = ''): SharedWorkerOptions {
  return createBundledSharedWorkerConfig(baseUrl);
}
