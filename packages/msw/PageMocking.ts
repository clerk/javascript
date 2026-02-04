import type { MockConfig } from './MockingController';
import { MockingController } from './MockingController';
import type { MockScenario } from './types';

export interface PageMockConfig extends MockConfig {
  scenario?: () => MockScenario;
}

export interface PageMockingState {
  controller: MockingController | null;
  error: Error | null;
  isEnabled: boolean;
  isReady: boolean;
}

export interface PageMockingCallbacks {
  onStateChange?: (state: PageMockingState) => void;
}

export class PageMocking {
  private callbacks: PageMockingCallbacks;
  private config: PageMockConfig | undefined;
  private currentPathname: string | null = null;
  private state: PageMockingState = {
    controller: null,
    error: null,
    isEnabled: false,
    isReady: false,
  };

  constructor(callbacks: PageMockingCallbacks = {}) {
    this.callbacks = callbacks;
  }

  getState(): PageMockingState {
    return { ...this.state };
  }

  async initialize(pathname: string, config?: PageMockConfig): Promise<PageMockingState> {
    // If pathname changed and we have an active controller, clean up first
    if (this.currentPathname !== null && this.currentPathname !== pathname) {
      this.cleanup();
    }

    this.currentPathname = pathname;
    this.config = config;

    if (!config?.scenario) {
      return this.getState();
    }

    try {
      if (typeof window !== 'undefined') {
        const clerkLocalStorageKeys = Object.keys(localStorage).filter(key => key.startsWith('__clerk'));
        clerkLocalStorageKeys.forEach(key => localStorage.removeItem(key));
        const clerkSessionStorageKeys = Object.keys(sessionStorage).filter(key => key.startsWith('__clerk'));
        clerkSessionStorageKeys.forEach(key => sessionStorage.removeItem(key));

        document.cookie = `__clerk_db_jwt=mock_dev_browser_jwt_${Date.now()}; path=/; max-age=31536000; Secure; SameSite=None`;
      }

      const scenario = config.scenario();

      const mockController = new MockingController({
        debug: config?.debug || scenario.debug || false,
        delay: config?.delay,
        persist: config?.persist,
      });

      mockController.registerScenario(scenario);
      await mockController.start(scenario.name);

      this.updateState({
        controller: mockController,
        error: null,
        isEnabled: true,
        isReady: true,
      });
    } catch (err) {
      this.updateState({
        controller: null,
        error: err instanceof Error ? err : new Error('Failed to initialize page mocking'),
        isEnabled: false,
        isReady: false,
      });
    }

    return this.getState();
  }

  /**
   * Clean up the current mocking session
   */
  cleanup(): void {
    if (this.state.controller) {
      this.state.controller.stop();
    }

    this.updateState({
      controller: null,
      error: null,
      isEnabled: false,
      isReady: false,
    });
  }

  /**
   * Reinitialize mocking with the current configuration.
   * Useful when the pathname changes.
   */
  async reinitialize(pathname: string): Promise<PageMockingState> {
    return this.initialize(pathname, this.config);
  }

  private updateState(newState: Partial<PageMockingState>): void {
    this.state = { ...this.state, ...newState };
    this.callbacks.onStateChange?.(this.getState());
  }
}
