import { OAUTH_PROVIDERS, type OAuthProvider, WEB3_PROVIDERS, type Web3Provider } from '@clerk/types';

export const DESCRIPTORS = [
  // Alert
  'alert',
  'alertError',
  'alertWarning',
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
  ...[...OAUTH_PROVIDERS, ...WEB3_PROVIDERS].map(({ provider }) => `buttonConnection__${provider}`),

  // Connection
  'connectionList',
  'connectionListItem',

  // Field
  'fieldRoot',
  'fieldLabel',
  'fieldLabelEnd',
  'fieldHint',
  'fieldCheckbox',
  'fieldInputGroup',
  'fieldInputGroupEnd',
  'fieldInput',
  'fieldInputDefault',
  'fieldInputOtp',
  'fieldInputIdle',
  'fieldInputInfo',
  'fieldInputError',
  'fieldInputSuccess',
  'fieldInputWarning',
  'fieldMessageStart',
  'fieldMessageCenter',
  'fieldMessageEnd',
  'fieldMessage',
  'fieldMessageIdle',
  'fieldMessageInfo',
  'fieldMessageError',
  'fieldMessageSuccess',
  'fieldMessageWarning',

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
