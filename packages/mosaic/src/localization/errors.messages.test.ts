import { enUS } from '@clerk/localizations';
import { describe, expect, it } from 'vitest';

import { errorMessages } from './errors.messages';

const legacyCodes: Readonly<Record<string, string>> = {
  api_key_name_already_exists: 'token_creation_conflict',
  api_key_usage_exceeded: 'token_quota_exceeded',
};

const unfillable = new Set(['already_a_member_in_organization']);

const paramsSupplied = new Set(['form_username_invalid_length']);

function legacyErrors(): [string, string][] {
  return Object.entries(enUS.unstable__errors ?? {}).flatMap(([key, value]) =>
    typeof value === 'string' && !unfillable.has(key) ? [[legacyCodes[key] ?? key, value]] : [],
  );
}

describe('errorMessages', () => {
  it.each(legacyErrors())('carries over the legacy copy for %s', (code, copy) => {
    expect(errorMessages[code]).toBe(copy.replace(/\{\{(\w+)\}\}/g, '{$1}'));
  });

  it('only asks for values its callers supply', () => {
    const needsValues = Object.entries(errorMessages)
      .filter(([, copy]) => /\{\w+\}/.test(copy))
      .map(([code]) => code);
    expect(needsValues.filter(code => !paramsSupplied.has(code))).toEqual([]);
  });
});
