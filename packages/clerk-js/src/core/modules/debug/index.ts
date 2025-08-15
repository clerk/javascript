import type { TelemetryCollector } from '@clerk/shared/telemetry';

import { DebugLogger } from './logger';
import { CompositeTransport } from './transports/composite';
import { ConsoleTransport } from './transports/console';
import { TelemetryTransport } from './transports/telemetry';
import type { DebugLogFilter, DebugLogLevel } from './types';

const DEFAULT_LOG_LEVEL: DebugLogLevel = 'info';

/**
 * Validates logger options
 */
function validateLoggerOptions<T extends { logLevel?: unknown }>(options: T): void {
  if (options.logLevel && typeof options.logLevel !== 'string') {
    throw new Error('logLevel must be a string');
  }
}

/**
 * Options for configuring the debug logger.
 */
export interface LoggerOptions {
  /** Optional URL to which telemetry logs will be sent. */
  endpoint?: string;
  /** Optional array of filters to control which logs are emitted. */
  filters?: DebugLogFilter[];
  /** Minimum log level to capture. */
  logLevel?: DebugLogLevel;
  /** Optional collector instance for custom telemetry handling. */
  telemetryCollector?: TelemetryCollector;
}

/**
 * Options for console-only logger configuration.
 */
export interface ConsoleLoggerOptions {
  /** Optional array of filters to control which logs are emitted. */
  filters?: DebugLogFilter[];
  /** Minimum log level to capture. */
  logLevel?: DebugLogLevel;
}

/**
 * Configuration options for a telemetry-based debug logger.
 */
export interface TelemetryLoggerOptions {
  /** Optional URL to which telemetry logs will be sent. */
  endpoint?: string;
  /** Optional array of filters to control which logs are emitted. */
  filters?: DebugLogFilter[];
  /** Minimum log level to capture. */
  logLevel?: DebugLogLevel;
  /** Optional collector instance for custom telemetry handling. */
  telemetryCollector?: TelemetryCollector;
}

/**
 * Options for composite logger configuration.
 */
export interface CompositeLoggerOptions {
  /** Optional array of filters to control which logs are emitted. */
  filters?: DebugLogFilter[];
  /** Minimum log level to capture. */
  logLevel?: DebugLogLevel;
  /** Collection of transports used by the composite logger. */
  transports: Array<{ transport: ConsoleTransport | TelemetryTransport }>;
}

/**
 * Manages a singleton instance of the debug logger.
 *
 * Ensures only one logger is initialized and provides access to it.
 * Handles asynchronous initialization and configuration.
 */
class DebugLoggerManager {
  private static instance: DebugLoggerManager;
  private initialized = false;
  private logger: DebugLogger | null = null;
  private initializationPromise: Promise<DebugLogger | null> | null = null;

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): DebugLoggerManager {
    if (!DebugLoggerManager.instance) {
      DebugLoggerManager.instance = new DebugLoggerManager();
    }
    return DebugLoggerManager.instance;
  }

  /**
   * Initialize the debug logger with the given options
   *
   * @param options - Configuration options for the logger
   * @returns Promise resolving to the debug logger instance
   */
  async initialize(options: LoggerOptions = {}): Promise<DebugLogger | null> {
    if (this.initialized) {
      return this.logger;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization(options);
    return this.initializationPromise;
  }

  /**
   * Performs the actual initialization logic
   *
   * @param options - Configuration options for the logger
   * @returns Promise resolving to the debug logger instance
   */
  private async performInitialization(options: LoggerOptions): Promise<DebugLogger | null> {
    try {
      validateLoggerOptions(options);
      const { logLevel, filters, telemetryCollector } = options;
      const finalLogLevel = logLevel ?? DEFAULT_LOG_LEVEL;

      const transports = [
        { transport: new ConsoleTransport() },
        { transport: new TelemetryTransport(telemetryCollector) },
      ];

      const transportInstances = transports.map(t => t.transport);
      const compositeTransport = new CompositeTransport(transportInstances);
      const logger = new DebugLogger(compositeTransport, finalLogLevel, filters);

      this.logger = logger;
      this.initialized = true;
      return this.logger;
    } catch (error) {
      console.error('Failed to initialize debug module:', error);
      this.initializationPromise = null;
      return null;
    }
  }

  /**
   * Gets the current logger instance
   */
  getLogger(): DebugLogger | null {
    return this.logger;
  }

  /**
   * Checks if the debug logger is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Resets the initialization state
   */
  reset(): void {
    this.initialized = false;
    this.logger = null;
    this.initializationPromise = null;
  }
}

