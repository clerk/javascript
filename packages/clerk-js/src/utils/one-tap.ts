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

// Legacy methods that are removed in FedCM mode
interface LegacyPromptMomentNotification {
  getMomentType: () => 'display' | 'skipped' | 'dismissed';
  // These methods are deprecated and will not work with FedCM enabled
  isDisplayMoment?: () => boolean;
  isDisplayed?: () => boolean;
  isNotDisplayed?: () => boolean;
  getNotDisplayedReason?: () => string;
  getSkippedReason?: () => string;
}

// FedCM-compatible methods (safe to use regardless of FedCM mode)
interface FedCMPromptMomentNotification {
  getMomentType: () => 'display' | 'skipped' | 'dismissed';
  // These methods continue to work with FedCM
  isSkippedMoment?: () => boolean;
  isDismissedMoment?: () => boolean;
  getDismissedReason?: () => string;
}

// Union type for backward compatibility
type PromptMomentNotification = LegacyPromptMomentNotification & FedCMPromptMomentNotification;

interface OneTapMethods {
  initialize: (params: InitializeProps) => void;
  prompt: (promptListener: (promptMomentNotification: PromptMomentNotification) => void) => void;
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
export type { GISCredentialResponse, PromptMomentNotification };
