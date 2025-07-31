import { DebugLogger } from './logger';
import { type CompositeLoggerOptions, CompositeTransport } from './transports/composite';
import { ConsoleTransport } from './transports/console';
import { type TelemetryLoggerOptions, TelemetryTransport } from './transports/telemetry';
import type { DebugLogFilter, DebugLogLevel } from './types';

export type * from './types';

export { ConsoleTransport, TelemetryTransport, CompositeTransport };
export type { TelemetryLoggerOptions, CompositeLoggerOptions };

/**
 * Options for configuring a logger with endpoint, filters, and log level
 */
export interface LoggerOptions {
  endpoint?: string;
  filters?: DebugLogFilter[];
  logLevel?: DebugLogLevel;
}

/**
 * Options for configuring a console logger with filters and log level
 */
export interface ConsoleLoggerOptions {
  filters?: DebugLogFilter[];
  logLevel?: DebugLogLevel;
}

/**
 * Creates a composite logger with both console and telemetry transports
 * @param options - Configuration options for the logger
 * @returns Object containing the logger and composite transport
 */
export function createLogger(options: { endpoint?: string; logLevel?: DebugLogLevel; filters?: DebugLogFilter[] }) {
  const { endpoint, logLevel = 'info', filters } = options;

  return createCompositeLogger({
    transports: [{ transport: new ConsoleTransport() }, { transport: new TelemetryTransport(endpoint) }],
    logLevel,
    filters,
  });
}

/**
 * Creates a console-only logger
 * @param options - Configuration options for the console logger
 * @returns Object containing the logger and console transport
 */
export function createConsoleLogger(options: ConsoleLoggerOptions) {
  const { logLevel = 'info', filters } = options;
  const transport = new ConsoleTransport();
  const logger = new DebugLogger(transport, logLevel, filters);
  return { logger, transport };
}

/**
 * Creates a telemetry-only logger
 * @param options - Configuration options for the telemetry logger
 * @returns Object containing the logger and telemetry transport
 */
export function createTelemetryLogger(options: TelemetryLoggerOptions) {
  const { endpoint, logLevel = 'info', filters } = options;
  const transport = new TelemetryTransport(endpoint);
  const logger = new DebugLogger(transport, logLevel, filters);
  return { logger, transport };
}

/**
 * Creates a composite logger with multiple transports
 * @param options - Configuration options for the composite logger
 * @returns Object containing the logger and composite transport
 */
export function createCompositeLogger(options: CompositeLoggerOptions) {
  const { transports, logLevel = 'info', filters } = options;

  const transportInstances = transports.map(t => t.transport);
  const compositeTransport = new CompositeTransport(transportInstances);

  const logger = new DebugLogger(compositeTransport, logLevel, filters);
  return { logger, transport: compositeTransport };
}
