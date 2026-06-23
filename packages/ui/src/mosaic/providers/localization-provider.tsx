import { atom, browser, createI18n, defineLocalization, localeFrom } from '@clerk/i18n';
import { useStore } from '@clerk/i18n/react';
import { createContextAndHook } from '@clerk/shared/react';
import type { BillingMoneyAmount } from '@clerk/shared/types';
import React, { useMemo, useRef } from 'react';

import type {
  CurrencyFormatFn,
  CurrencyFormatOptions,
  FlatOverrides,
  I18n,
  NestedOverrides,
  Registry,
  ResolvedOverrides,
  WritableStore,
} from '@clerk/i18n';

interface LocalizationValue {
  i18n: I18n;
  $locale: WritableStore<string | null>;
  $overrides: WritableStore<ResolvedOverrides>;
}

const [LocalizationCtx, useLocalization] = createContextAndHook<LocalizationValue>('LocalizationContext');

export interface LocalizationProviderProps<R extends Registry = Registry> {
  /** Active locale — seeds the store; browser detection applies when unset. */
  locale?: string;
  /** Fallback when neither `locale` nor a browser language matches. Defaults to 'en'. */
  defaultLocale?: string;
  /** Locales the app ships translations for. */
  locales?: string[];
  /** Consumer overrides from the appearance / localization layer. */
  overrides?: NestedOverrides<R> | FlatOverrides<R>;
  /** Server-loaded translations (locale → namespace → messages) for SSR seeding. */
  initialMessages?: Record<string, Record<string, Record<string, unknown>>>;
  children: React.ReactNode;
}

export function LocalizationProvider<R extends Registry = Registry>({
  locale,
  defaultLocale = 'en',
  locales = ['en'],
  overrides,
  initialMessages,
  children,
}: LocalizationProviderProps<R>) {
  // Built once per provider instance — per-request isolation for SSR.
  // Seed $explicit so the first render is correct; no useEffect needed.
  const value = useMemo(() => {
    const $explicit = atom<string | null>(locale ?? null);
    const $overrides = atom<ResolvedOverrides>(
      overrides ? defineLocalization(overrides as NestedOverrides<Registry>) : {},
    );
    const $locale = localeFrom($explicit, browser({ available: locales, fallback: defaultLocale }));
    const i18n = createI18n($locale, {
      get: () => Promise.resolve({}),
      overrides: $overrides,
      cache: initialMessages,
    });
    return { i18n, $locale: $explicit, $overrides };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync controlled props → atoms during render (derived-state pattern, no effect needed).
  // locale: primitive comparison against atom's current value is sufficient.
  const nextLocale = locale ?? null;
  if (value.$locale.get() !== nextLocale) {
    value.$locale.set(nextLocale);
  }

  // overrides: defineLocalization() returns a new object every call, so compare
  // the prop reference — not the resolved value — to avoid spurious updates.
  const prevOverridesRef = useRef(overrides);
  if (prevOverridesRef.current !== overrides) {
    prevOverridesRef.current = overrides;
    value.$overrides.set(overrides ? defineLocalization(overrides as NestedOverrides<Registry>) : {});
  }

  return <LocalizationCtx.Provider value={{ value }}>{children}</LocalizationCtx.Provider>;
}

/** Read a namespace's messages within the nearest LocalizationProvider. */
export function useMessages<B extends Record<string, unknown>>(namespace: string, base: B) {
  const { i18n } = useLocalization();
  // $messages must be stable for useSyncExternalStore; i18n is stable per provider instance.
  const $messages = useMemo(() => i18n(namespace, base), [i18n]);
  return useStore($messages);
}

export function formatBillingAmount(
  formatCurrency: CurrencyFormatFn,
  amount: BillingMoneyAmount,
  opts?: CurrencyFormatOptions,
) {
  return formatCurrency(amount.amount, amount.currency, opts);
}
