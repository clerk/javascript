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
all in-flight locale loads before rendering.

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
