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

// PromptMomentNotification methods
// See: https://developers.google.com/identity/gsi/web/reference/js-reference#PromptMomentNotification
interface PromptMomentNotification {
  // Moment type detection
  getMomentType?: () => 'display' | 'skipped' | 'dismissed';

  // Display moment methods - NOT supported when FedCM is enabled
  isDisplayMoment?: () => boolean;
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

  // Skipped moment methods - partially supported in FedCM (no user_cancel reason)
  isSkippedMoment?: () => boolean;
  getSkippedReason?: () => 'auto_cancel' | 'user_cancel' | 'tap_outside' | 'issuing_failed';

  // Dismissed moment methods - fully supported in FedCM
  isDismissedMoment?: () => boolean;
  getDismissedReason?: () => 'credential_returned' | 'cancel_called' | 'flow_restarted';
}

interface OneTapMethods {
  initialize: (params: InitializeProps) => void;
  prompt: (promptListener?: (notification: PromptMomentNotification) => void) => void;
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
