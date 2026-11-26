import type { AuthPasswordRule } from '@clerk/mosaic/blocks/auth';
import type { SignInIdentifierField, SignInProvider } from '@clerk/mosaic/features/sign-in';
import type { SignUpFields, SignUpLegalConsent } from '@clerk/mosaic/features/sign-up';
import { createContext } from 'react';

export type AuthIdentifierSetting = 'email' | 'phone' | 'email-or-phone' | 'username';
export type AuthVerificationSetting = 'code' | 'link';
export type AuthPasswordPolicy = 'basic' | 'standard' | 'strict';
export type AuthNameSetting = 'off' | 'optional' | 'required';
export type AuthMethodsLayout = 'inline' | 'button';
export type AuthAddressChoice = 'ask' | 'primary';
export type AuthSignUpMode = 'public' | 'restricted' | 'waitlist';

export interface AuthConfig {
  identifier: AuthIdentifierSetting;
  verification: AuthVerificationSetting;
  password: boolean;
  passwordPolicy: AuthPasswordPolicy;
  names: AuthNameSetting;
  legalConsent: boolean;
  socialProviders: 0 | 1 | 2 | 3 | 5;
  outcome: 'normal' | 'blocked' | 'compromised' | 'no-methods';
  mode: AuthSignUpMode;
  combined: boolean;
  passkey: boolean;
  lastUsed: AuthLastUsed;
  twoStep: boolean;
  requireMfa: boolean;
  offerPasskey: boolean;
  organizationRequired: boolean;
  showLogo: boolean;
  logoStyle: 'icon' | 'wordmark';
  branding: boolean;
  emailFirst: boolean;
  addressChoice: AuthAddressChoice;
  methodsLayout: AuthMethodsLayout;
}

export type AuthLastUsed = 'none' | 'google' | 'passkey' | 'identifier';

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  identifier: 'email',
  verification: 'code',
  password: true,
  passwordPolicy: 'basic',
  names: 'required',
  legalConsent: true,
  socialProviders: 2,
  outcome: 'normal',
  mode: 'public',
  combined: true,
  passkey: true,
  lastUsed: 'none',
  twoStep: true,
  requireMfa: false,
  offerPasskey: false,
  organizationRequired: true,
  showLogo: true,
  logoStyle: 'icon',
  branding: true,
  emailFirst: false,
  addressChoice: 'ask',
  methodsLayout: 'inline',
};

export const AuthConfigContext = createContext<AuthConfig>(DEFAULT_AUTH_CONFIG);

export const BREACHED_PASSWORDS = new Set(['Password123!', 'Welcome1!', 'Qwerty123!']);

export const LEGAL_CONSENT: SignUpLegalConsent = {
  termsUrl: 'https://acme.com/terms',
  privacyPolicyUrl: 'https://acme.com/privacy',
};

const ALL_PROVIDERS: SignInProvider[] = [
  { id: 'oauth_google', name: 'Google', iconUrl: 'https://img.clerk.com/static/google.svg' },
  { id: 'oauth_github', name: 'GitHub', iconUrl: 'https://img.clerk.com/static/github.svg' },
  { id: 'oauth_apple', name: 'Apple', iconUrl: 'https://img.clerk.com/static/apple.svg' },
  { id: 'oauth_microsoft', name: 'Microsoft', iconUrl: 'https://img.clerk.com/static/microsoft.svg' },
  { id: 'oauth_x', name: 'X', iconUrl: 'https://img.clerk.com/static/x.svg' },
];

export const APPLICATION_LOGO_URL = 'https://avatars.githubusercontent.com/u/49538330?v=4';
export const WORDMARK_LOGO_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="132" height="32" viewBox="0 0 132 32"><rect width="32" height="32" rx="8" fill="#6C47FF"/><path d="M10 22l6-12 6 12" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="42" y="23" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#6C47FF">Acme</text></svg>',
)}`;

export function logoUrlFor(config: AuthConfig): string | undefined {
  if (!config.showLogo) {
    return undefined;
  }
  return config.logoStyle === 'wordmark' ? WORDMARK_LOGO_URL : APPLICATION_LOGO_URL;
}

export function providersFor(config: AuthConfig): SignInProvider[] {
  return ALL_PROVIDERS.slice(0, config.socialProviders);
}

export function passwordRulesFor(password: string, policy: AuthPasswordPolicy = 'standard'): AuthPasswordRule[] {
  const minLength = policy === 'strict' ? 12 : 8;
  const length = { id: 'length', label: `At least ${minLength} characters`, met: password.length >= minLength };
  if (policy === 'basic') {
    return [length];
  }
  const number = { id: 'number', label: 'A number', met: /\d/.test(password) };
  const symbol = { id: 'symbol', label: 'A symbol, like ! or #', met: /[^A-Za-z0-9]/.test(password) };
  if (policy === 'standard') {
    return [length, number, symbol];
  }
  return [
    length,
    { id: 'case', label: 'An uppercase and a lowercase letter', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    number,
    symbol,
  ];
}

export function signUpFinishFields(config: AuthConfig): SignUpFields {
  const fields: SignUpFields = {};
  if (config.names !== 'off') {
    fields.firstName = { required: config.names === 'required' };
    fields.lastName = { required: config.names === 'required' };
  }
  if (config.password) {
    fields.password = { required: true };
  }
  return fields;
}

export function hasFinishStep(config: AuthConfig): boolean {
  return Object.keys(signUpFinishFields(config)).length > 0;
}

interface SignUpFinishValues {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  legalAccepted: boolean;
}

export function signUpFinishErrors(
  values: SignUpFinishValues,
  config: AuthConfig = DEFAULT_AUTH_CONFIG,
  { checkLegal = true }: { checkLegal?: boolean } = {},
): Partial<Record<keyof SignUpFinishValues, string>> | undefined {
  const fields = signUpFinishFields(config);
  const errors: Partial<Record<keyof SignUpFinishValues, string>> = {};
  if (fields.firstName?.required && !values.firstName.trim()) {
    errors.firstName = 'Enter your first name.';
  }
  if (fields.lastName?.required && !values.lastName.trim()) {
    errors.lastName = 'Enter your last name.';
  }
  if (fields.username && values.username.trim().length < 4) {
    errors.username = 'Use at least 4 characters for your username.';
  }
  if (fields.password) {
    if (passwordRulesFor(values.password, config.passwordPolicy).some(rule => !rule.met)) {
      errors.password = 'Meet every requirement below.';
    } else if (BREACHED_PASSWORDS.has(values.password)) {
      errors.password = 'This password appeared in a data breach. Choose a different one.';
    }
  }
  if (checkLegal && config.legalConsent && !values.legalAccepted) {
    errors.legalAccepted = 'Accept the Terms and Privacy Policy to continue.';
  }
  return Object.keys(errors).length > 0 ? errors : undefined;
}

export function signInIdentifierFields(config: AuthConfig): SignInIdentifierField[] {
  switch (config.identifier) {
    case 'email':
      return ['email'];
    case 'phone':
      return ['phone'];
    case 'email-or-phone':
      return ['email', 'phone'];
    case 'username':
      return ['email-or-username'];
  }
}
