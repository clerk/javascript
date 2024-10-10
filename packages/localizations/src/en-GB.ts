/*
 * =====================================================================================
 * DISCLAIMER:
 * =====================================================================================
 * This localization file is a community contribution and is not officially maintained
 * by Clerk. It has been provided by the community and may not be fully aligned
 * with the current or future states of the main application. Clerk does not guarantee
 * the accuracy, completeness, or timeliness of the translations in this file.
 * Use of this file is at your own risk and discretion.
 * =====================================================================================
 */

import type { LocalizationResource } from '@clerk/types';

import { enUS } from './en-US';

export const enGB = translateResource(enUS, {
  'en-US': 'en-GB',
  authorize: 'authorise',
  Authorize: 'Authorise',
  organization: 'organisation',
  Organization: 'Organisation',
});

type Dictionary = Record<string, string>;

function translateResource(resource: LocalizationResource, dict: Dictionary): typeof resource {
  return Object.fromEntries(Object.entries(resource).map(([k, v]) => [k, translateResourceValue(v, dict)]));
}

type ResourceValue = string | undefined | { [key: string]: ResourceValue };

function translateResourceValue(value: ResourceValue, dict: Dictionary): typeof value {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value === 'string') {
    return value
      .split(' ')
      .map(v => translateWord(v, dict))
      .join(' ');
  }
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, translateResourceValue(v, dict)]));
}

function translateWord(word: string, dict: Dictionary): typeof word {
  return isTemplateVariable(word)
    ? word
    : Object.entries(dict).reduce((w, [from, to]) => w.replace(RegExp(from), to), word);
}

function isTemplateVariable(s: string): boolean {
  return /{{.+}}/.test(s);
}
