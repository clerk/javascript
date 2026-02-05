import { loadScript } from '@clerk/shared/loadScript';

import { clerkFailedToLoadThirdPartyScript } from '../core/errors';

interface GISCredentialResponse {
  credential: string;
}

interface InitializeProps {
  client_id: string;
  callback: (params: GISCredentialResponse) => void;
  itp_support?: boolean;
  cancel_on_tap_outside?: boolean;
  auto_select?: boolean;
  use_fedcm_for_prompt?: boolean;
}

// Legacy (deprecated in FedCM mode)
interface PromptMomentNotification {
  getMomentType?: () => 'display' | 'skipped' | 'dismissed';
}

// FedCM-compatible
interface FedCMNotification {
  isDisplayed?: () => boolean;
  isNotDisplayed?: () => boolean;
  getNotDisplayedReason?: () =>
    | 'browser_not_supported'
    | 'invalid_client'
    | 'missing_client_id'
    | 'opt_out_or_no_session'
    | 'secure_http_required'
    | 'suppressed_by_user'
    | 'unregistered_origin'
    | 'unknown_reason';
  isSkippedMoment?: () => boolean;
  getSkippedReason?: () => 'auto_cancel' | 'user_cancel' | 'tap_outside' | 'issuing_failed';
}

// Unified type supporting both
type PromptNotification = PromptMomentNotification & FedCMNotification;

interface OneTapMethods {
  initialize: (params: InitializeProps) => void;
  prompt: (promptListener: (promptMomentNotification: PromptNotification) => void) => void;
  cancel: () => void;
}

interface Accounts {
  id: OneTapMethods;
}

interface Google {
  accounts: Accounts;
}

declare global {
  export interface Window {
    google?: Google;
  }
}

async function loadGIS() {
  if (!window.google) {
    try {
      await loadScript('https://accounts.google.com/gsi/client', { defer: true });
    } catch {
      // Rethrow with specific message
      clerkFailedToLoadThirdPartyScript('Google Identity Services');
    }
  }
  return window.google as Google;
}

export { loadGIS };
export type { GISCredentialResponse };
