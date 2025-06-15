import type { ObservabilityTriggerConfig } from './types';

export class ClerkObservabilityLoader {
  private static instance: ClerkObservabilityLoader | null = null;
  private isLoaded = false;
  private isLoading = false;
  private observabilityInstance: any = null;
  private config: Required<ObservabilityTriggerConfig>;
  private clerkInstance: any;

  private constructor(clerkInstance: any, config: ObservabilityTriggerConfig) {
    this.clerkInstance = clerkInstance;
    this.config = {
      cookieName: config.cookieName || 'clerk_observability',
      sessionStorageKey: config.sessionStorageKey || 'clerk_observability_enabled',
      headerName: config.headerName || 'x-clerk-observability',
      bundleUrl: config.bundleUrl || '',
      customTrigger: config.customTrigger || (() => false),
    };

    this.checkTriggers();
  }

  /**
   * Initialize the observability loader singleton
   */
  public static init(clerkInstance: any, config: ObservabilityTriggerConfig): ClerkObservabilityLoader {
    if (!ClerkObservabilityLoader.instance) {
      ClerkObservabilityLoader.instance = new ClerkObservabilityLoader(clerkInstance, config);
    }
    return ClerkObservabilityLoader.instance;
  }

  /**
   * Enable observability and load the full system
   */
  public enable(): void {
    if (this.isLoaded || this.isLoading) return;

    this.isLoading = true;
    this.loadObservabilitySystem()
      .then(instance => {
        this.observabilityInstance = instance;
        this.isLoaded = true;
        this.isLoading = false;
      })
      .catch(() => {
        this.isLoading = false;
      });
  }

  /**
   * Disable observability
   */
  public disable(): void {
    this.isLoaded = false;
    this.observabilityInstance = null;
  }

  /**
   * Check if observability is enabled and loaded
   */
  public isEnabled(): boolean {
    return this.isLoaded && this.observabilityInstance !== null;
  }

  /**
   * Get the observability instance
   */
  public getInstance(): any {
    return this.observabilityInstance;
  }

  private checkTriggers(): void {
    if (typeof window === 'undefined') return;

    const cookieEnabled = this.checkCookie();
    const sessionStorageEnabled = this.checkSessionStorage();
    const headerEnabled = this.checkHeader();
    const customEnabled = this.config.customTrigger();

    if (cookieEnabled || sessionStorageEnabled || headerEnabled || customEnabled) {
      this.enable();
    }
  }

  private checkCookie(): boolean {
    if (typeof document === 'undefined') return false;
    return document.cookie.includes(`${this.config.cookieName}=true`);
  }

  private checkSessionStorage(): boolean {
    try {
      return window.sessionStorage?.getItem(this.config.sessionStorageKey) === 'true';
    } catch {
      return false;
    }
  }

  private checkHeader(): boolean {
    return (window as any).__CLERK_OBSERVABILITY_HEADER__ === true;
  }

  private async loadObservabilitySystem(): Promise<any> {
    if (!this.config.bundleUrl) {
      throw new Error('No bundle URL configured for observability system');
    }

    const script = document.createElement('script');
    script.src = this.config.bundleUrl;
    script.async = true;

    return new Promise((resolve, reject) => {
      script.onload = () => {
        const ObservabilitySystem = (window as any).ClerkObservabilitySystem;
        if (ObservabilitySystem) {
          const instance = new ObservabilitySystem(this.clerkInstance);
          resolve(instance);
        } else {
          reject(new Error('Observability system not found on window'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load observability system'));
      };

      document.head.appendChild(script);
    });
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
