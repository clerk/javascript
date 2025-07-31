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
 * Singleton instance for managing debug logger initialization
 */
class DebugLoggerManager {
  private static instance: DebugLoggerManager;
  private initialized = false;
  private logger: any = null;

  private constructor() {}

  /**
   * Gets the singleton instance
   */
  static getInstance(): DebugLoggerManager {
    if (!DebugLoggerManager.instance) {
      DebugLoggerManager.instance = new DebugLoggerManager();
    }
    return DebugLoggerManager.instance;
  }

  /**
   * Initializes the debug logger if not already initialized
   * @param options - Configuration options for the logger
   * @returns The debug logger instance
   */
  async initialize(options: LoggerOptions = {}): Promise<any> {
    if (this.initialized && this.logger) {
      return this.logger;
    }

    try {
      const { endpoint, logLevel = 'info', filters } = options;

      const transports = [{ transport: new ConsoleTransport() }, { transport: new TelemetryTransport(endpoint) }];

      const transportInstances = transports.map(t => t.transport);
      const compositeTransport = new CompositeTransport(transportInstances);
      const logger = new DebugLogger(compositeTransport, logLevel, filters);

      this.logger = logger;
      this.initialized = true;
      return this.logger;
    } catch (error) {
      console.error('Failed to initialize debug module:', error);
      return null;
    }
  }

  /**
   * Gets the current logger instance
   */
  getLogger(): any {
    return this.logger;
  }

  /**
   * Checks if the debug logger is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Resets the initialization state (for testing purposes)
   */
  reset(): void {
    this.initialized = false;
    this.logger = null;
  }
}

/**
 * Gets or initializes the debug logger
 * @param options - Configuration options for the logger
 * @returns Promise resolving to the debug logger instance
 */
export async function getDebugLogger(options: LoggerOptions = {}): Promise<any> {
  const manager = DebugLoggerManager.getInstance();
  return manager.initialize(options);
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

/**
 * @internal
 * Resets the debug logger manager (for testing purposes)
 */
export function __internal_resetDebugLogger(): void {
  DebugLoggerManager.getInstance().reset();
}
