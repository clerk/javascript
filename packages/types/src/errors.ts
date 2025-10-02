import type { ClientJSON } from './json';

export interface ClerkApiErrorResponseJSON {
  errors: ClerkAPIErrorJSON[];
  clerk_trace_id?: string;
  meta?: { client?: ClientJSON };
}

export interface ClerkAPIErrorJSON {
  code: string;
  message: string;
  long_message?: string;
  clerk_trace_id?: string;
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
  };
}
