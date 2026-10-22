import { isRecord } from './hydration';
import type { ProfileSettings } from './types';

function boolean(value: unknown): boolean {
  if (typeof value !== 'boolean') {
    throw new Error('Invalid Loom profile settings.');
  }
  return value;
}

function nameAttribute(value: unknown) {
  if (!isRecord(value)) {
    throw new Error('Invalid Loom profile attribute.');
  }
  return { enabled: boolean(value.enabled), required: boolean(value.required) };
}

function attribute(value: unknown) {
  if (!isRecord(value)) {
    throw new Error('Invalid Loom profile attribute.');
  }
  return {
    ...nameAttribute(value),
    immutable: boolean(value.immutable),
    usedForFirstFactor: boolean(value.usedForFirstFactor),
    usedForSecondFactor: boolean(value.usedForSecondFactor),
  };
}

function wireAttribute(value: unknown) {
  if (!isRecord(value)) {
    throw new Error('Invalid Loom profile attribute.');
  }
  return {
    enabled: value.enabled,
    required: value.required,
    immutable: value.immutable ?? false,
    usedForFirstFactor: value.used_for_first_factor,
    usedForSecondFactor: value.used_for_second_factor,
  };
}

export function profileSettingsSnapshot(value: unknown): ProfileSettings {
  if (!isRecord(value) || !Array.isArray(value.providers)) {
    throw new Error('Invalid Loom profile settings.');
  }
  const providers = value.providers.map((provider: unknown) => {
    if (
      !isRecord(provider) ||
      typeof provider.strategy !== 'string' ||
      !/^oauth_[a-z0-9_]+$/.test(provider.strategy) ||
      typeof provider.name !== 'string' ||
      !provider.name ||
      (provider.logoUrl !== null && typeof provider.logoUrl !== 'string')
    ) {
      throw new Error('Invalid Loom profile provider.');
    }
    if (provider.logoUrl !== null) {
      const url = new URL(provider.logoUrl);
      if (url.protocol !== 'https:' || url.username || url.password) {
        throw new Error('Invalid Loom profile provider logo.');
      }
    }
    return {
      strategy: provider.strategy,
      enabled: boolean(provider.enabled),
      name: provider.name,
      logoUrl: provider.logoUrl,
    };
  });
  if (new Set(providers.map(provider => provider.strategy)).size !== providers.length) {
    throw new Error('Duplicate Loom profile provider.');
  }
  return {
    firstName: nameAttribute(value.firstName),
    lastName: nameAttribute(value.lastName),
    username: attribute(value.username),
    emailAddress: attribute(value.emailAddress),
    passwordEnabled: boolean(value.passwordEnabled),
    enterpriseSsoEnabled: boolean(value.enterpriseSsoEnabled),
    providers,
  };
}

export function parseProfileSettings(payload: unknown): ProfileSettings {
  const environment = isRecord(payload) && 'response' in payload ? payload.response : payload;
  if (!isRecord(environment) || !isRecord(environment.user_settings)) {
    throw new Error('Invalid Loom environment response.');
  }
  const settings = environment.user_settings;
  if (
    !isRecord(settings.attributes) ||
    !isRecord(settings.social) ||
    !isRecord(settings.enterprise_sso) ||
    !isRecord(settings.attributes.password)
  ) {
    throw new Error('Invalid Loom environment settings.');
  }
  return profileSettingsSnapshot({
    firstName: settings.attributes.first_name,
    lastName: settings.attributes.last_name,
    username: wireAttribute(settings.attributes.username),
    emailAddress: wireAttribute(settings.attributes.email_address),
    passwordEnabled: settings.attributes.password.enabled,
    enterpriseSsoEnabled: settings.enterprise_sso.enabled,
    providers: Object.entries(settings.social).map(([strategy, provider]) => {
      if (!isRecord(provider) || provider.strategy !== strategy) {
        throw new Error('Invalid Loom environment provider.');
      }
      return { strategy, enabled: provider.enabled, name: provider.name, logoUrl: provider.logo_url ?? null };
    }),
  });
}
