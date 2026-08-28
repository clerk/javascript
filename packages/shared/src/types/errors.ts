export interface ClerkAPIErrorJSON {
  code: string;
  message: string;
  long_message?: string;
  meta?: {
    param_name?: string;
    session_id?: string;
    email_addresses?: string[];
    identifiers?: string[];
    zxcvbn?: {
      suggestions: {
        code: string;
        message: string;
      }[];
    };
    plan?: {
      amount_formatted: string;
      annual_monthly_amount_formatted: string;
      currency_symbol: string;
      id: string;
      name: string;
    };
    is_plan_upgrade_possible?: boolean;
    seats_quantity_to_add?: number;
    seats_quantity?: number;
    trace_id?: string;
    kind?: string;
    title?: string;
    description?: string;
    link_url?: string;
    link_text?: string;
    data?: Record<string, string | number | boolean>;
  };
}

/**
 * An interface that represents an error returned by the Clerk API.
 */
export interface ClerkAPIError {
  /**
   * A string code that represents the error, such as `username_exists_code`.
   */
  code: string;
  /**
   * A message that describes the error.
   */
  message: string;
  /**
   * A more detailed message that describes the error.
   */
  longMessage?: string;
  /**
   * Additional information about the error.
   */
  meta?: {
    paramName?: string;
    sessionId?: string;
    emailAddresses?: string[];
    identifiers?: string[];
    zxcvbn?: {
      suggestions: {
        code: string;
        message: string;
      }[];
    };
    permissions?: string[];
    plan?: {
      amount_formatted: string;
      annual_monthly_amount_formatted: string;
      currency_symbol: string;
      id: string;
      name: string;
    };
    isPlanUpgradePossible?: boolean;
    seatsQuantityToAdd?: number;
    seatsQuantity?: number;
    /**
     * A short reference for the request that produced this error. It is shown to
     * the end user so they can quote it when contacting support.
     *
     * Treat it as an opaque string: do not parse it, reformat it, or assume a
     * length.
     */
    traceId?: string;
    /**
     * A tag naming why the request was blocked, configured by the application's
     * owner — for example `vpn_detected`.
     *
     * Opaque, and never rendered by the built-in screen. It exists so an
     * application can switch on it and render its own UI instead.
     */
    kind?: string;
    /**
     * A heading for the error, configured by the application's owner.
     *
     * Plain text. Render it as text, never as HTML or markdown.
     */
    title?: string;
    /**
     * A description of the error, configured by the application's owner.
     *
     * Plain text. Render it as text, never as HTML or markdown.
     */
    description?: string;
    /**
     * An `https` URL the end user can follow for help, configured by the
     * application's owner. Verify the scheme before using it as an `href`.
     */
    linkUrl?: string;
    /**
     * The label for `linkUrl`. Only ever set when `linkUrl` is set.
     */
    linkText?: string;
    /**
     * Arbitrary values the application's owner attached to this rule.
     *
     * Passed through untouched and **never rendered** by the built-in screen —
     * it is here for an application rendering its own UI (usually keyed off
     * `kind`). Values are strings, numbers or booleans; there is no nesting.
     *
     * It is visible to whoever was blocked, so it should not carry anything
     * sensitive.
     */
    data?: Record<string, string | number | boolean>;
  };
}

export interface ClerkRuntimeError {
  code: string;
  message: string;
}

/**
 * Interface representing a Clerk API Response Error.
 */
export interface ClerkAPIResponseError extends Error {
  clerkError: true;
  status: number;
  message: string;
  clerkTraceId?: string;
  retryAfter?: number;
  errors: ClerkAPIError[];
}
