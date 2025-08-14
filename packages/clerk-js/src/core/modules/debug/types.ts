/**
 * Debug logging levels for different types of information
 */
export type DebugLogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * Valid debug log levels
 */
export const VALID_LOG_LEVELS: readonly DebugLogLevel[] = ['error', 'warn', 'info', 'debug', 'trace'] as const;

/**
 * Valid debug event types
 */
export const VALID_EVENT_TYPES: readonly DebugEventType[] = ['navigation', 'custom_event'] as const;

/**
 * Debug event types that can be tracked
 */
export type DebugEventType = 'navigation' | 'custom_event';

/**
 * Base interface for all debug log entries
 */
export interface DebugLogEntry {
  readonly context?: Record<string, unknown>;
  readonly level: DebugLogLevel;
  readonly message: string;
  readonly organizationId?: string;
  readonly sessionId?: string;
  readonly source?: string;
  readonly timestamp: number;
  readonly userId?: string;
}

/**
 * Debug data structure for sending debug information to endpoints
 */
export interface DebugData {
  readonly error?: ErrorDetails;
  readonly eventId: string;
  readonly eventType: DebugEventType;
  readonly metadata?: Record<string, unknown>;
  readonly organizationId?: string;
  readonly sessionId?: string;
  readonly timestamp: number;
  readonly userId?: string;
}

/**
 * Transport interface for sending debug log entries to different destinations
 */
export interface DebugTransport {
  /**
   * Send a single debug log entry
   */
  send(entry: DebugLogEntry): Promise<void>;
}

/**
 * Error details for debugging purposes
 */
export interface ErrorDetails {
  readonly cause?: unknown;
  readonly code?: string | number;
  readonly columnNumber?: number;
  readonly lineNumber?: number;
  readonly message: string;
  readonly name: string;
  readonly stack?: string;
  readonly url?: string;
}

/**
 * Configuration options for the debug logger
 */
export interface DebugLoggerConfig {
  readonly bufferSize: number;
  readonly filters?: DebugLogFilter[];
  readonly flushInterval: number;
  readonly logLevel: DebugLogLevel;
  readonly maxLogEntries: number;
  readonly transport?: DebugTransport;
}

/**
 * Filter configuration for debug logs
 */
export interface DebugLogFilter {
  readonly excludePatterns?: (string | RegExp)[];
  readonly includePatterns?: (string | RegExp)[];
  readonly level?: DebugLogLevel;
  readonly sessionId?: string;
  readonly source?: string | RegExp;
  readonly userId?: string;
}

/**
 * Validates if a value is a valid debug log level
 */
export function isValidLogLevel(level: unknown): level is DebugLogLevel {
  return typeof level === 'string' && VALID_LOG_LEVELS.includes(level as DebugLogLevel);
}

/**
 * Validates if a value is a valid debug event type
 */
export function isValidEventType(eventType: unknown): eventType is DebugEventType {
  return typeof eventType === 'string' && VALID_EVENT_TYPES.includes(eventType as DebugEventType);
}

/**
 * Type guard for checking if an object is a DebugLogEntry
 */
export function isDebugLogEntry(obj: unknown): obj is DebugLogEntry {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'timestamp' in obj &&
    'level' in obj &&
    'message' in obj &&
    typeof (obj as DebugLogEntry).timestamp === 'number' &&
    typeof (obj as DebugLogEntry).level === 'string' &&
    isValidLogLevel((obj as DebugLogEntry).level) &&
    typeof (obj as DebugLogEntry).message === 'string'
  );
}

/**
 * Type guard for checking if an object is DebugData
 */
export function isDebugData(obj: unknown): obj is DebugData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'eventType' in obj &&
    'eventId' in obj &&
    'timestamp' in obj &&
    typeof (obj as DebugData).eventType === 'string' &&
    isValidEventType((obj as DebugData).eventType) &&
    typeof (obj as DebugData).eventId === 'string' &&
    typeof (obj as DebugData).timestamp === 'number'
  );
}

/**
 * Utility type for creating partial debug logger configurations
 */
export type PartialDebugLoggerConfig = Partial<DebugLoggerConfig>;

/**
 * Utility type for creating debug log entries without readonly constraint
 */
export type MutableDebugLogEntry = {
  -readonly [K in keyof DebugLogEntry]: DebugLogEntry[K];
};

/**
 * Utility type for creating debug data without readonly constraint
 */
export type MutableDebugData = {
  -readonly [K in keyof DebugData]: DebugData[K];
};
