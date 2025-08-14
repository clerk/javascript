import type { TelemetryCollector } from '@clerk/shared/telemetry';

import type { DebugLogFilter, DebugLogLevel } from '@/core/modules/debug/types';

/**
 * Lightweight logger surface that callers can import as a singleton.
 * Methods are no-ops until initialized via `initDebugLogger`.
 */
export interface DebugLoggerInterface {
  debug(message: string, context?: Record<string, unknown>, source?: string): void;
  error(message: string, context?: Record<string, unknown>, source?: string): void;
  info(message: string, context?: Record<string, unknown>, source?: string): void;
  trace(message: string, context?: Record<string, unknown>, source?: string): void;
  warn(message: string, context?: Record<string, unknown>, source?: string): void;
}

type InitOptions = {
  enabled?: boolean;
  filters?: DebugLogFilter[];
  logLevel?: DebugLogLevel;
  telemetryCollector?: TelemetryCollector;
};

let isEnabled = false;
let realLogger: DebugLoggerInterface | null = null;
let lastOptions: Omit<InitOptions, 'enabled'> | null = null;

type BufferedLogEntry = {
  level: DebugLogLevel;
  message: string;
  context?: Record<string, unknown>;
  source?: string;
  ts: number;
};

const MAX_BUFFERED_LOGS = 200;
const preInitBuffer: BufferedLogEntry[] = [];

function pushBuffered(level: DebugLogLevel, message: string, context?: Record<string, unknown>, source?: string): void {
  preInitBuffer.push({ level, message, context, source, ts: Date.now() });
  if (preInitBuffer.length > MAX_BUFFERED_LOGS) {
    preInitBuffer.shift();
  }
}

function flushBuffered(): void {
  if (!realLogger || preInitBuffer.length === 0) {
    return;
  }
  for (const entry of preInitBuffer) {
    const mergedContext = {
      ...(entry.context || {}),
      __preInit: true,
      __preInitTs: entry.ts,
    } as Record<string, unknown>;
    switch (entry.level) {
      case 'error':
        realLogger.error(entry.message, mergedContext, entry.source);
        break;
      case 'warn':
        realLogger.warn(entry.message, mergedContext, entry.source);
        break;
      case 'info':
        realLogger.info(entry.message, mergedContext, entry.source);
        break;
      case 'debug':
        realLogger.debug(entry.message, mergedContext, entry.source);
        break;
      case 'trace':
        realLogger.trace(entry.message, mergedContext, entry.source);
        break;
      default:
        break;
    }
  }
  preInitBuffer.length = 0;
}

async function ensureInitialized(): Promise<void> {
  try {
    if (!isEnabled || realLogger) {
      return;
    }

    const { getDebugLogger } = await import('@/core/modules/debug');
    const logger = await getDebugLogger({
      filters: lastOptions?.filters,
      logLevel: lastOptions?.logLevel ?? 'trace',
      telemetryCollector: lastOptions?.telemetryCollector,
    });

    if (logger) {
      realLogger = logger;
      flushBuffered();
    }
  } catch (error) {
    const message = 'Debug logger initialization failed';
    if (isEnabled && realLogger) {
      try {
        realLogger.trace(message, { error });
      } catch {
        // ignore secondary logging errors
      }
    } else {
      try {
        // Use a safe, minimal fallback to avoid noisy errors
        console.debug?.(message, error);
      } catch {
        // ignore secondary logging errors
      }
    }
    // Silently return to avoid unhandled rejections and preserve behavior
    return;
  }
}

/**
 * @public
 * Initialize or update the global debug logger configuration.
 *
 * Behavior:
 * - Safe to call multiple times; subsequent calls update options and re-initialize if needed
 * - When disabled, the logger becomes a no-op and any existing real logger is cleared
 * - Initialization happens asynchronously; errors are handled internally without throwing
 *
 * Options and defaults:
 * - options.enabled: defaults to true
 * - options.logLevel: defaults to 'trace'
 * - options.filters: optional include/exclude filters and matching rules
 * - options.telemetryCollector: optional telemetry sink to forward logs
 *
 * @param options - Configuration options
 * @param options.enabled - Enables the logger; when false, logger is a no-op (default: true)
 * @param options.filters - Filters applied to log entries (level, source, include/exclude patterns)
 * @param options.logLevel - Minimal level to log; lower-priority logs are ignored (default: 'trace')
 * @param options.telemetryCollector - Collector used by the debug transport for emitting telemetry
 *
 * @example
 * ```ts
 * import { initDebugLogger, debugLogger } from '@/utils/debug';
 *
 * initDebugLogger({ enabled: true, logLevel: 'info' });
 * debugLogger.info('Widget rendered', { widgetId: 'w1' }, 'ui');
 * ```
 */
export function initDebugLogger(options: InitOptions = {}): void {
  const { enabled = true, ...rest } = options;
  lastOptions = rest;
  isEnabled = Boolean(enabled);

  if (!isEnabled) {
    realLogger = null;
    return;
  }

  if (realLogger) {
    void (async () => {
      try {
        const { __internal_resetDebugLogger, getDebugLogger } = await import('@/core/modules/debug');
        __internal_resetDebugLogger();
        const logger = await getDebugLogger({
          filters: lastOptions?.filters,
          logLevel: lastOptions?.logLevel ?? 'trace',
          telemetryCollector: lastOptions?.telemetryCollector,
        });
        if (logger) {
          realLogger = logger;
          flushBuffered();
        }
      } catch (error) {
        try {
          console.debug?.('Debug logger reconfiguration failed', error);
        } catch {
          // ignore secondary logging errors
        }
      }
    })();
    return;
  }

  void ensureInitialized();
}

/**
 * Singleton debug logger surface.
 *
 * - No-op until `initDebugLogger` initializes the real logger
 * - Safe to import anywhere; all methods are guarded
 *
 * @example
 * ```ts
 * import { initDebugLogger, debugLogger } from '@/utils/debug';
 *
 * initDebugLogger({ enabled: true, logLevel: 'info' });
 * debugLogger.info('Loaded dashboard', { page: 'home' }, 'ui');
 * ```
 */
const baseDebugLogger: DebugLoggerInterface = {
  debug(message: string, context?: Record<string, unknown>, source?: string): void {
    if (!realLogger) {
      pushBuffered('debug', message, context, source);
      return;
    }
    realLogger.debug(message, context, source);
  },
  error(message: string, context?: Record<string, unknown>, source?: string): void {
    if (!realLogger) {
      pushBuffered('error', message, context, source);
      return;
    }
    realLogger.error(message, context, source);
  },
  info(message: string, context?: Record<string, unknown>, source?: string): void {
    if (!realLogger) {
      pushBuffered('info', message, context, source);
      return;
    }
    realLogger.info(message, context, source);
  },
  trace(message: string, context?: Record<string, unknown>, source?: string): void {
    if (!realLogger) {
      pushBuffered('trace', message, context, source);
      return;
    }
    realLogger.trace(message, context, source);
  },
  warn(message: string, context?: Record<string, unknown>, source?: string): void {
    if (!realLogger) {
      pushBuffered('warn', message, context, source);
      return;
    }
    realLogger.warn(message, context, source);
  },
};

export const debugLogger: Readonly<DebugLoggerInterface> = Object.freeze(baseDebugLogger);