/**
 * Gets or initializes the debug logger
 *
 * @param options - Configuration options for the logger
 * @returns Promise resolving to the debug logger instance
 */
export async function getDebugLogger(options: LoggerOptions = {}): Promise<DebugLogger | null> {
  const manager = DebugLoggerManager.getInstance();
  return manager.initialize(options);
}

/**
 * Creates a composite logger with both console and telemetry transports
 * @param options - Configuration options for the logger
 * @returns Object containing the logger and composite transport
 */
export function createLogger(options: {
  endpoint?: string;
  logLevel?: DebugLogLevel;
  filters?: DebugLogFilter[];
  telemetryCollector?: TelemetryCollector;
}): { logger: DebugLogger; transport: CompositeTransport } | null {
  try {
    validateLoggerOptions(options);
    const { logLevel, filters, telemetryCollector } = options;
    const finalLogLevel = logLevel ?? DEFAULT_LOG_LEVEL;

    return createCompositeLogger({
      transports: [{ transport: new ConsoleTransport() }, { transport: new TelemetryTransport(telemetryCollector) }],
      logLevel: finalLogLevel,
      filters,
    });
  } catch (error) {
    console.error('Failed to create logger:', error);
    return null;
  }
}

/**
 * Creates a console-only logger
 *
 * @param options - Configuration options for the console logger
 * @returns Object containing the logger and console transport
 */
export function createConsoleLogger(
  options: ConsoleLoggerOptions,
): { logger: DebugLogger; transport: ConsoleTransport } | null {
  try {
    validateLoggerOptions(options);
    const { logLevel, filters } = options;
    const finalLogLevel = logLevel ?? DEFAULT_LOG_LEVEL;
    const transport = new ConsoleTransport();
    const logger = new DebugLogger(transport, finalLogLevel, filters);
    return { logger, transport };
  } catch (error) {
    console.error('Failed to create console logger:', error);
    return null;
  }
}

/**
 * Creates a telemetry-only logger
 *
 * @param options - Configuration options for the telemetry logger
 * @returns Object containing the logger and telemetry transport
 */
export function createTelemetryLogger(
  options: TelemetryLoggerOptions,
): { logger: DebugLogger; transport: TelemetryTransport } | null {
  try {
    validateLoggerOptions(options);
    const { logLevel, filters, telemetryCollector } = options;
    const finalLogLevel = logLevel ?? DEFAULT_LOG_LEVEL;
    const transport = new TelemetryTransport(telemetryCollector);
    const logger = new DebugLogger(transport, finalLogLevel, filters);
    return { logger, transport };
  } catch (error) {
    console.error('Failed to create telemetry logger:', error);
    return null;
  }
}

/**
 * Creates a composite logger with multiple transports
 *
 * @param options - Configuration options for the composite logger
 * @returns Object containing the logger and composite transport
 */
export function createCompositeLogger(
  options: CompositeLoggerOptions,
): { logger: DebugLogger; transport: CompositeTransport } | null {
  try {
    validateLoggerOptions(options);
    const { transports, logLevel, filters } = options;
    const finalLogLevel = logLevel ?? DEFAULT_LOG_LEVEL;

    const transportInstances = transports.map(t => t.transport);
    const compositeTransport = new CompositeTransport(transportInstances);
    const logger = new DebugLogger(compositeTransport, finalLogLevel, filters);

    return { logger, transport: compositeTransport };
  } catch (error) {
    console.error('Failed to create composite logger:', error);
    return null;
  }
}

/**
 * Reset the debug logger
 *
 * @internal
 */
export function __internal_resetDebugLogger(): void {
  const manager = DebugLoggerManager.getInstance();
  manager.reset();
}
