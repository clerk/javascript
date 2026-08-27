import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type { ClerkAPIError } from '@clerk/shared/types';

/**
 * The details an application can attach to a blocked request. Every field is
 * optional; when none are present the screen falls back to its own wording and
 * shows only the reference.
 *
 * The text fields are plain text and are rendered as text nodes. They are
 * written by the application's owner, so they are treated as content, never as
 * markup.
 */
export type ActionBlockedDetails = {
  traceId?: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
};

/**
 * Reads the details off an API error, or returns null when the error carries
 * none — which is also what happens against an older backend that does not send
 * them. Callers use the null to fall back to the previous inline error, so a
 * missing field degrades rather than rendering a blank screen.
 */
export const getActionBlockedDetails = (error: ClerkAPIError | undefined): ActionBlockedDetails | null => {
  const meta = error?.meta as ActionBlockedDetails | undefined;
  if (!meta) {
    return null;
  }
  const { traceId, title, description, linkUrl, linkText } = meta;
  if (!traceId && !title && !description && !linkUrl) {
    return null;
  }
  return { traceId, title, description, linkUrl, linkText };
};

/**
 * The details for a blocked request, or null for anything else.
 *
 * This lives beside the card state rather than in the card, because a blocked
 * request is terminal wherever it arrives — the start card, the OAuth callback,
 * or a challenge submission that is then denied. Detecting it centrally is what
 * stops a screen offering "Retry" for something that cannot succeed.
 */
export const actionBlockedDetailsFrom = (metadata: unknown): ActionBlockedDetails | null => {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }
  if ((metadata as ClerkAPIError).code !== ERROR_CODES.FRAUD_ACTION_BLOCKED) {
    return null;
  }
  return getActionBlockedDetails(metadata as ClerkAPIError);
};

/**
 * Only `https` links are rendered.
 *
 * The URL is already checked before it is sent, so this is a second, local
 * check rather than the only one: it is what stands between a value that
 * reached the browser anyway and a `javascript:` or `data:` URI becoming an
 * `href`. A link that fails is dropped and the rest of the screen still renders.
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
