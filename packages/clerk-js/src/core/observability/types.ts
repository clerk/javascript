/**
 * TypeScript types for Clerk Observability system
 * All observability types are kept local to clerk-js package
 */

/**
 * Configuration for observability trigger conditions
 */
export interface ObservabilityTriggerConfig {
  /**
   * Name of the cookie to check for enabling observability
   * @default 'clerk_observability'
   */
  cookieName?: string;
  /**
   * Key in sessionStorage to check for enabling observability
   * @default 'clerk_observability_enabled'
   */
  sessionStorageKey?: string;
  /**
   * Header name to check for enabling observability (set by SSR)
   * @default 'x-clerk-observability'
   */
  headerName?: string;
  /**
   * URL to load the full observability bundle from
   * @default Auto-generated from Clerk CDN
   */
  bundleUrl?: string;
  /**
   * Custom function to determine if observability should be enabled
   */
  customTrigger?: () => boolean;
}

/**
 * Public API for controlling observability
 */
export interface ObservabilityAPI {
  /**
   * Enable observability and trigger loading of the full system
   */
  enable: () => void;
  /**
   * Disable observability
   */
  disable: () => void;
  /**
   * Check if observability is currently enabled and loaded
   */
  isEnabled: () => boolean;
  /**
   * Get the observability instance (if loaded)
   */
  getInstance: () => any | null;
}

/**
 * Event data structure for observability tracking
 */
export interface ObservabilityEvent {
  /**
   * The type of event (e.g., 'auth.started', 'auth.completed', 'state.changed')
   */
  type: string;
  /**
   * Event payload data
   */
  data?: Record<string, any>;
  /**
   * Event severity level
   */
  severity?: 'low' | 'medium' | 'high' | 'critical';
  /**
   * Timestamp when event occurred
   */
  timestamp?: number;
  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Observability hook function signature
 */
export type ObservabilityHook = (event: ObservabilityEvent) => void;

/**
 * Minimal tracking interface used by Clerk methods
 */
export interface ObservabilityTracker {
  /**
   * Track an event (safe to call even if observability is not loaded)
   */
  track?: ObservabilityHook;
  /**
   * Check if tracking is enabled
   */
  isEnabled?: () => boolean;
  /**
   * Get total number of events captured
   */
  getEventCount?: () => number;
}

/**
 * Configuration passed to the full observability system when loaded
 */
export interface ObservabilitySystemConfig {
  /**
   * Enable/disable specific event types
   */
  eventFilters?: {
    auth?: boolean;
    navigation?: boolean;
    errors?: boolean;
    performance?: boolean;
    user_actions?: boolean;
  };
  /**
   * Maximum number of events to store in memory
   */
  maxEvents?: number;
  /**
   * URL to send events to (if remote tracking is enabled)
   */
  endpoint?: string;
  /**
   * Batch size for sending events
   */
  batchSize?: number;
  /**
   * Interval for sending batched events (in milliseconds)
   */
  flushInterval?: number;
  /**
   * Additional metadata to include with all events
   */
  globalMetadata?: Record<string, any>;
}
