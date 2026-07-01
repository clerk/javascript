import { atom, computed, task } from 'nanostores';

import { createCurrencyFormatter } from '../currency';
import type { AnyMarker, Messages, PluralForms, ReadableStore, ResolvedOverrides } from '../types';

/** The override values for one namespace, keyed by message key. */
type Overrides = Record<string, unknown>;
/** A locale's data: namespace -> overrides. */
type NamespaceData = Record<string, Overrides>;
/** All loaded data: locale -> namespace -> overrides. */
type LocaleCache = Record<string, NamespaceData>;

export interface CreateI18nOptions {
  /** Load the data for a locale. May return a single object or several to merge. */
  get: (locale: string) => NamespaceData | NamespaceData[] | Promise<NamespaceData | NamespaceData[]>;
  /** Synchronously-available locale data, indexed by locale. */
  cache?: LocaleCache;
  /**
   * A reactive layer of consumer overrides (`namespace -> key -> value`),
   * applied on top of `base` and the fetched locale (user wins). Locale-agnostic
   * — the same overrides apply to every locale. Author with `defineLocalization`.
   */
  overrides?: ReadableStore<ResolvedOverrides>;
  /**
   * The locale the inline `base` definitions are written in. It is served
   * directly without a fetch. Defaults to `'en'`.
   */
  baseLocale?: string;
}

/**
 * A message store. Carries a back-reference to its `i18n` instance (so
 * `loadTranslations` can await that instance's loads) and its source `namespace`
 * + `base` (so `messagesToJSON` can serialize it).
 */
export type MessageStore<B extends Record<string, unknown>> = ReadableStore<Messages<B>> & {
  i18n: I18n;
  namespace: string;
  base: B;
};

/** The message-store factory returned by `createI18n`. */
export interface I18n {
  <B extends Record<string, unknown>>(namespace: string, base: B): MessageStore<B>;
  /** True while any locale load is in flight. Await it with `translationsLoading`. */
  loading: ReadableStore<boolean>;
}

/** Stable empty-overrides store, used when no `overrides` store is supplied. */
const NO_OVERRIDES = atom<ResolvedOverrides>({});

function asMarker(value: unknown): AnyMarker | null {
  return typeof value === 'object' && value !== null && '_type' in value ? (value as AnyMarker) : null;
}

