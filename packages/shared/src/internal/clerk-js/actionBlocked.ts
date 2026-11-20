import type { ClerkAPIError } from '../../types';
import { ERROR_CODES } from './constants';

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
