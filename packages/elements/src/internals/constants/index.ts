export const SSO_CALLBACK_PATH_ROUTE = '/sso-callback';
export const MAGIC_LINK_VERIFY_PATH_ROUTE = '/verify';

export const SIGN_IN_DEFAULT_BASE_PATH = '/sign-in';
export const SIGN_UP_DEFAULT_BASE_PATH = '/sign-up';

// The version that Next added support for the window.history.pushState and replaceState APIs.
// ref: https://nextjs.org/blog/next-14-1#windowhistorypushstate-and-windowhistoryreplacestate
export const NEXT_WINDOW_HISTORY_SUPPORT_VERSION = '14.1.0';

export const SEARCH_PARAMS = {
  createdSession: '__clerk_created_session',
  handshake: '__clerk_handshake',
  help: '__clerk_help',
  invitationToken: '__clerk_invitation_token',
  modalState: '__clerk_modal_state',
  satelliteUrl: '__clerk_satellite_url',
  status: '__clerk_status',
  synced: '__clerk_synced',
  ticket: '__clerk_ticket',
  transfer: '__clerk_transfer',
} as const;

export const RESENDABLE_COUNTDOWN_DEFAULT = 60;

export const CAPTCHA_ELEMENT_ID = 'clerk-captcha';
