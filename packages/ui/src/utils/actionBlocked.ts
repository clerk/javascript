import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type { ClerkAPIError } from '@clerk/shared/types';

/**
 * What an application can attach to a blocked request. Every field is optional. The text fields
 * are plain text, written by the application's owner, and are rendered as text, never as markup.
 */
export type ActionBlockedDetails = {
  traceId?: string;
  /** For custom flows to switch on. Never rendered by the built-in screen. */
  kind?: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
  /** For custom flows. Never rendered by the built-in screen. */
  data?: Record<string, string | number | boolean>;
};

/**
 * Reads the details off an API error, or returns null when it carries nothing the screen can show,
 * so the caller falls back to the inline error.
 */
export const getActionBlockedDetails = (error: ClerkAPIError | undefined): ActionBlockedDetails | null => {
  const meta = error?.meta as ActionBlockedDetails | undefined;
  if (!meta) {
    return null;
  }
  const { traceId, kind, title, description, linkUrl, linkText, data } = meta;
  if (!traceId && !title && !description && !linkUrl) {
    return null;
  }
  return { traceId, kind, title, description, linkUrl, linkText, data };
};

/**
 * The details for a blocked request, or null for any other error. A card that renders
 * `ActionBlockedCard` calls this on `card.rawError`; a card that does not keeps its inline error.
 */
export const actionBlockedDetailsFrom = (error: unknown): ActionBlockedDetails | null => {
  if (!error || typeof error !== 'object') {
    return null;
  }
  if ((error as ClerkAPIError).code !== ERROR_CODES.FRAUD_ACTION_BLOCKED) {
    return null;
  }
  return getActionBlockedDetails(error as ClerkAPIError);
};

/**
 * Only `https` links become an `href`. The URL is validated before it is sent too; this is the
 * check that stops a `javascript:` or `data:` URI that arrived anyway.
 */
export const safeHref = (url: string | undefined): string | null => {
  if (!url) {
    return null;
  }
  try {
    return new URL(url).protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
};
