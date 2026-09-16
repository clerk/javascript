import React from 'react';

import type { MosaicLocalization } from './catalog';
import type { MosaicMessages } from './registry';
import { mosaicMessages } from './registry';

interface MosaicLocalizationValue {
  messages: MosaicMessages;
  locale: string;
}

const MosaicLocalizationContext = React.createContext<MosaicLocalizationValue>({
  messages: mosaicMessages,
  locale: 'en',
});

export const MosaicLocalizationProvider = MosaicLocalizationContext.Provider;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function merge(base: unknown, overrides: unknown): unknown {
  if (!isRecord(base) || !isRecord(overrides)) {
    return overrides ?? base;
  }
  let result = base;
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      continue;
    }
    const [head, ...rest] = key.split('.');
    const nested = rest.length > 0 ? { [rest.join('.')]: value } : value;
    result = { ...result, [head]: merge(result[head], nested) };
  }
  return result;
}

export function resolveLocalization(localization: MosaicLocalization | undefined): MosaicLocalizationValue {
  const layers = [localization?.messages, localization?.overrides];
  return {
    messages: layers.reduce<unknown>(merge, mosaicMessages) as MosaicMessages,
    locale: localization?.locale ?? 'en',
  };
}

export function useMessages<Namespace extends keyof MosaicMessages>(namespace: Namespace): MosaicMessages[Namespace] {
  return React.useContext(MosaicLocalizationContext).messages[namespace];
}

export function useLocale(): string {
  return React.useContext(MosaicLocalizationContext).locale;
}
