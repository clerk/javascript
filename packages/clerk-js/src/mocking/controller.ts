import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';

import type { MockScenario } from './scenarios';

/**
 * Configuration options for the mock controller
 */
export interface ClerkMockConfig {
  debug?: boolean;
  delay?: number | { min: number; max: number };
  persist?: boolean;
  scenario?: string;
}

/**
 * Controller for managing Clerk API mocking using MSW
 * Browser-only implementation for sandbox and documentation sites
 */
export class ClerkMockController {
  private worker: ReturnType<typeof setupWorker> | null = null;
  private activeScenario: MockScenario | null = null;
  private config: ClerkMockConfig;
  private scenarios: Map<string, MockScenario> = new Map();

  constructor(config: ClerkMockConfig = {}) {
    this.config = {
      delay: { min: 100, max: 500 },
      persist: false,
      debug: false,
      ...config,
    };
  }

  /**
   * Register a new mock scenario
   */
  registerScenario(scenario: MockScenario): void {
    this.scenarios.set(scenario.name, scenario);
  }

  /**
   * Start the mock service worker
   */
  async start(scenarioName?: string): Promise<void> {
    // Initialize MSW (browser-only)
    const handlers = this.getHandlers(scenarioName);
    console.log(
      `🔧 MSW: Loaded ${this.scenarios.size} scenarios, starting with scenario: ${scenarioName || 'default'} (${handlers.length} handlers)`,
    );

    this.worker = setupWorker(...handlers);
    await this.worker.start({
      onUnhandledRequest: this.config.debug ? 'warn' : 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });

    console.log('🔧 MSW: Worker started successfully');
  }

  /**
   * Stop the mock service worker
   */
  stop(): void {
    if (this.worker) {
      this.worker.stop();
      this.worker = null;
    }
  }

  /**
   * Switch to a different scenario
   */
  switchScenario(scenarioName: string): void {
    const scenario = this.scenarios.get(scenarioName);
    if (!scenario) {
      throw new Error(`Scenario "${scenarioName}" not found`);
    }

    this.activeScenario = scenario;

    if (this.worker) {
      this.worker.use(...scenario.handlers);
    }

    if (this.config.debug) {
      console.log(`🔄 Switched to scenario: ${scenarioName}`);
    }
  }

  /**
   * Get the current active scenario
   */
  getActiveScenario(): MockScenario | null {
    return this.activeScenario;
  }

  /**
   * Get all registered scenarios
   */
  getScenarios(): MockScenario[] {
    return Array.from(this.scenarios.values());
  }

  /**
   * Check if a scenario is registered
   */
  hasScenario(scenarioName: string): boolean {
    return this.scenarios.has(scenarioName);
  }

  private getHandlers(scenarioName?: string): any[] {
    if (scenarioName) {
      const scenario = this.scenarios.get(scenarioName);
      if (!scenario) {
        console.error(`🔧 MSW: Scenario "${scenarioName}" not found!`);
        throw new Error(`Scenario "${scenarioName}" not found`);
      }
      this.activeScenario = scenario;
      return scenario.handlers;
    }

    return [
      http.get('/v1/environment', () => {
        return HttpResponse.json({
          auth: {
            authConfig: {
              singleSessionMode: false,
              urlBasedSessionSyncing: true,
            },
            displayConfig: {
              branded: false,
              captchaPublicKey: null,
              homeUrl: 'https://example.com',
              instanceEnvironmentType: 'production',
              faviconImageUrl: '',
              logoImageUrl: '',
              preferredSignInStrategy: 'password',
              signInUrl: '',
              signUpUrl: '',
              userProfileUrl: '',
              afterSignInUrl: '',
              afterSignUpUrl: '',
            },
          },
          user: null,
          organization: null,
        });
      }),

      http.get('/v1/client', () => {
        return HttpResponse.json({
          response: {
            sessions: [],
            signIn: null,
            signUp: null,
            lastActiveSessionId: null,
          },
        });
      }),

      http.all('*', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      }),
    ];
  }
}
