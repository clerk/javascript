/**
 * Minimal observability loader - designed to have virtually zero impact on bundle size.
 * This file should be kept under 1KB gzipped.
 *
 * Only loads the full observability system when specific trigger conditions are met:
 * - Cookie: clerk_observability=true
 * - SessionStorage: clerk_observability_enabled=true
 * - Header flag: __CLERK_OBSERVABILITY_HEADER__
 * - Custom trigger function
 */

import type { ObservabilityTriggerConfig } from '@clerk/types';

export class ClerkObservabilityLoader {
  private static instance: ClerkObservabilityLoader | null = null;
  private isLoaded = false;
  private isLoading = false;
  private observabilityInstance: any = null;
  private config: Required<ObservabilityTriggerConfig>;
  private checkInterval?: number;
  private clerkInstance: any;

  private constructor(clerk: any, config: ObservabilityTriggerConfig) {
    this.clerkInstance = clerk;
    this.config = {
      cookieName: config.cookieName || 'clerk_observability',
      sessionStorageKey: config.sessionStorageKey || 'clerk_observability_enabled',
      headerName: config.headerName || 'x-clerk-observability',
      bundleUrl: config.bundleUrl || this.getDefaultBundleUrl(),
      customTrigger: config.customTrigger || (() => false),
    };

    this.startChecking();
  }

  static init(clerk: any, config?: ObservabilityTriggerConfig): ClerkObservabilityLoader {
    if (!this.instance) {
      this.instance = new ClerkObservabilityLoader(clerk, config || {});
    }
    return this.instance;
  }

  private getDefaultBundleUrl(): string {
    const version = this.clerkInstance.version || 'latest';
    const frontendApi = this.clerkInstance.frontendApi;
    const cdnUrl = frontendApi ? `https://${frontendApi}` : 'https://cdn.clerk.com';

    return `${cdnUrl}/npm/@clerk/observability@${version}/dist/bundle.js`;
  }

  private startChecking(): void {
    // Initial check
    this.check();

    // Periodic check every 5 seconds
    this.checkInterval = window.setInterval(() => this.check(), 5000);
  }

  private check(): void {
    if (this.isLoaded || this.isLoading) return;

    if (this.shouldLoad()) {
      void this.load();
    }
  }

  private shouldLoad(): boolean {
    // Check cookie
    if (typeof document !== 'undefined' && document.cookie.includes(`${this.config.cookieName}=true`)) {
      return true;
    }

    // Check sessionStorage
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(this.config.sessionStorageKey) === 'true') {
        return true;
      }
    } catch {
      // Ignore sessionStorage errors (e.g., in private browsing)
    }

    // Check header flag (set by SSR or other mechanisms)
    if (typeof window !== 'undefined' && (window as any).__CLERK_OBSERVABILITY_HEADER__) {
      return true;
    }

    // Custom trigger
    try {
      if (this.config.customTrigger()) {
        return true;
      }
    } catch {
      // Ignore custom trigger errors
    }

    return false;
  }

  private async load(): Promise<void> {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;

    try {
      // Create and load script
      const script = document.createElement('script');
      script.src = this.config.bundleUrl;
      script.async = true;
      script.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load observability bundle'));
        document.head.appendChild(script);
      });

      // Initialize observability
      const ObservabilityClass = (window as any).ClerkObservability;
      if (ObservabilityClass) {
        this.observabilityInstance = await ObservabilityClass.install(this.clerkInstance, this.getConfig());
        this.isLoaded = true;

        // Optional: Log successful loading in development
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Clerk Observability loaded successfully');
        }
      } else {
        throw new Error('ClerkObservability class not found in loaded bundle');
      }

      // Stop periodic checking once loaded
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = undefined;
      }
    } catch (error) {
      console.error('[Clerk] Failed to load observability:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private getConfig(): any {
    const config: any = {};

    // Try to load additional config from sessionStorage
    try {
      if (typeof sessionStorage !== 'undefined') {
        const stored = sessionStorage.getItem('clerk_observability_config');
        if (stored) {
          Object.assign(config, JSON.parse(stored));
        }
      }
    } catch {
      // Ignore config loading errors
    }

    return config;
  }

  // Public API methods
  enable(): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(this.config.sessionStorageKey, 'true');
      }
    } catch {
      // Ignore sessionStorage errors
    }

    // Trigger immediate check
    this.check();
  }

  disable(): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(this.config.sessionStorageKey);
      }
    } catch {
      // Ignore sessionStorage errors
    }

    // Disable current instance
    this.observabilityInstance?.disable?.();
  }

  isEnabled(): boolean {
    return this.isLoaded && this.observabilityInstance?.isEnabled?.() === true;
  }

  getInstance(): any {
    return this.observabilityInstance;
  }

  // Cleanup method
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }

    this.observabilityInstance?.destroy?.();
    this.observabilityInstance = null;
    this.isLoaded = false;
    this.isLoading = false;
  }
}

// Global types for window extensions
declare global {
  interface Window {
    __CLERK_OBSERVABILITY_HEADER__?: boolean;
    ClerkObservability?: any;
    clerkObservability?: {
      enable: () => void;
      disable: () => void;
      status: () => void;
    };
  }
}
