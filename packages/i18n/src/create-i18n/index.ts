import { atom, computed, task } from 'nanostores';

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
}

/** The message-store factory returned by `createI18n`. */
export type I18n = <B extends Record<string, unknown>>(namespace: string, base: B) => ReadableStore<Messages<B>>;

const BASE_LOCALE = 'en';

/** Stable empty-overrides store, used when no `overrides` store is supplied. */
const NO_OVERRIDES = atom<ResolvedOverrides>({});

function asMarker(value: unknown): AnyMarker | null {
  return typeof value === 'object' && value !== null && '_type' in value ? (value as AnyMarker) : null;
}

export function createI18n($locale: ReadableStore<string>, options: CreateI18nOptions): I18n {
  const { get, cache = {}, overrides = NO_OVERRIDES } = options;

  // Loaded locale data. Setting a fresh object is what drives dependent message
  // computeds to recompute — no manual invalidation counter needed.
  const $resolved = atom<LocaleCache>({ ...cache });
  const pending: Record<string, Promise<void>> = {};

  function fetchLocale(locale: string): Promise<void> {
    // `task()` registers the load with nanostores so `allTasks()` can await it
    // during SSR; the `pending` map keeps each locale to a single fetch.
    pending[locale] ??= task(() =>
      Promise.resolve(get(locale)).then(data => {
        const merged: NamespaceData = Array.isArray(data) ? Object.assign({}, ...data) : (data ?? {});
        const next: LocaleCache = { ...$resolved.get() };
        next[locale] = { ...next[locale], ...merged };
        $resolved.set(next);
      }),
    );
    return pending[locale];
  }

  // Standing subscription: whenever the active locale is one we have not loaded
  // (and is not the base locale), fetch it. `subscribe` fires immediately, so the
  // initial locale is handled too.
  $locale.subscribe(locale => {
    if (locale !== BASE_LOCALE && !$resolved.get()[locale]) {
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
      out[key] = buildEntry(locale, base[key], overridesForNamespace?.[key]);
    }
    return out as Messages<B>;
  }

  return function i18n<B extends Record<string, unknown>>(namespace: string, base: B): ReadableStore<Messages<B>> {
    // nanostores `computed` recomputes only when one of its dependency values
    // changes (by ===) and returns the cached reference otherwise — so the
    // message snapshot is referentially stable, which is what useSyncExternalStore
    // requires. `resolved` and `overrides` change by reference on every update.
    return computed(
      [$locale, $resolved, overrides],
      (locale: string, resolved: LocaleCache, userOverrides: ResolvedOverrides) => {
        const localeData = resolved[locale]?.[namespace];
        const userData = userOverrides?.[namespace];
        // Fast path: no user overrides for this namespace -> no merge, no allocation.
        const merged = userData ? { ...localeData, ...userData } : localeData;
        return buildMessages(locale, base, merged);
      },
    ) as ReadableStore<Messages<B>>;
  };
}
