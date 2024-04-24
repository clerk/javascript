import 'cross-fetch/polyfill';

import { TelemetryCollector } from '../telemetry';

jest.useFakeTimers();

const TEST_PK = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';

describe('TelemetryCollector', () => {
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

    collector.record({ event: 'TEST_EVENT', payload: {} });
    collector.record({ event: 'TEST_EVENT', payload: {} });

    expect(fetchSpy).toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  test('does not send events if the random seed does not exceed the event-specific sampling rate', async () => {
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
