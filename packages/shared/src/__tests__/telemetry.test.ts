import 'cross-fetch/polyfill';

import type { TelemetryEvent } from '@clerk/types';
// @ts-ignore
import assert from 'assert';

import { TelemetryCollector } from '../telemetry';

jest.useFakeTimers();

const TEST_PK = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';

describe('TelemetryCollector', () => {
  let windowSpy;
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
    windowSpy = jest.spyOn(window, 'window', 'get');
  });

  afterEach(() => {
    windowSpy.mockRestore();
    fetchSpy.mockRestore();
  });

  test('does nothing when disabled', async () => {
    const collector = new TelemetryCollector({
      disabled: true,
      publishableKey: TEST_PK,
    });

    collector.record({ event: 'TEST_EVENT', payload: {} });

    jest.runAllTimers();

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('does nothing when CLERK_TELEMETRY_DISABLED is set', async () => {
    process.env.CLERK_TELEMETRY_DISABLED = '1';

    const collector = new TelemetryCollector({
      publishableKey: TEST_PK,
    });

    collector.record({ event: 'TEST_EVENT', payload: {} });

    jest.runAllTimers();

    expect(fetchSpy).not.toHaveBeenCalled();

    process.env.CLERK_TELEMETRY_DISABLED = undefined;
  });

  test('does not send events when debug is enabled, logs them instead', async () => {
    const consoleGroupSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const collector = new TelemetryCollector({
      debug: true,
      publishableKey: TEST_PK,
    });

    collector.record({ event: 'TEST_EVENT', payload: {} });

    jest.runAllTimers();

    expect(fetchSpy).not.toHaveBeenCalled();

    expect(consoleSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          {
            "cv": "",
            "event": "TEST_EVENT",
            "it": "development",
            "payload": {},
            "pk": "pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk",
            "sdk": undefined,
            "sdkv": undefined,
          },
        ],
      ]
    `);

    consoleGroupSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  test('enables debug via environment variable', async () => {
    process.env.CLERK_TELEMETRY_DEBUG = '1';

    const consoleGroupSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const collector = new TelemetryCollector({
      publishableKey: TEST_PK,
    });

    collector.record({ event: 'TEST_EVENT', payload: {} });

    jest.runAllTimers();

    expect(fetchSpy).not.toHaveBeenCalled();

    expect(consoleSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          {
            "cv": "",
            "event": "TEST_EVENT",
            "it": "development",
            "payload": {},
            "pk": "pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk",
            "sdk": undefined,
            "sdkv": undefined,
          },
        ],
      ]
    `);

    consoleGroupSpy.mockRestore();
    consoleSpy.mockRestore();

    process.env.CLERK_TELEMETRY_DEBUG = undefined;
  });

  test('sends events after a delay when buffer is not full', async () => {
    const collector = new TelemetryCollector({
      publishableKey: TEST_PK,
    });

    collector.record({ event: 'TEST_EVENT', payload: {} });

    jest.runAllTimers();

    expect(fetchSpy).toHaveBeenCalled();
  });

  test('sends events immediately when the buffer limit is reached', async () => {
    const collector = new TelemetryCollector({
      maxBufferSize: 2,
      publishableKey: TEST_PK,
    });

    collector.record({ event: 'TEST_EVENT', payload: { method: 'useFoo' } });
    collector.record({ event: 'TEST_EVENT', payload: { method: 'useBar' } });

    expect(fetchSpy).toHaveBeenCalled();
  });

  test('events are isolated between batches (no shared buffer reference)', () => {
    const collector = new TelemetryCollector({
      maxBufferSize: 2,
      publishableKey: TEST_PK,
    });
    const capturedBatches: TelemetryEvent[] = [];

    fetchSpy.mockImplementation((_, options) => {
      capturedBatches.push(JSON.parse(options.body).events);
      return Promise.resolve({ ok: true });
    });

    // First batch
    collector.record({ event: 'A', payload: { id: 1 } });
    collector.record({ event: 'B', payload: { id: 2 } });

    // Second batch
    collector.record({ event: 'C', payload: { id: 3 } });
    collector.record({ event: 'D', payload: { id: 4 } });

    // If there's a closure leak, events might be mixed or duplicated
    expect(capturedBatches[0]).toEqual([
      expect.objectContaining({ event: 'A', payload: { id: 1 } }),
      expect.objectContaining({ event: 'B', payload: { id: 2 } }),
    ]);

    expect(capturedBatches[1]).toEqual([
      expect.objectContaining({ event: 'C', payload: { id: 3 } }),
      expect.objectContaining({ event: 'D', payload: { id: 4 } }),
    ]);
  });

  describe('with server-side sampling', () => {
    test('does not send events if the random seed does not exceed the event-specific sampling rate', async () => {
      windowSpy.mockImplementation(() => undefined);

      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1);

      const collector = new TelemetryCollector({
        publishableKey: TEST_PK,
      });

      collector.record({ event: 'TEST_EVENT', eventSamplingRate: 0.01, payload: {} });

      jest.runAllTimers();

      expect(fetchSpy).not.toHaveBeenCalled();

      randomSpy.mockRestore();
    });

    test('ignores event-specific sampling rate when eventSampling is false', async () => {
      windowSpy.mockImplementation(() => undefined);

      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const collector = new TelemetryCollector({
        publishableKey: TEST_PK,
        samplingRate: 1.0, // Global sampling rate allows all events
        perEventSampling: false, // Disable event-specific sampling
      });

      // This event would normally be rejected due to low eventSamplingRate (0.1 < 0.5)
      // but should be sent because eventSampling is disabled
      collector.record({ event: 'TEST_EVENT', eventSamplingRate: 0.1, payload: {} });

      jest.runAllTimers();

      expect(fetchSpy).toHaveBeenCalled();

      randomSpy.mockRestore();
    });

    test('respects event-specific sampling rate when eventSampling is true (default)', async () => {
      windowSpy.mockImplementation(() => undefined);

      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const collector = new TelemetryCollector({
        publishableKey: TEST_PK,
        samplingRate: 1.0, // Global sampling rate allows all events
        perEventSampling: true, // Enable event-specific sampling (default)
      });

      // This event should be rejected due to low eventSamplingRate (0.1 < 0.5)
      collector.record({ event: 'TEST_EVENT', eventSamplingRate: 0.1, payload: {} });

      jest.runAllTimers();

      expect(fetchSpy).not.toHaveBeenCalled();

      randomSpy.mockRestore();
    });
  });

  describe('with client-side throttling', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('sends event when it is not in the cache', () => {
      const collector = new TelemetryCollector({
        publishableKey: TEST_PK,
      });

      collector.record({
        event: 'TEST_EVENT',
        payload: {
          foo: true,
        },
      });

      jest.runAllTimers();

      expect(fetchSpy).toHaveBeenCalled();

      fetchSpy.mockRestore();
    });

    test('sends event when it is in the cache but has expired', () => {
      const originalDateNow = Date.now;
      const cacheTtl = 86400000;

      let now = originalDateNow();
      const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now);

      const collector = new TelemetryCollector({
        publishableKey: TEST_PK,
        maxBufferSize: 1,
      });

      const event = 'TEST_EVENT';
      const payload = {
        foo: true,
      };

      collector.record({
        event,
        payload,
      });

      // Move time forward beyond the cache TTL
      now += cacheTtl + 1;

      collector.record({
        event,
        payload,
      });

      collector.record({
        event,
        payload,
      });

      jest.runAllTimers();

      expect(fetchSpy).toHaveBeenCalledTimes(2);

      dateNowSpy.mockRestore();
    });

    test('does not send event when it is in the cache', () => {
      const collector = new TelemetryCollector({
        publishableKey: TEST_PK,
      });

      const event = 'TEST_EVENT';

      collector.record({
        event,
        payload: {
          foo: true,
        },
      });

      collector.record({
        event,
        payload: {
          foo: true,
        },
      });

      jest.runAllTimers();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    test('fallbacks to event-specific sampling rate when storage is not supported', () => {
      windowSpy.mockImplementation(() => ({
        localStorage: undefined,
      }));

      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1);

      const collector = new TelemetryCollector({
        publishableKey: TEST_PK,
      });

      collector.record({
        event: 'TEST_EVENT',
        eventSamplingRate: 0.01,
        payload: {
          foo: true,
        },
      });

      expect(fetchSpy).not.toHaveBeenCalled();

      randomSpy.mockRestore();
    });

    test('generates unique key without credentials based on event payload', () => {
      const collector = new TelemetryCollector({
        publishableKey: TEST_PK,
      });

      const event: TelemetryEvent = {
        sk: '123',
        pk: TEST_PK,
        it: 'development',
        event: 'TEST_EVENT',
        cv: '0.1',
        sdkv: '0.1',
        payload: {
          foo: true,
        },
      };

      collector.record(event);
      collector.record(event);

      jest.runAllTimers();

      const item = localStorage.getItem('clerk_telemetry_throttler');
      assert(item);
      const expectedKey = '["","TEST_EVENT",true,"development",null,null]';

      expect(JSON.parse(item)[expectedKey]).toEqual(expect.any(Number));

      fetchSpy.mockRestore();
    });
  });
});
