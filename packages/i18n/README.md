# @clerk/i18n

Reactive i18n primitives built on [nanostores](https://github.com/nanostores/nanostores). Inspired by [`@nanostores/i18n`](https://github.com/nanostores/i18n).

## Stores

Every primitive returns a [nanostores](https://github.com/nanostores/nanostores) store — `.get()` / `.subscribe()` / `.listen()` (and `.set()` when writable):

```ts
import { atom, browser, localeFrom, formatter } from '@clerk/i18n';

const $setting = atom<string | null>(null); // writable
const $browser = browser({ available: ['en', 'fr', 'de'] }); // from navigator
const $locale = localeFrom($setting, $browser); // first non-null, else 'en'
const $fmt = formatter($locale); // reactive Intl wrapper
```

## Messages

`createI18n(localeStore, options)` returns a factory. `base` is the source-locale
definition; message types are inferred from it.

```ts
import { createI18n, params, count, messageFormat } from '@clerk/i18n';

const i18n = createI18n($locale, {
  get: locale => import(`./locales/${locale}.json`).then(m => m.default),
});

const $messages = i18n('cart', {
  title: 'Your cart',
  greeting: params('Hi {name}'), // (args: { name: string | number }) => string
  items: count({ one: '{count} item', other: '{count} items' }), // (n: number) => string
  notice: messageFormat('Read the {#a}terms{/a}'), // (handlers?) => string
});

const m = $messages.get();
m.greeting({ name: 'Sam' }); // "Hi Sam"
m.items(3); // "3 items"
m.notice({ a: t => `<a>${t}</a>` }); // "Read the <a>terms</a>"
```

Non-`en` locales are fetched lazily via `get`; until the data lands (or for any
namespace missing from it) messages fall back to `base`. Each lazy load is
registered as a nanostores [task](https://github.com/nanostores/nanostores#tasks),
so during SSR you can `await allTasks()` (re-exported from `@clerk/i18n`) to flush
all in-flight locale loads before rendering (or `loadTranslations` for a single
message — see [React app](#react-app)).

`base` is treated as `en` by default. If your source strings are written in another
language, pass `baseLocale` — that locale is served from `base` with no fetch:

```ts
createI18n($locale, { get, baseLocale: 'fr' });
```

### Plural messages with params

Wrap `count(...)` in `params(...)` for a message that needs both a number (for plural
selection) and named params. The resolved message is `(n, args) => string` — `n` selects
the form, then `{count}` and the named placeholders are substituted:

```ts
const $msgs = i18n('pagination', {
  page: params<{ category: string }>(count({ one: 'One page in {category}', other: '{count} pages in {category}' })),
});
$msgs.get().page(5, { category: 'robots' }); // "5 pages in robots"
```

## Overrides

A consumer override layer sits on top of `base` and any fetched locale (**user wins**), so apps can
re-word individual messages without touching translations. It's opt-in and locale-agnostic — the
same overrides apply to every locale.

Author the overrides with `defineLocalization` (plain serializable data), put them in a store, and
pass that store to `createI18n`. Updating the store re-renders live — the merge only allocates when
overrides actually exist for a namespace:

```ts
import { atom, createI18n, defineLocalization } from '@clerk/i18n';

const $overrides = atom(defineLocalization({ 'common.hi': 'Hey' }));
const i18n = createI18n($locale, { get, overrides: $overrides });

const $messages = i18n('common', { hi: 'Hello' });
$messages.get().hi; // "Hey"  (override beats base/locale)

$overrides.set(defineLocalization({ 'common.hi': 'Howdy' })); // live update
```

Each override accepts the same input the resolver consumes: a string for `params`/`messageFormat`/
plain messages, and a partial set of plural forms for `count`.

```ts
defineLocalization({
  'common.greet': 'Hello {name}!', // params — replacement template
  'common.items': { other: '{count} things' }, // count — partial forms (untouched forms keep base)
});
```

### Authoring forms — nested and flat

`defineLocalization` accepts two forms (pick one per call; mixing is tolerated). It normalizes both
to the `namespace -> key -> value` shape `createI18n` consumes. A **flat key splits on its first
dot**: the first segment is the namespace, the remainder is the key.

```ts
// nested — best for grouped overrides
defineLocalization({
  signIn: { title: 'Log in to Acme', subtitle: 'Welcome' },
  apiKeys: { action__add: 'New key' },
});

// flat dot notation — best for sparse / programmatic overrides
defineLocalization({
  'signIn.title': 'Log in to Acme',
  'signIn.subtitle': 'Welcome',
  'apiKeys.action__add': 'New key',
});
```

|                              | Nested                  | Flat dot notation                                                                    |
| ---------------------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| Grouped overrides            | related keys co-located | keys scatter unless sorted                                                           |
| Sparse / programmatic / JSON | awkward to assemble     | one line per key, trivial to generate                                                |
| Typing                       | precise per key         | precise per key (path + value both checked)                                          |
| Edge case                    | none                    | a literal `.` in a **namespace** name would mis-split (don't use dots in namespaces) |

### Typing

Pass a registry type argument (`namespace -> base`) for autocomplete and validation. Both forms are
fully typed — the path is checked and the value must match the key's message type, so overriding a
`count` key with a bare string is a compile error in either form. Without a registry, overrides are
loosely typed but still valid:

```ts
type Registry = { signIn: typeof signInBase; apiKeys: typeof apiKeysBase };

defineLocalization<Registry>({ signIn: { title: 'Log in' } }); // ✓ nested
defineLocalization<Registry>({ 'signIn.title': 'Log in' }); // ✓ flat
// @ts-expect-error a count key needs plural forms, not a string
defineLocalization<Registry>({ 'apiKeys.someCountKey': 'nope' });
// @ts-expect-error not a key of the apiKeys base
defineLocalization<Registry>({ 'apiKeys.nope': 'x' });
```

Because the engine is two-level (namespace → key), a flat path is a single `namespace.key`
template-literal level — full typing stays cheap regardless of how many keys a namespace has.

## React

`useStore` is a thin `useSyncExternalStore` wrapper (concurrency-safe, SSR-aware
via the optional `{ ssr }` snapshot):

```tsx
import { useStore } from '@clerk/i18n/react';

function Cart() {
  const m = useStore($messages);
  return <h1>{m.title}</h1>; // plain + params/count messages are strings/functions
}
```

### Rich text

`messageFormat` messages carry their parsed `parts`, so markup renders as real
elements (no `dangerouslySetInnerHTML`). Use the `<Message>` component or the
`useMessage` hook — both fold `{#tag}…{/tag}` (and nesting) via `components`, and
substitute `{$var}` from `values`:

```tsx
import { Message, useMessage, useStore } from '@clerk/i18n/react';

const $notice = i18n('legal', { terms: 'Read the {#link}terms{/link}, {$name}' });

function Notice() {
  const m = useStore($notice);
  const components = { link: (c: ReactNode) => <a href='/terms'>{c}</a> };

  // Component form:
  return (
    <Message
      of={m.terms}
      values={{ name: 'Sam' }}
      components={components}
    />
  );

  // Hook form (returns the same nodes):
  // const node = useMessage(m.terms, { values: { name: 'Sam' }, components });
  // return <p>{node}</p>;
}
// -> Read the <a href="/terms">terms</a>, Sam
```

Non-React consumers can use `formatToParts(message, values)` for a flat,
value-resolved part list.

## React app

The examples above use module-level stores — the quick path for a **client-only SPA**.
For **SSR** (Next.js, RSC, …) create the stores **per request** behind a provider and seed
server-loaded translations via `createI18n`'s `cache`; otherwise concurrent server
requests share one `$locale`. The provider is a few lines in your app — the package stays
unopinionated about your framework:

```tsx
// localization.tsx
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  atom,
  browser,
  createI18n,
  localeFrom,
  type I18n,
  type ResolvedOverrides,
  type WritableStore,
} from '@clerk/i18n';
import { useStore } from '@clerk/i18n/react';

const loadLocale = (locale: string) =>
  fetch(`https://cdn.example.com/clerk/locales/${locale}.json`).then(r => r.json());

type SeededMessages = Record<string, Record<string, Record<string, unknown>>>;

interface LocalizationValue {
  i18n: I18n;
  $locale: WritableStore<string | null>;
}
const LocalizationContext = createContext<LocalizationValue | null>(null);

export interface LocalizationProviderProps {
  /** Active locale, resolved per request on the server. Wins over browser detection. */
  locale?: string;
  /** Fallback when neither `locale` nor a browser language matches. Defaults to 'en'. */
  defaultLocale?: string;
  /** Locales the app ships translations for. */
  locales: string[];
  /** Consumer overrides, e.g. from an appearance / localization prop. */
  overrides?: ResolvedOverrides;
  /** Server-loaded translations for the active locale (locale -> namespace -> messages). */
  initialMessages?: SeededMessages;
  children: ReactNode;
}

export function LocalizationProvider({
  locale,
  defaultLocale = 'en',
  locales,
  overrides,
  initialMessages,
  children,
}: LocalizationProviderProps) {
  // Built once per provider instance = once per request on the server, so concurrent
  // requests never share a $locale. Seeding `cache` makes the first render correct.
  const value = useMemo(() => {
    const $explicit = atom<string | null>(locale ?? null); // SSR seed + runtime switch point
    const $locale = localeFrom($explicit, browser({ available: locales, fallback: defaultLocale }));
    const i18n = createI18n($locale, {
      get: loadLocale,
      overrides: atom<ResolvedOverrides>(overrides ?? {}),
      cache: initialMessages,
    });
    return { i18n, $locale: $explicit };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

/** Create + read a namespace's messages within the provider. */
export function useMessages<B extends Record<string, unknown>>(namespace: string, base: B) {
  const ctx = useContext(LocalizationContext);
  if (!ctx) throw new Error('useMessages must be used within <LocalizationProvider>');
  // The computed store must be stable for useSyncExternalStore; `i18n` is stable per provider.
  const $messages = useMemo(() => ctx.i18n(namespace, base), [ctx]);
  return useStore($messages);
}
```

Define each component's `base` at module scope (source strings live with the UI) and read
it with `useMessages`:

```tsx
// organization-profile.messages.ts
export const orgProfileBase = { title: 'Organization Profile', tab: { general: 'General' } };

// organization-profile.tsx
import { useMessages } from '../localization';
import { orgProfileBase } from './organization-profile.messages';

function OrganizationProfile() {
  const m = useMessages('organizationProfile', orgProfileBase);
  return <h1>{m.title}</h1>;
}
```

Switch locale at runtime by writing the exposed store (`ctx.$locale.set('fr')`); the
`locale` prop only **seeds** the initial value, so there's no effect and no load flicker.

### SSR (Next.js Pages Router)

Resolve the locale and fetch translations on the server, then pass both down.
`initialMessages` seeds `cache`, so the first server render is correct and single-pass:

```tsx
// pages/_app.tsx
const LOCALES = ['en', 'fr', 'de'];

export default function MyApp({ Component, pageProps, locale, initialMessages }) {
  return (
    <LocalizationProvider
      locale={locale}
      defaultLocale='en'
      locales={LOCALES}
      initialMessages={initialMessages}
    >
      <Component {...pageProps} />
    </LocalizationProvider>
  );
}

MyApp.getInitialProps = async ({ ctx }) => {
  const accept = ctx.req?.headers['accept-language'] ?? '';
  const locale = LOCALES.find(l => accept.startsWith(l)) ?? 'en';
  const initialMessages =
    locale === 'en'
      ? undefined
      : { [locale]: await fetch(`https://cdn.example.com/clerk/locales/${locale}.json`).then(r => r.json()) };
  return { locale, initialMessages };
};
```

### Server-only rendering (RSC)

With no client hydration, await a snapshot per request with `loadTranslations` and a
per-request instance — `loadTranslations` waits for that instance's load only (unlike the
global `allTasks`):

```tsx
import { atom, createI18n, loadTranslations } from '@clerk/i18n';
import { postBase } from './post.messages';

async function Post({ locale }: { locale: string }) {
  const i18n = createI18n(atom(locale), { get: loadLocale }); // per-request, not module-scope
  const t = await loadTranslations(i18n('post', postBase));
  return <span>{t.title}</span>;
}
```

### Inside Clerk's `ui` package

`ui` uses the same provider pattern, built with `createContextAndHook` from
`@clerk/shared/react` to match `MosaicProvider`. Consumer overrides from
`<ClerkProvider localization={…}>` (the appearance layer) are authored with
[`defineLocalization`](#overrides) and passed as the provider's `overrides`.

## CI: extracting source strings

`messagesToJSON` collects the `base` strings from message stores into one
`{ namespace: { key } }` object to upload to a translation service. Markers serialize back
to raw form (`params` / `messageFormat` → template, `count` / `params(count)` → forms). Run
it after importing every `*.messages` module — build the stores from a throwaway instance:

```ts
import { atom, createI18n, messagesToJSON } from '@clerk/i18n';
import { orgProfileBase } from './aio/organization-profile.messages';
import { signInBase } from './sign-in/sign-in.messages';

const i18n = createI18n(atom('en'), { get: async () => ({}) });
const json = messagesToJSON(i18n('organizationProfile', orgProfileBase), i18n('signIn', signInBase));
// { organizationProfile: { title: 'Organization Profile', … }, signIn: { … } }
```
