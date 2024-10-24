import type { LocalizationResource, LocalizationValue } from '@clerk/types';

import { enUS } from './en-US';

export const enGB = transformLocalizationResource(enUS, original => {
  const updated = original.split(' ').map(toBritish).join(' ');
  return updated !== original ? updated : undefined;
});

function toBritish(word: string) {
  if (isTemplateVariable(word)) {
    return word;
  } else {
    return word
      .replace(/en-US/, 'en-GB')
      .replace(/authorize/, 'authorise')
      .replace(/Authorize/, 'Authorise')
      .replace(/organization/, 'organisation')
      .replace(/Organization/, 'Organisation');
  }
}

function isTemplateVariable(s: string) {
  return s.match(/{{.+}}/);
}

type LocalizationValueReplacer = (v: LocalizationValue) => LocalizationValue | undefined;

function transformLocalizationResource(
  resource: LocalizationResource,
  replacer: LocalizationValueReplacer,
): LocalizationResource {
  return Object.fromEntries(
    Object.entries(resource).map(([k, v]) => [k, transformLocalizationResourceValue(v, replacer)] as const),
  );
}

type LocalizationResourceValue = LocalizationResource[keyof LocalizationResource];

function transformLocalizationResourceValue(
  value: LocalizationResourceValue,
  replacer: LocalizationValueReplacer,
): LocalizationResourceValue | undefined {
  if (value === null || value === undefined) {
    return value;
  } else if (typeof value === 'string') {
    return replacer(value);
  } else {
    const updatedEntries = Object.entries(value).map(
      ([k, v]) => [k, transformLocalizationResourceValue(v, replacer)] as const,
    );
    return Object.fromEntries(updatedEntries);
  }
}
