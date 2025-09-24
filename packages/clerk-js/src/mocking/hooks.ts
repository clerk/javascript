import { useEffect, useState } from 'react';

import type { ClerkMockConfig } from './controller';
import { ClerkMockController } from './controller';

export function useClerkMocking(config?: ClerkMockConfig) {
  const [controller, setController] = useState<ClerkMockController | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeMocking = async () => {
      try {
        const mockController = new ClerkMockController(config);

        await mockController.start(config?.scenario);

        if (mounted) {
          setController(mockController);
          setIsReady(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize mocking'));
          setIsReady(false);
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
  }, []);

  const switchScenario = (scenario: string) => {
    if (controller) {
      try {
        controller.switchScenario(scenario);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to switch to scenario: ${scenario}`));
      }
    }
  };

  const getActiveScenario = () => {
    return controller?.getActiveScenario() || null;
  };

  const getScenarios = () => {
    return controller?.getScenarios() || [];
  };

  return {
    isReady,
    error,
    controller,
    switchScenario,
    getActiveScenario,
    getScenarios,
  };
}

/**
 * Hook for managing multiple mock scenarios
 * Useful for documentation sites with scenario switching
 */
export function useClerkMockScenarios(config?: ClerkMockConfig) {
  const { isReady, error, controller, switchScenario, getActiveScenario, getScenarios } = useClerkMocking(config);
  const [activeScenarioName, setActiveScenarioName] = useState<string | null>(null);

  const handleScenarioSwitch = (scenarioName: string) => {
    switchScenario(scenarioName);
    setActiveScenarioName(scenarioName);
  };

  const scenarios = getScenarios();
  const activeScenario = getActiveScenario();

  return {
    isReady,
    error,
    scenarios,
    activeScenario,
    activeScenarioName,
    switchScenario: handleScenarioSwitch,
    controller,
  };
}
