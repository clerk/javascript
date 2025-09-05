import type { TelemetryCollector } from '@clerk/shared/telemetry';

import type { DebugLogLevel } from '@/core/modules/debug/types';

/**
 * Lightweight logger surface that callers can import as a singleton.
 * Methods are no-ops until initialized via `initDebugLogger`.
 */
export interface DebugLogger {
  debug(message: string, context?: Record<string, unknown>, source?: string): void;
  error(message: string, context?: Record<string, unknown>, source?: string): void;
  info(message: string, context?: Record<string, unknown>, source?: string): void;
  warn(message: string, context?: Record<string, unknown>, source?: string): void;
}

type InitOptions = {
  enabled?: boolean;
  logLevel?: DebugLogLevel;
  telemetryCollector?: TelemetryCollector;
};

let isEnabled = false;
let realLogger: DebugLogger | null = null;
let initializationAttempted = false;

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
  if (!isEnabled) {
    return;
  }
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
      default:
        break;
    }
  }
  preInitBuffer.length = 0;
}

async function ensureInitialized(options?: Omit<InitOptions, 'enabled'>): Promise<void> {
  try {
    if (!isEnabled || realLogger) {
      return;
    }

    const { getDebugLogger } = await import('@/core/modules/debug');
    const logger = await getDebugLogger({
      logLevel: options?.logLevel,
      telemetryCollector: options?.telemetryCollector,
    });

    if (logger) {
      realLogger = logger;
      flushBuffered();
    }
  } catch (error) {
    try {
      console.debug?.('Debug logger initialization failed', error);
    } catch {
      void 0;
    }

    return;
  }
}

/**
 * @public
 * Initialize the global debug logger configuration once.
 *
 * @param options - Configuration options
 * @param options.enabled - Enables the logger; when false, logger is a no-op (default: false)
 * @param options.logLevel - Minimal level to log; lower-priority logs are ignored. Valid levels: 'error' | 'warn' | 'info' | 'debug'.
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
  if (initializationAttempted) {
    return;
  }

  const { enabled = false, ...rest } = options;
  if (!enabled) {
    return;
  }

  isEnabled = true;
  initializationAttempted = true;
  void ensureInitialized(rest);
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
export const debugLogger: Readonly<DebugLogger> = {
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
  warn(message: string, context?: Record<string, unknown>, source?: string): void {
    if (!realLogger) {
      pushBuffered('warn', message, context, source);
      return;
    }
    realLogger.warn(message, context, source);
  },
};
