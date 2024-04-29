import 'cross-fetch/polyfill';

import { TelemetryCollector } from '../telemetry';
import { TelemetryClientCache } from '../telemetry/clientCache';

jest.useFakeTimers();

const TEST_PK = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';

describe('TelemetryCollector', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('does nothing when disabled', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const collector = new TelemetryCollector({
      disabled: true,
      publishableKey: TEST_PK,
    });

    collector.record({ event: 'TEST_EVENT', payload: {} });

    jest.runAllTimers();

    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  test('does nothing when CLERK_TELEMETRY_DISABLED is set', async () => {
    process.env.CLERK_TELEMETRY_DISABLED = '1';

    const fetchSpy = jest.spyOn(global, 'fetch');

    const collector = new TelemetryCollector({
      publishableKey: TEST_PK,
    });

    collector.record({ event: 'TEST_EVENT', payload: {} });

    jest.runAllTimers();

    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();

    process.env.CLERK_TELEMETRY_DISABLED = undefined;
  });

  test('does not send events when debug is enabled, logs them instead', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
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
    fetchSpy.mockRestore();
  });

  test('enables debug via environment variable', async () => {
    process.env.CLERK_TELEMETRY_DEBUG = '1';

    const fetchSpy = jest.spyOn(global, 'fetch');
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
    fetchSpy.mockRestore();

    process.env.CLERK_TELEMETRY_DEBUG = undefined;
  });

  test('sends events after a delay when buffer is not full', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const collector = new TelemetryCollector({
      publishableKey: TEST_PK,
    });

    collector.record({ event: 'TEST_EVENT', payload: {} });

    jest.runAllTimers();

    expect(fetchSpy).toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  test('sends events immediately when the buffer limit is reached', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const collector = new TelemetryCollector({
      maxBufferSize: 2,
      publishableKey: TEST_PK,
    });

    collector.record({ event: 'TEST_EVENT', payload: { method: 'useFoo' } });
    collector.record({ event: 'TEST_EVENT', payload: { method: 'useBar' } });

    expect(fetchSpy).toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  describe('with server-side sampling', () => {
    let windowSpy;

    beforeEach(() => {
      windowSpy = jest.spyOn(window, 'window', 'get');
    });

    afterEach(() => {
      windowSpy.mockRestore();
    });

    test('does not send events if the random seed does not exceed the event-specific sampling rate', async () => {
      windowSpy.mockImplementation(() => undefined);

      const fetchSpy = jest.spyOn(global, 'fetch');
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1);

      const collector = new TelemetryCollector({
        publishableKey: TEST_PK,
      });

      collector.record({ event: 'TEST_EVENT', eventSamplingRate: 0.01, payload: {} });

      jest.runAllTimers();

      expect(fetchSpy).not.toHaveBeenCalled();

      fetchSpy.mockRestore();
      randomSpy.mockRestore;
    });
  });

  describe('with client-side caching', () => {
    test('sends event when it is not in the cache', () => {
      const fetchSpy = jest.spyOn(global, 'fetch');

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
      const fetchSpy = jest.spyOn(global, 'fetch');
      const originalDateNow = Date.now;
      const cacheTtl = 86400000;

      let now = originalDateNow();
      jest.spyOn(Date, 'now').mockImplementation(() => now);

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

      expect(fetchSpy).toHaveBeenCalledTimes(2);

      fetchSpy.mockRestore();
    });

    test('does not send event when it is in the cache', () => {
      const fetchSpy = jest.spyOn(global, 'fetch');

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

      fetchSpy.mockRestore();
    });

    test('fallbacks to event-specific sampling rate when storage is not supported', () => {
      jest.spyOn(TelemetryClientCache.prototype, 'isStorageSupported', 'get').mockReturnValue(false);

      const fetchSpy = jest.spyOn(global, 'fetch');
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

      jest.runAllTimers();

      expect(fetchSpy).not.toHaveBeenCalled();

      fetchSpy.mockRestore();
      randomSpy.mockRestore;
    });
  });
});
