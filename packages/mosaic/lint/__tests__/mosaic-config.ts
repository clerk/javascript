import type { RuleTester } from 'oxlint/plugins-dev';

import config from '../../oxlint.config.mjs';

type Options = NonNullable<RuleTester.ValidTestCase['options']>;
type JsonValue = Options[number];

export type Override = {
  files: readonly string[];
  excludeFiles: readonly string[] | undefined;
  rules: Readonly<Record<string, unknown>>;
};

export const settings = config.settings;

export const rules: Readonly<Record<string, unknown>> = { ...config.rules };

export const overrides: readonly Override[] = (config.overrides ?? []).map(override => ({
  files: override.files,
  excludeFiles: override.excludeFiles,
  rules: { ...override.rules },
}));

export function findOverride(matches: (override: Override) => boolean): Override {
  const override = overrides.find(matches);
  if (!override) {
    throw new Error('No override matches');
  }
  return override;
}

export function ruleOptions(override: Override, rule: string): Options {
  const setting = override.rules[rule];
  if (!Array.isArray(setting)) {
    return [];
  }
  if (!setting.every(isJsonValue)) {
    throw new Error(`${rule} has options that are not JSON`);
  }
  return setting;
}

export function jsPluginSpecifier(name: string): string {
  for (const plugin of config.jsPlugins ?? []) {
    if (typeof plugin !== 'string' && plugin.name === name) {
      return plugin.specifier;
    }
  }
  throw new Error(`No JS plugin named ${name}`);
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }
  return typeof value === 'object' && Object.values(value).every(isJsonValue);
}