export function createI18n($locale: ReadableStore<string>, options: CreateI18nOptions): I18n {
  const { get, cache = {}, overrides = NO_OVERRIDES, baseLocale = 'en' } = options;

  // Loaded locale data. Setting a fresh object is what drives dependent message
  // computeds to recompute — no manual invalidation counter needed.
  const $resolved = atom<LocaleCache>({ ...cache });
  const pending: Record<string, Promise<void>> = {};

  // Per-instance loading flag, true while any fetch is in flight. Awaited by
  // `translationsLoading`/`loadTranslations` so server-only rendering waits for
  // this instance only (unlike the global `allTasks`).
  const $loading = atom(false);
  let inFlight = 0;

  function fetchLocale(locale: string): Promise<void> {
    // `task()` registers the load with nanostores so `allTasks()` can await it
    // during SSR; the `pending` map keeps each locale to a single fetch.
    pending[locale] ??= task(() => {
      inFlight++;
      $loading.set(true);
      return (
        Promise.resolve()
          .then(() => get(locale))
          .then(data => {
            const chunks = Array.isArray(data) ? data : [data ?? {}];
            const merged = Object.create(null) as NamespaceData;
            for (const chunk of chunks) {
              for (const ns of Object.keys(chunk)) {
                merged[ns] = Object.assign(merged[ns] ?? Object.create(null), chunk[ns]);
              }
            }
            const next: LocaleCache = { ...$resolved.get() };
            next[locale] = { ...next[locale], ...merged };
            $resolved.set(next);
          })
          // A failed load leaves the locale unresolved (messages fall back to base).
          // Clear the slot so a later locale switch can retry instead of being
          // permanently poisoned by a single transient failure.
          .catch(() => {
            delete pending[locale];
          })
          .finally(() => {
            if (--inFlight === 0) {
              $loading.set(false);
            }
          })
      );
    });
    return pending[locale];
  }

  // Standing subscription: whenever the active locale is one we have not loaded
  // (and is not the base locale), fetch it. `subscribe` fires immediately, so the
  // initial locale is handled too.
  $locale.subscribe(locale => {
    if (locale !== baseLocale && !$resolved.get()[locale]) {
      void fetchLocale(locale);
    }
  });

  function buildEntry(locale: string, baseVal: unknown, override: unknown): unknown {
    const marker = asMarker(baseVal);

    if (marker?._type === 'params') {
      const tpl = typeof override === 'string' ? override : marker.template;
      return (args?: Record<string, string | number>) =>
        tpl.replace(/\{(\w+)\}/g, (_, key: string) => String(args?.[key] ?? ''));
    }

    if (marker?._type === 'count') {
      const rules = new Intl.PluralRules(locale);
      const forms: PluralForms =
        override && typeof override === 'object'
          ? { ...marker.forms, ...(override as Partial<PluralForms>) }
          : marker.forms;
      return (n: number) => {
        const tpl = forms[rules.select(n)] ?? forms.other;
        return tpl.replace(/\{count\}/g, String(n));
      };
    }

    if (marker?._type === 'currency') {
      return createCurrencyFormatter(locale);
    }

    if (marker?._type === 'count-params') {
      const rules = new Intl.PluralRules(locale);
      const forms: PluralForms =
        override && typeof override === 'object'
          ? { ...marker.forms, ...(override as Partial<PluralForms>) }
          : marker.forms;
      return (n: number, args?: Record<string, string | number>) => {
        const tpl = forms[rules.select(n)] ?? forms.other;
        return tpl.replace(/\{(\w+)\}/g, (_, key: string) => (key === 'count' ? String(n) : String(args?.[key] ?? '')));
      };
    }

    if (marker?._type === 'transform') {
      const tpl = typeof override === 'string' ? override : marker.template;
      return marker.fn(locale, tpl);
    }

    return typeof override === 'string' ? override : baseVal;
  }

  function buildMessages<B extends Record<string, unknown>>(
    locale: string,
    base: B,
    overridesForNamespace: Overrides | undefined,
  ): Messages<B> {
    const out: Record<string, unknown> = {};
    for (const key in base) {
      const baseVal = base[key];
      const override = overridesForNamespace?.[key];
      if (typeof baseVal === 'object' && baseVal !== null && !asMarker(baseVal)) {
        out[key] = buildMessages(locale, baseVal as Record<string, unknown>, override as Overrides | undefined);
      } else {
        out[key] = buildEntry(locale, baseVal, override);
      }
    }
    return out as Messages<B>;
  }

  function i18n<B extends Record<string, unknown>>(namespace: string, base: B): MessageStore<B> {
    // nanostores `computed` recomputes only when one of its dependency values
    // changes (by ===) and returns the cached reference otherwise — so the
    // message snapshot is referentially stable, which is what useSyncExternalStore
    // requires. `resolved` and `overrides` change by reference on every update.
    const store = computed(
      [$locale, $resolved, overrides],
      (locale: string, resolved: LocaleCache, userOverrides: ResolvedOverrides) => {
        const localeData = resolved[locale]?.[namespace];
        const userData = userOverrides?.[namespace];
        // Fast path: no user overrides for this namespace -> no merge, no allocation.
        const merged = userData ? { ...localeData, ...userData } : localeData;
        return buildMessages(locale, base, merged);
      },
    ) as ReadableStore<Messages<B>>;
    // Back-reference + source definition, used by `loadTranslations` (await this
    // instance's loads) and `messagesToJSON` (serialize the base back to JSON).
    return Object.assign(store, { i18n: api, namespace, base });
  }

  const api: I18n = Object.assign(i18n, { loading: $loading });
  return api;
}
