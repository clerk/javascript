'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { MockConfig } from './MockingController';
import { MockingController } from './MockingController';
import type { MockScenario } from './types';

export interface PageMockConfig extends MockConfig {
  scenario?: () => MockScenario;
}

export function usePageMocking(config?: PageMockConfig) {
  const pathname = usePathname();
  const [controller, setController] = useState<MockingController | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeMocking = async () => {
      try {
        if (!config?.scenario) {
          return;
        }

        // Clear Clerk's cached data to prevent stale environment/session data
        if (typeof window !== 'undefined') {
          const clerkKeys = Object.keys(localStorage).filter(key => key.startsWith('__clerk'));
          clerkKeys.forEach(key => localStorage.removeItem(key));
          const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('__clerk'));
          sessionKeys.forEach(key => sessionStorage.removeItem(key));

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

        if (mounted) {
          setController(mockController);
          setIsEnabled(true);
          setIsReady(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize page mocking'));
          setIsReady(false);
          setIsEnabled(false);
        }
      }
    };

    initializeMocking();

    return () => {
      mounted = false;
      if (controller) {
        controller.stop();
      }
    };
  }, [pathname]);

  return {
    error,
    isEnabled,
    isReady,
    pathname,
  };
}
