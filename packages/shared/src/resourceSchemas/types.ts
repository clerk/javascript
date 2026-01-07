import type { Errors } from '../types/state';

/**
 * Property definition with default value for SSR safety.
 * Used by StateProxy to generate property getters with fallback values.
 */
export interface PropertyDef<T = unknown> {
  default: T;
}

/**
 * Schema for a signal-backed resource.
 * Provides a single source of truth for both clerk-js (signal creation)
 * and clerk-react (StateProxy generation).
 */
export interface ResourceSchema<TFields extends Record<string, unknown>> {
  /**
   * Resource key (e.g., 'signIn', 'signUp').
   * Used as the property name in hook return values.
   */
  name: string;

  /**
   * Resource lifecycle type:
   * - 'singleton': Created once in State, independent of Client (e.g., Waitlist)
   * - 'client-based': Tied to Client resource lifecycle (e.g., SignIn, SignUp)
   * - 'keyed': Multiple instances, cached by parameters (e.g., Checkout)
   */
  resourceType: 'singleton' | 'client-based' | 'keyed';

  /**
   * Error fields with null defaults.
   * Used by both clerk-js (errorsToParsedErrors) and clerk-react (default errors).
   */
  errorFields: TFields;

  /**
   * Property definitions with defaults.
   * Used by StateProxy to generate property getters with SSR-safe fallback values.
   */
  properties: Record<string, PropertyDef>;

  /**
   * Top-level method names.
   * Used by StateProxy to generate gated method wrappers.
   */
  methods: readonly string[];

  /**
   * Nested method groups (e.g., emailCode: ['sendCode', 'verifyCode']).
   * Used by StateProxy to generate nested method wrappers.
   */
  nestedMethods?: Record<string, readonly string[]>;
}

/**
 * Create default Errors<T> object from error fields.
 * Used to generate SSR-safe default error state.
 */
export function createDefaultErrors<T extends Record<string, unknown>>(fields: T): Errors<T> {
  const fieldDefaults = {} as T;
  for (const key in fields) {
    (fieldDefaults as Record<string, unknown>)[key] = null;
  }
  return { fields: fieldDefaults, raw: null, global: null };
}
