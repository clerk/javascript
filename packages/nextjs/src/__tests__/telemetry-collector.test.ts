/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';

import { NextJSTelemetryCollector } from '../utils/telemetry-collector';

describe('Keyless Telemetry Integration', () => {
  test('NextJSTelemetryCollector can be instantiated and has the required interface', () => {
    const collector = new NextJSTelemetryCollector({
      publishableKey: 'pk_test_123',
    });

    // Verify it implements the telemetry collector interface
    expect(collector).toBeDefined();
    expect(typeof collector.record).toBe('function');
    expect(typeof collector.isEnabled).toBe('boolean');
    expect(typeof collector.isDebug).toBe('boolean');
  });

  test('collector handles events without throwing errors', () => {
    // Set up keyless environment
    (window as any).__clerk_keyless = true;

    const collector = new NextJSTelemetryCollector({
      publishableKey: 'pk_test_123',
      disabled: true, // Disable to avoid actual network calls
    });

    // These should not throw
    expect(() => {
      collector.record({
        event: 'COMPONENT_MOUNTED',
        payload: { component: 'SignIn' },
      });
    }).not.toThrow();

    expect(() => {
      collector.record({
        event: 'OTHER_EVENT',
        payload: {},
      });
    }).not.toThrow();

    // Clean up
    delete (window as any).__clerk_keyless;
  });

  test('boosts sampling for component-mounted events in keyless mode', () => {
    (window as any).__clerk_keyless = true;

    // Spy on underlying collector
    const records: any[] = [];
    vi.doMock('@clerk/shared/telemetry', async () => {
      const actual = await vi.importActual<any>('@clerk/shared/telemetry');
      return {
        ...actual,
        TelemetryCollector: class {
          isEnabled = true;
          isDebug = false;
          record(ev: any) {
            records.push(ev);
          }
        },
      };
    });

    // Re-require after mock
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NextJSTelemetryCollector: Collector } = require('../utils/telemetry-collector');
    const collector = new Collector({ publishableKey: 'pk_test_123' });

    collector.record({ event: 'COMPONENT_MOUNTED', payload: { component: 'SignIn' } });
    collector.record({ event: 'COMPONENT_MOUNTED', payload: { component: 'SignUp' }, eventSamplingRate: 0.1 });
    collector.record({ event: 'OTHER_EVENT', payload: {} });

    expect(records[0].eventSamplingRate).toBe(1);
    expect(records[1].eventSamplingRate).toBe(1);
    expect(records[2].eventSamplingRate).toBeUndefined();

    delete (window as any).__clerk_keyless;
    vi.resetModules();
  });
});
