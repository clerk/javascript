import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';

import type { MockScenario } from './types';

/**
 * Configuration options for the mock controller
 */
export interface MockConfig {
  debug?: boolean;
  delay?: number | { min: number; max: number };
  persist?: boolean;
}

/**
 * Controller for managing Clerk API mocking using MSW
 * Browser-only implementation for sandbox and documentation sites
 */
export class MockingController {
  private activeScenario: MockScenario | null = null;
  private config: MockConfig;
  private scenarios: Map<string, MockScenario> = new Map();
  private worker: ReturnType<typeof setupWorker> | null = null;

  constructor(config: MockConfig = {}) {
    this.config = {
      debug: false,
      delay: { min: 100, max: 500 },
      persist: false,
      ...config,
    };
  }

  getActiveScenario(): MockScenario | null {
    return this.activeScenario;
  }

  getScenarios(): MockScenario[] {
    return Array.from(this.scenarios.values());
  }

  hasScenario(scenarioName: string): boolean {
    return this.scenarios.has(scenarioName);
  }

  registerScenario(scenario: MockScenario): void {
    this.scenarios.set(scenario.name, scenario);
  }

  async start(scenarioName?: string): Promise<void> {
    if (this.worker) {
      this.worker.stop();
      this.worker = null;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const handlers = this.getHandlers(scenarioName);
    console.log(
      `[MSW] Loaded ${this.scenarios.size} scenarios, starting with scenario: ${scenarioName || 'default'} (${handlers.length} handlers)`,
    );

    const worker = setupWorker(...handlers);
    this.worker = worker;

    const isDeployed =
      window.location.hostname !== 'localhost' &&
      !window.location.hostname.includes('127.0.0.1') &&
      !window.location.hostname.includes('192.168.');

    const workerConfig = {
      quiet: !this.config.debug,
      onUnhandledRequest: (req: any) => {
        if (
          req.url.includes('/ingest/') ||
          req.url.includes('/analytics/') ||
          req.url.includes('/telemetry/') ||
          req.url.includes('/metrics/') ||
          req.url.includes('/tracking/') ||
          req.url.includes('/tokens') ||
          req.url.includes('clerk-telemetry') ||
          req.url.includes('/__clerk')
        ) {
          return;
        }
        if (this.config.debug) {
          console.warn(`[MSW] Unhandled request: ${req.method} ${req.url}`);
        }
      },
      ...(isDeployed
        ? {
            serviceWorker: {
              url: '/mockServiceWorker.js',
              options: {
                scope: '/',
              },
            },
          }
        : {
            serviceWorker: {
              url: '/mockServiceWorker.js',
            },
          }),
    };

    try {
      await worker.start(workerConfig);
      worker.events.on('request:start', ({ request }) => {
        if (this.config.debug) {
          console.log('[MSW] Request intercepted:', request.method, request.url);
        }
      });

      worker.events.on('response:mocked', async ({ request, response }) => {
        if (this.config.debug) {
          console.log('[MSW] Response mocked:', request.method, request.url, response.status);
        }
      });

      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        if (!navigator.serviceWorker.controller) {
          const hasReloaded = sessionStorage.getItem('msw_reloaded');
          if (!hasReloaded) {
            sessionStorage.setItem('msw_reloaded', 'true');
            window.location.reload();
            return;
          }
        } else {
          sessionStorage.removeItem('msw_reloaded');
        }
      }
    } catch (error) {
      try {
        await this.worker.start({
          quiet: !this.config.debug,
          onUnhandledRequest: (req: any) => {
            if (
              req.url.includes('/ingest/') ||
              req.url.includes('/analytics/') ||
              req.url.includes('/telemetry/') ||
              req.url.includes('/metrics/') ||
              req.url.includes('/tracking/') ||
              req.url.includes('/tokens') ||
              req.url.includes('clerk-telemetry') ||
              req.url.includes('/__clerk')
            ) {
              return;
            }
            if (this.config.debug) {
              console.warn(`[MSW] Unhandled request: ${req.method} ${req.url}`);
            }
          },
        });

        this.worker.events.on('request:start', ({ request }) => {
          if (this.config.debug) {
            console.log('[MSW] Request intercepted:', request.method, request.url);
          }
        });

        this.worker.events.on('response:mocked', async ({ request, response }) => {
          if (this.config.debug) {
            console.log('[MSW] Response mocked:', request.method, request.url, response.status);
          }
        });
      } catch (fallbackError) {
        console.error('[MSW] Failed to start worker in fallback mode:', fallbackError);
        throw new Error(
          `Failed to initialize mocking: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
        );
      }
    }
  }

  stop(): void {
    if (this.worker) {
      this.worker.stop();
      this.worker = null;
    }
  }

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
      console.log(`[MSW] Switched to scenario: ${scenarioName}`);
    }
  }

  private getHandlers(scenarioName?: string): any[] {
    if (scenarioName) {
      const scenario = this.scenarios.get(scenarioName);
      if (!scenario) {
        throw new Error(`[MSW] Scenario "${scenarioName}" not found`);
      }
      this.activeScenario = scenario;
      return scenario.handlers;
    }

    return [
      http.get('/v1/client', () => {
        return HttpResponse.json({
          response: {
            lastActiveSessionId: null,
            sessions: [],
            signIn: null,
            signUp: null,
          },
        });
      }),

      http.get('/v1/environment', () => {
        return HttpResponse.json({
          auth: {
            authConfig: {
              singleSessionMode: false,
              urlBasedSessionSyncing: true,
            },
            displayConfig: {
              afterSignInUrl: '',
              afterSignUpUrl: '',
              branded: false,
              captchaPublicKey: null,
              faviconImageUrl: '',
              homeUrl: 'https://example.com',
              instanceEnvironmentType: 'production',
              logoImageUrl: '',
              preferredSignInStrategy: 'password',
              signInUrl: '',
              signUpUrl: '',
              userProfileUrl: '',
            },
          },
          organization: null,
          user: null,
        });
      }),

      http.all('*', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      }),
    ];
  }
}
