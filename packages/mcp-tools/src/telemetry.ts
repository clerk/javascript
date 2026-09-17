export type ClerkMcpAuthFailureReason =
  | 'authentication_required'
  | 'malformed_bearer'
  | 'invalid_token'
  | 'verification_error'
  | 'missing_expiration'
  | 'expired'
  | 'audience_missing'
  | 'audience_mismatch'
  | 'insufficient_scope';

export type ClerkMcpTelemetryEvent =
  | { type: 'auth'; success: true }
  | { type: 'auth'; success: false; reason: ClerkMcpAuthFailureReason }
  | { type: 'tool'; tool: string; durationMs: number; success: boolean; error?: string }
  | {
      type: 'token_exchange';
      resource: string;
      durationMs: number;
      success: boolean;
      code?: string;
      /**
       * The token endpoint's HTTP status, when it answered.
       */
      status?: number;
    };

/**
 * Receives authentication, tool and token exchange outcomes. Events never contain tokens or secrets.
 */
export type ClerkMcpTelemetry = (event: ClerkMcpTelemetryEvent) => void;
