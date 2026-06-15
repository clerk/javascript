# @clerk/i18n

> **Internal package — not published.** Reactive i18n primitives built on [nanostores](https://github.com/nanostores/nanostores).

## Stores

Every primitive returns a nanostores store — `.get()` / `.subscribe()` / `.listen()` (and `.set()` for writable stores):

```ts
import { atom, browser, localeFrom, formatter } from '@clerk/i18n';

const $setting = atom<string | null>(null); // writable
const $browser = browser({ available: ['en', 'fr'] }); // from navigator.languages
const $locale = localeFrom($setting, $browser); // first non-null, else 'en'
const $fmt = formatter($locale); // reactive Intl wrapper
```

## Messages

`createI18n($locale, options)` returns a namespace factory. `base` is the source-locale definition; message types are inferred from it. Non-base locales are fetched lazily via `get`; until the data lands, messages fall back to `base` per key.

```ts
import { createI18n, params, count, messageFormat } from '@clerk/i18n';

const i18n = createI18n($locale, {
  get: locale => fetch(`/locales/${locale}.json`).then(r => r.json()),
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

Each lazy load is registered as a nanostores [task](https://github.com/nanostores/nanostores#tasks), so during SSR you can `await allTasks()` (re-exported from `@clerk/i18n`) to flush all in-flight loads before rendering.

### `params(count(...))` — plural + params

```ts
const $msgs = i18n('pagination', {
  page: params<{ category: string }>(
    count({
      one: 'One page in {category}',
      other: '{count} pages in {category}',
    }),
  ),
});
$msgs.get().page(5, { category: 'robots' }); // "5 pages in robots"
```

## Overrides

A consumer override layer sits above `base` and any fetched locale — **user wins**. Overrides are locale-agnostic (apply to every locale) and live-reactive via a store:

```ts
import { atom, createI18n, defineLocalization } from '@clerk/i18n';

const $overrides = atom(defineLocalization({ 'common.hi': 'Hey' }));
const i18n = createI18n($locale, { get, overrides: $overrides });

const $messages = i18n('common', { hi: 'Hello' });
$messages.get().hi; // "Hey"

$overrides.set(defineLocalization({ 'common.hi': 'Howdy' })); // live update
```

`defineLocalization` accepts **nested** or **flat dot-notation** forms (mixing is tolerated):

```ts
// nested — best for grouped overrides
defineLocalization({ signIn: { title: 'Log in to Acme' } });

// flat — best for sparse or programmatic overrides
defineLocalization({ 'signIn.title': 'Log in to Acme' });
```

Pass a registry type for autocomplete + validation. Overriding a `count` key with a bare string is a compile error:

```ts
type Registry = { signIn: typeof signInBase; cart: typeof cartBase };
defineLocalization<Registry>({ 'signIn.title': 'Log in' }); // ✓
defineLocalization<Registry>({ 'cart.items': 'nope' }); // ✗ count needs plural forms
```

## React

`@clerk/i18n/react` exports `useStore`, `Message`, `useMessage`, and `formatToParts`.

```tsx
import { useStore, Message } from '@clerk/i18n/react';

function Cart() {
  const m = useStore($messages);
  return (
    <>
      <h1>{m.title}</h1>
      <Message
        of={m.notice}
        components={{ a: c => <a href='/terms'>{c}</a> }}
      />
    </>
  );
}
```

`useStore` uses `useSyncExternalStore` with stabilised callbacks so it's safe under React concurrent mode. The optional `{ ssr }` option provides the server snapshot.

Non-React consumers can use `formatToParts(message, values)` for a flat resolved-part list.

## SSR

For SSR, create stores per request (module-level stores share state across requests). Seed the `cache` option with server-fetched data so the first render is correct and single-pass. Call `await allTasks()` or `translationsLoading(i18n)` to flush in-flight loads before streaming.

For React Server Components, `loadTranslations` is a convenience that awaits the instance's load and returns the snapshot:

```ts
import { atom, createI18n, loadTranslations } from '@clerk/i18n';

async function Post({ locale }: { locale: string }) {
  const i18n = createI18n(atom(locale), { get: loadLocale }); // per-request
  const t = await loadTranslations(i18n('post', postBase));
  return <span>{t.title}</span>;
}
```

## CI: extracting source strings

`messagesToJSON` serialises each namespace's `base` back to raw JSON (markers → template strings / plural forms) for upload to a translation service:

```ts
import { atom, createI18n, messagesToJSON } from '@clerk/i18n';

const i18n = createI18n(atom('en'), { get: async () => ({}) });
const json = messagesToJSON(i18n('organizationProfile', orgProfileBase), i18n('signIn', signInBase));
// { organizationProfile: { title: 'Organization Profile', … }, signIn: { … } }
```
