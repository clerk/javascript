import { clerkFailedToLoadThirdPartyScript } from '@clerk/shared/internal/clerk-js/errors';
import { loadScript } from '@clerk/shared/loadScript';

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

interface PromptMomentNotification {
  getMomentType: () => 'display' | 'skipped' | 'dismissed';
}

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
export type { GISCredentialResponse };
