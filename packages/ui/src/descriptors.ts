import type { OAuthProvider, Web3Provider } from '@clerk/types';

export const DESCRIPTORS = [
  // Alert
  'alert',
  'alert__error',
  'alert__warning',
  'alertIcon',

  // Button
  'button',
  'buttonPrimary',
  'buttonSecondary',
  'buttonConnection',
  'buttonPrimaryDefault',
  'buttonSecondaryDefault',
  'buttonConnectionDefault',
  'buttonDisabled',
  'buttonBusy',
  'buttonText',
  'buttonTextVisuallyHidden',
  'buttonIcon',
  'buttonIconStart',
  'buttonIconEnd',
  'buttonSpinner',

  // Connection
  'connectionList',
  'connectionListItem',

  // Separator
  'separator',

  // Spinner
  'spinner',

  // Card
  'cardRoot',
  'cardRootDefault',
  'cardRootInner',
  'cardHeader',
  'cardContent',
  'cardTitle',
  'cardDescription',
  'cardBody',
  'cardActions',
  'cardFooter',
  'cardFooterAction',
  'cardFooterActionText',
  'cardFooterActionLink',
  'cardFooterActionButton',
  'cardFooterActionPageLink',
  'cardLogoBox',
  'cardLogoLink',
  'cardLogoImage',
] as const;

type Provider = OAuthProvider | Web3Provider;

/**
 * Union of all valid descriptors used throughout the components.
 */
export type DescriptorIdentifier = (typeof DESCRIPTORS)[number] | `buttonConnection__${Provider}`;
