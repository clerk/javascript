import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type { ClerkAPIError } from '@clerk/shared/types';

export type ActionBlockedDetails = {
  traceId?: string;
  kind?: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
  data?: Record<string, string | number | boolean>;
};

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

export const actionBlockedDetailsFrom = (error: unknown): ActionBlockedDetails | null => {
  if (!error || typeof error !== 'object') {
    return null;
  }
  if ((error as ClerkAPIError).code !== ERROR_CODES.FRAUD_ACTION_BLOCKED) {
    return null;
  }
  return getActionBlockedDetails(error as ClerkAPIError);
};

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
