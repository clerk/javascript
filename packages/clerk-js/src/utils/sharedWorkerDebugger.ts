/**
 * SharedWorker Debugging Utility
 * Helps diagnose issues with SharedWorker initialization and communication
 */

export interface SharedWorkerDebugInfo {
  isSupported: boolean;
  canCreateWorker: boolean;
  workerError?: string;
  messageTestPassed: boolean;
  scriptUrl: string;
  testResults: {
    workerCreation: 'success' | 'error';
    portConnection: 'success' | 'error';
    messageRoundTrip: 'success' | 'error' | 'timeout';
    errorDetails?: string;
  };
}

export class SharedWorkerDebugger {
  private testTimeoutMs = 5000;

  /**
   * Performs comprehensive SharedWorker debugging
   */
  public async diagnoseSharedWorker(scriptUrl: string): Promise<SharedWorkerDebugInfo> {
    const debugInfo: SharedWorkerDebugInfo = {
      isSupported: typeof SharedWorker !== 'undefined',
      canCreateWorker: false,
      messageTestPassed: false,
      scriptUrl,
      testResults: {
        workerCreation: 'error',
        portConnection: 'error',
        messageRoundTrip: 'error',
      },
    };

    console.log('🔍 [SharedWorker Debug] Starting diagnostic...');
    console.log(`📍 [SharedWorker Debug] Script URL: ${scriptUrl}`);
    console.log(`✅ [SharedWorker Debug] Browser support: ${debugInfo.isSupported}`);

    if (!debugInfo.isSupported) {
      console.error('❌ [SharedWorker Debug] SharedWorker not supported in this browser');
      return debugInfo;
    }

    try {
      // Test 1: Worker Creation
      console.log('🔄 [SharedWorker Debug] Test 1: Creating SharedWorker...');
      const worker = new SharedWorker(scriptUrl);
      debugInfo.canCreateWorker = true;
      debugInfo.testResults.workerCreation = 'success';
      console.log('✅ [SharedWorker Debug] Test 1: SharedWorker created successfully');

      // Test 2: Port Connection
      console.log('🔄 [SharedWorker Debug] Test 2: Testing port connection...');
      worker.port.start();
      debugInfo.testResults.portConnection = 'success';
      console.log('✅ [SharedWorker Debug] Test 2: Port connected successfully');

      // Test 3: Message Round Trip
      console.log('🔄 [SharedWorker Debug] Test 3: Testing message round trip...');
      const messageTest = await this.testMessageRoundTrip(worker);
      debugInfo.messageTestPassed = messageTest.success;
      debugInfo.testResults.messageRoundTrip = messageTest.success ? 'success' : 'error';

      if (messageTest.success) {
        console.log('✅ [SharedWorker Debug] Test 3: Message round trip successful');
      } else {
        console.error('❌ [SharedWorker Debug] Test 3: Message round trip failed:', messageTest.error);
        debugInfo.testResults.errorDetails = messageTest.error;
      }

      // Clean up
      worker.port.close();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [SharedWorker Debug] Worker creation failed:', errorMessage);
      debugInfo.workerError = errorMessage;
      debugInfo.testResults.errorDetails = errorMessage;
    }

    console.log('🏁 [SharedWorker Debug] Diagnostic complete:', debugInfo);
    return debugInfo;
  }

  /**
   * Tests message round trip with the SharedWorker
   */
  private testMessageRoundTrip(worker: SharedWorker): Promise<{ success: boolean; error?: string }> {
    return new Promise(resolve => {
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Message round trip timeout' });
      }, this.testTimeoutMs);

      const testMessage = {
        type: 'debug_test',
        payload: {
          timestamp: Date.now(),
          testId: Math.random().toString(36).substring(7),
        },
      };

      worker.port.onmessage = event => {
        clearTimeout(timeout);

        if (event.data.type === 'debug_test_response') {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: `Unexpected response: ${JSON.stringify(event.data)}` });
        }
      };

      worker.port.onmessageerror = error => {
        clearTimeout(timeout);
        resolve({ success: false, error: `Message error: ${error}` });
      };

      worker.onerror = error => {
        clearTimeout(timeout);
        resolve({ success: false, error: `Worker error: ${error.message || 'Unknown worker error'}` });
      };

      console.log('📤 [SharedWorker Debug] Sending test message:', testMessage);
      worker.port.postMessage(testMessage);
    });
  }

  /**
   * Quick check for common SharedWorker issues
   */
  public static quickDiagnosis(): void {
    console.log('🔍 [SharedWorker Debug] Quick Diagnosis:');
    console.log(`  - SharedWorker support: ${typeof SharedWorker !== 'undefined'}`);
    console.log(`  - Current origin: ${location.origin}`);
    console.log(`  - Protocol: ${location.protocol}`);
    console.log(`  - Is HTTPS: ${location.protocol === 'https:'}`);
    console.log(`  - Is localhost: ${location.hostname === 'localhost' || location.hostname === '127.0.0.1'}`);

    if (location.protocol === 'file:') {
      console.warn('⚠️  [SharedWorker Debug] file:// protocol detected - SharedWorkers may not work');
    }

    if (typeof SharedWorker === 'undefined') {
      console.error('❌ [SharedWorker Debug] SharedWorker is not supported in this browser');
    }
  }
}

/**
 * Enhanced debugging for existing SharedWorker instances
 */
export function debugExistingSharedWorker(worker: SharedWorker | null, tabId: string): void {
  console.log('🔍 [SharedWorker Debug] Analyzing existing SharedWorker...');
  console.log(`  - Worker instance: ${worker ? 'exists' : 'null'}`);
  console.log(`  - Tab ID: ${tabId}`);

  if (worker) {
    console.log('📤 [SharedWorker Debug] Sending debug ping...');
    worker.port.postMessage({
      type: 'debug_ping',
      payload: {
        tabId,
        timestamp: Date.now(),
        action: 'debug_status_check',
      },
    });
  }
}

// Add global debugging functions for easy console access
declare global {
  interface Window {
    clerkDebugSharedWorker?: () => void;
    clerkSharedWorkerDiagnostic?: (scriptUrl?: string) => Promise<SharedWorkerDebugInfo>;
  }
}

if (typeof window !== 'undefined') {
  window.clerkDebugSharedWorker = () => SharedWorkerDebugger.quickDiagnosis();
  window.clerkSharedWorkerDiagnostic = async (scriptUrl = '/clerk-shared-worker.js') => {
    const sharedWorkerDebugger = new SharedWorkerDebugger();
    return await sharedWorkerDebugger.diagnoseSharedWorker(scriptUrl);
  };
}
