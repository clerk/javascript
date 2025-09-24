import { ClerkMockController } from '../src/mocking/controller';
import { ClerkMockScenarios } from '../src/mocking/scenarios';

let mockController: ClerkMockController | null = null;
let isMockingEnabled = false;

export interface MockingControls {
  initializeMocking: () => Promise<void>;
  updateMockingStatus: () => void;
}

export async function setupMockingControls(): Promise<MockingControls> {
  const enableMockingCheckbox = document.getElementById('enableMocking') as HTMLInputElement;
  const scenarioSelect = document.getElementById('mockScenarioSelect') as HTMLSelectElement;
  const resetMockingBtn = document.getElementById('resetMockingBtn');

  const savedMockingEnabled = sessionStorage.getItem('mockingEnabled') === 'true';
  const savedScenario = sessionStorage.getItem('mockScenario') || 'user-button-signed-in';

  enableMockingCheckbox.checked = savedMockingEnabled;
  scenarioSelect.value = savedScenario;

  const updateMockingStatus = () => {
    const mockStatusIndicator = document.getElementById('mockStatusIndicator');
    const mockStatusText = document.getElementById('mockStatusText');

    if (mockStatusIndicator && mockStatusText) {
      if (isMockingEnabled) {
        mockStatusIndicator.className = 'h-2 w-2 rounded-full bg-green-500';
        mockStatusText.textContent = 'Mocking enabled';
        mockStatusText.className = 'text-sm font-medium text-green-600';
      } else {
        mockStatusIndicator.className = 'h-2 w-2 rounded-full bg-gray-400';
        mockStatusText.textContent = 'Mocking disabled';
        mockStatusText.className = 'text-sm font-medium text-gray-600';
      }
    }
  };

  const initializeMocking = async () => {
    if (!enableMockingCheckbox.checked) {
      if (mockController) {
        mockController.stop();
        mockController = null;
        isMockingEnabled = false;
      }
      updateMockingStatus();
      return;
    }

    try {
      mockController = new ClerkMockController({
        scenario: scenarioSelect.value || undefined,
      });

      mockController.registerScenario(ClerkMockScenarios.userButtonSignedIn());
      mockController.registerScenario(ClerkMockScenarios.userProfileBarebones());

      await mockController.start(scenarioSelect.value || undefined);
      isMockingEnabled = true;
      updateMockingStatus();
    } catch (error) {
      console.error('Failed to initialize mocking:', error);
      const mockStatusIndicator = document.getElementById('mockStatusIndicator');
      const mockStatusText = document.getElementById('mockStatusText');

      if (mockStatusIndicator && mockStatusText) {
        mockStatusIndicator.className = 'h-2 w-2 rounded-full bg-red-500';
        mockStatusText.textContent = 'Mocking failed to initialize';
        mockStatusText.className = 'text-sm font-medium text-red-600';
      }
    }
  };

  enableMockingCheckbox.addEventListener('change', () => {
    sessionStorage.setItem('mockingEnabled', enableMockingCheckbox.checked.toString());
    void initializeMocking();
  });

  scenarioSelect.addEventListener('change', () => {
    console.log(`🔧 Scenario changed to: ${scenarioSelect.value}, Mocking enabled: ${isMockingEnabled}`);
    sessionStorage.setItem('mockScenario', scenarioSelect.value);
    if (isMockingEnabled) {
      try {
        mockController?.switchScenario(scenarioSelect.value);
        updateMockingStatus();
        console.log(`🔧 Switched to scenario: ${scenarioSelect.value}`);

        window.location.reload();
      } catch (error) {
        console.error('Failed to switch scenario:', error);
      }
    } else {
      console.log('🔧 Mocking is disabled, scenario change ignored');
    }
  });

  resetMockingBtn?.addEventListener('click', () => {
    enableMockingCheckbox.checked = false;
    scenarioSelect.value = '';

    sessionStorage.removeItem('mockingEnabled');
    sessionStorage.removeItem('mockScenario');

    if (mockController) {
      mockController.stop();
      mockController = null;
      isMockingEnabled = false;
    }
    updateMockingStatus();
  });

  if (savedMockingEnabled) {
    await initializeMocking();
  } else {
    updateMockingStatus();
  }

  return { initializeMocking, updateMockingStatus };
}

export function isMockingActive(): boolean {
  return isMockingEnabled;
}

export function getMockController(): ClerkMockController | null {
  return mockController;
}
