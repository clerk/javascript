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

// FedCM-compatible (dismissed moment still works)
interface FedCMNotification {
  isDismissedMoment?: () => boolean;
  getDismissedReason?: () => 'credential_returned' | 'cancel' | 'flow_restarted' | 'tap_outside' | 'user_cancel';
  // Note: isSkippedMoment works but without detailed reasons
  isSkippedMoment?: () => boolean;
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
      // Add timestamp to prevent caching issues with updated FedCM endpoints
      const cacheBuster = `?cb=${Date.now()}`;
      await loadScript(`https://accounts.google.com/gsi/client${cacheBuster}`, { defer: true });
    } catch {
      // Rethrow with specific message
      clerkFailedToLoadThirdPartyScript('Google Identity Services');
    }
  }
  return window.google as Google;
}

export { loadGIS };
export type { GISCredentialResponse };
