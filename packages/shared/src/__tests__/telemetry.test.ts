import { TelemetryCollector } from '../telemetry';

jest.useFakeTimers();

describe('TelemetryCollector', () => {
  test('does nothing when disabled', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const collector = new TelemetryCollector({
      disabled: true,
      publishableKey: 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk',
    });

    collector.record('TEST_EVENT', {});

    jest.runAllTimers();

    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  test('does not send events when debug is enabled, logs them instead', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    const consoleSpy = jest.spyOn(global.console, 'log');

    const collector = new TelemetryCollector({
      debug: true,
      publishableKey: 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk',
    });

    collector.record('TEST_EVENT', {});

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

    consoleSpy.mockRestore();
    fetchSpy.mockRestore();
  });

  test('sends events after a delay when buffer is not full', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const collector = new TelemetryCollector({
      publishableKey: 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk',
    });

    collector.record('TEST_EVENT', {});

    jest.runAllTimers();

    expect(fetchSpy).toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  test('sends events immediately when the buffer limit is reached', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const collector = new TelemetryCollector({
      maxBufferSize: 2,
      publishableKey: 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk',
    });

    collector.record('TEST_EVENT', {});
    collector.record('TEST_EVENT', {});

    expect(fetchSpy).toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
