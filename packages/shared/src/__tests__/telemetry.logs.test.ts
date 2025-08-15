import 'cross-fetch/polyfill';

import { TelemetryCollector } from '../telemetry';

jest.useFakeTimers();

const TEST_PK = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';

describe('TelemetryCollector.recordLog', () => {
  let fetchSpy: jest.SpyInstance;
  let windowSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
    windowSpy = jest.spyOn(window, 'window', 'get');
  });

  afterEach(() => {
    windowSpy.mockRestore();
    fetchSpy.mockRestore();
  });

  test('sends a valid log with normalized timestamp and sanitized context', () => {
    const collector = new TelemetryCollector({ publishableKey: TEST_PK });

    const ts = Date.now();
    collector.recordLog({
      level: 'info',
      message: 'Hello world',
      timestamp: ts,
      context: { a: 1, b: undefined, c: () => {} },
    } as any);

    jest.runAllTimers();

    expect(fetchSpy).toHaveBeenCalled();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toMatch('/v1/logs');

    const initOptions = init as RequestInit;
    expect(typeof initOptions.body).toBe('string');
    const body = JSON.parse(initOptions.body as string);
    expect(Array.isArray(body.logs)).toBe(true);
    expect(body.logs).toHaveLength(1);

    const log = body.logs[0];
    expect(log.lvl).toBe('info');
    expect(log.msg).toBe('Hello world');
    expect(log.iid).toBeUndefined();
    expect(log.ts).toBe(new Date(ts).toISOString());
    expect(log.pk).toBe(TEST_PK);
    // Function and undefined stripped out
    expect(log.payload).toEqual({ a: 1 });
  });

  test('nullifies context when missing, non-object, array, or circular', () => {
    const collector = new TelemetryCollector({ publishableKey: TEST_PK });

    const base = {
      level: 'error' as const,
      message: 'msg',
      timestamp: Date.now(),
    };

    // undefined context
    fetchSpy.mockClear();
    collector.recordLog({ ...base, context: undefined } as any);
    jest.runAllTimers();
    const initOptions1 = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(typeof initOptions1.body).toBe('string');
    let body = JSON.parse(initOptions1.body as string);
    expect(body.logs[0].payload).toBeNull();

    // array context
    fetchSpy.mockClear();
    collector.recordLog({ ...base, context: [1, 2, 3] } as any);
    jest.runAllTimers();
    const initOptions2 = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(typeof initOptions2.body).toBe('string');
    body = JSON.parse(initOptions2.body as string);
    expect(body.logs[0].payload).toBeNull();

    // circular context
    fetchSpy.mockClear();
    const circular: any = { foo: 'bar' };
    circular.self = circular;
    collector.recordLog({ ...base, context: circular } as any);
    jest.runAllTimers();
    const initOptions3 = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(typeof initOptions3.body).toBe('string');
    body = JSON.parse(initOptions3.body as string);
    expect(body.logs[0].payload).toBeNull();
  });

  test('drops invalid entries: missing id, invalid level, empty message, invalid timestamp', () => {
    const collector = new TelemetryCollector({ publishableKey: TEST_PK });

    // invalid level
    fetchSpy.mockClear();
    collector.recordLog({
      level: 'fatal' as unknown as any,
      message: 'ok',
      timestamp: Date.now(),
    } as any);
    jest.runAllTimers();
    expect(fetchSpy).not.toHaveBeenCalled();

    // empty message
    fetchSpy.mockClear();
    collector.recordLog({
      level: 'debug',
      message: '',
      timestamp: Date.now(),
    });
    jest.runAllTimers();
    expect(fetchSpy).not.toHaveBeenCalled();

    // invalid timestamp (NaN)
    fetchSpy.mockClear();
    collector.recordLog({
      level: 'warn',
      message: 'ok',
      timestamp: Number.NaN,
    });
    jest.runAllTimers();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('accepts parsable timestamp strings', () => {
    const collector = new TelemetryCollector({ publishableKey: TEST_PK });
    const tsString = new Date().toISOString();

    collector.recordLog({
      level: 'trace',
      message: 'ts string',
      // @ts-expect-error testing runtime acceptance of string timestamps
      timestamp: tsString,
    });

    jest.runAllTimers();
    expect(fetchSpy).toHaveBeenCalled();
    const initOptions4 = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(typeof initOptions4.body).toBe('string');
    const body = JSON.parse(initOptions4.body as string);
    expect(body.logs[0].ts).toBe(new Date(tsString).toISOString());
  });
});
