# Migration: `@clerk/localizations` → `@clerk/i18n` (`createI18n`)

## Context

Localizations today live in `packages/localizations/src/<ll-CC>.ts` — 50 hand-maintained
`LocalizationResource` objects (+ `en-XA` pseudo-locale), re-exported one-per-line from
`index.ts`. English (`en-US.ts`) is the source of truth; other locales leave untranslated keys
as `: undefined`. Fallback is materialized eagerly in
`packages/ui/src/localization/parseLocalization.ts` by deep-merging `enUS` under the user
locale (`fastDeepMergeAndReplace`, which skips `undefined`).

The new `packages/i18n` package (`createI18n`, nanostores based) replaces this with: English
as an in-memory typed `base`, other locales as lazily-fetched JSON carrying only differing keys,
structural per-key fallback (`override ?? base`), reactive locale via a single `$locale` store,
and `Intl` formatting via `formatter($locale)`. Goal: one reactive locale source, type-checked
message shape, smaller payloads (no `undefined` placeholders, no English duplicated per locale),
and rich-text without `dangerouslySetInnerHTML`.

This is a large, multi-phase migration. The plan below is the full target shape plus a staged
path; the first PR should be Phase 0–1 only (foundations + one namespace behind a flag).

**Related docs**: `README.md` (§ _Authoring overrides_) — nested vs flat dot-notation
`defineLocalization` forms, before/after + pros/cons. `ci.md` — ideas for signalling translation
services (and AI-drafted translations) when the `base` changes.

## Target shape

- `en-US` content → typed `base` modules **co-located with the UI components** that use them (no
  central `en-US.ts`), split by section into **namespaces** (`apiKeys`, `signIn`, `userProfile`, …).
- 49 other locales → `packages/localizations/locales/<ll-CC>.json`, each carrying only keys that
  differ from English (no `undefined` placeholders). Fetched lazily by `get`.
- `en-XA` → generated `.json` from the `base` objects.
- Single `$locale` store; `formatter($locale)` for all date/number formatting.

### Transform rules (apply mechanically via codegen)

| Today                                                | Becomes                                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| `'{{name}}'`                                         | `params('{name}')`                                                       |
| `"{{ date \| shortDate('en-US') }}"`                 | `params('{date, shortDate}')` (in-string named style — see Formatting §) |
| flat `lastUsed__days: '{{days}}d ago'`               | keep as `params(...)` (abbrev, not true plural)                          |
| real plural pairs                                    | `count({ one, other })`                                                  |
| markup / link strings                                | `messageFormat('… {#link}terms{/link}')`                                 |
| hardcoded `'en-US'`/`'fr-FR'` locale tags in strings | removed — locale comes from `$locale` via the format registry            |
| nested section object                                | `i18n('<section>', { … })` namespace                                     |

```ts
// Example: apiKeys namespace base (derived from en-US.ts → apiKeys)
const $apiKeys = i18n('apiKeys', {
  action__add: 'Add new key',
  copySecret: { formTitle: params('Copy your "{name}" API Key now') },
  // Date style lives IN the string (translator-controlled); locale comes from $locale.
  createdAndExpirationStatus__expiresOn: params('Created {createdDate, shortDate} • Expires {expiresDate, longDate}'),
});
// caller: m.createdAndExpirationStatus__expiresOn({ createdDate: c, expiresDate: e })
```

```jsonc
// packages/localizations/locales/fr-FR.json — only differing keys, namespaced
{
  "apiKeys": {
    "action__add": "Ajouter une nouvelle clé",
    "copySecret": { "formTitle": "Copiez votre clé API \"{name}\" maintenant" },
  },
}
```

## Packaging & delivery

Separate _who owns the data_ from _how it reaches the runtime_ — the migration only changes the
second part.

**Ownership: English `base` co-locates with the UI; `@clerk/localizations` holds the translations.**

- **English `base` is code, co-located with the components that use it** — e.g.
  `packages/ui/src/mosaic/aio/organization-profile.messages.ts` (the prototype already does this).
  It is the typed source of truth and the thing `Messages<B>` / override types are inferred from.
  There is no central `en-US.ts`; English is never duplicated and lives next to its usage, so type
  inference is local and a component owns its own copy.
- **The other 49 locales are JSON diffs** (`@clerk/localizations/locales/<ll-CC>.json`, only
  differing keys), authored and maintained there, including community contributions and the CI
  translation flow (`ci.md`).
- **A build step extracts the full key set** from the co-located `base` modules into a manifest
  (the `key-manifest.json` from `ci.md`). The translation tooling in `@clerk/localizations` reads
  that manifest to know what exists, generate/validate diffs, and drive translations. Dependency
  direction: localizations tooling → reads the UI's extracted base (not the other way around).
- `@clerk/i18n` is the engine and ships **no data**.

**Delivery (changed): bundled object → lazy `get(locale)`.** Today consumers `import { frFR }` a
full object into their bundle. Now only English `base` is in the bundle; every other locale is
fetched on demand through the consumer-supplied `get(locale)`. That function is the seam, and it
differs per consumer:

| Consumer                         | `get(locale)` strategy                                       | Why                                                                                     |
| -------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **clerk-js** (CDN runtime)       | **fetch the JSON from Clerk's CDN at runtime** (not bundled) | clerk-js already loads from the CDN; only `base` ships in core — this is the bundle win |
| **framework SDKs / app-bundled** | dynamic `import('@clerk/localizations/locales/fr.json')`     | lets the app's bundler code-split per locale                                            |

The same JSON in `@clerk/localizations` is delivered either way without changing the translations —
the build emits the per-locale artifacts; `get` decides CDN-fetch vs bundler-chunk.

**Still open (see Open question #4):** the concrete clerk-js CDN serving mechanics — are the locale
JSONs published as package files, emitted as CDN artifacts, or both, and at what URL does `get`
fetch them. Decide before Phase 2.

## Formatting: in-string named styles (RESOLVED)

Date/number formatting is **translator-controlled and lives in the message string**, via named
styles — not at the call site. This preserves today's behavior (`{{ date | shortDate }}`), makes
the migration a mechanical codemod, and matches the dominant React-ecosystem convention
(react-intl / next-intl / lingui all format in-string via ICU named styles).

Decision detail:

- **Lightweight, not full ICU.** Extend the existing `params` token to accept an optional style:
  `{name, styleName}`. Do **not** adopt `intl-messageformat` — plurals (`count`), interpolation
  (`params`), and markup (`messageFormat`) are already covered; only scalar formatting is missing.
- **Named-format registry = the existing `formatter`.** Developers define `shortDate` / `longDate` /
  `currency` / … → `Intl` options once; the parser resolves the style against `$locale`. So
  `formatter` stops being a call-site primitive and becomes the registry the parser calls (it
  finally earns its keep). Translators pick a semantic style name; they never touch `Intl` options.
- **Precedent in-package:** `messageFormat` already parses in-string tokens (`{#tag}`, `{$var}`), so
  `{name, style}` in `params` is consistent, not a new paradigm.
- **Codemod:** `{{ date | shortDate('en-US') }}` → `{date, shortDate}` (drop the hardcoded locale).

Build it **lazily** — keep `formatter`/`useFormatter` as-is until Phase 1 hits the first real date
string, then add token parsing + the registry (reusing `formatter`). Core stays minimal until the
need is concrete, but the direction is fixed now so date strings aren't codemodded twice.

## Phases

**Phase 0 — Foundations (do first, isolated PR)**

- Stand up `$locale` + `formatter($locale)` wiring in `packages/ui/src/localization/`.
- Define the namespace list (one per top-level `en-US` key). Decide whether a `common`
  namespace is needed — audit for keys referenced across sections.
- Build a codegen script (extend/replace `packages/localizations/src/utils/generate.ts`) that
  reads `en-US.ts` and emits: (a) `base` namespace modules **co-located with the UI components**,
  (b) per-locale `<ll-CC>.json` diffs vs English, (c) `en-XA.json`. After cutover the base modules
  are hand-edited in the UI and a manifest-extraction step (not `en-US.ts`) feeds the tooling.
  This must be repeatable — translations land continuously.

**Phase 1 — One namespace behind a flag (first reviewable slice)**

- Migrate a single small namespace (e.g. `apiKeys`) end-to-end: `base` module + JSON locales +
  consumer reads via `useStore`. Gate with a flag so the old `parseLocalization` path stays live.
- **Add in-string named formatting** (per the Formatting § above): extend `params`'s token to
  `{name, styleName}`, and add a named-format registry over the existing `formatter` (`shortDate`,
  `longDate`, … → `Intl` options resolved against `$locale`). This is the first namespace with a
  date string, so it's where the token support lands.
- Per-key fallback test — **DONE** (`create-i18n` has a referentially-stable-snapshot + per-key
  fallback regression; `useStore` stable-callback regression also in place).
- Verify date-style round-trip (`shortDate`/`longDate`) matches current output for `en-US`,
  `fr-FR`, and an RTL locale (`ar-SA`/`he-IL`).

**Phase 2 — Bulk namespace migration**

- Run codegen across all sections; migrate consumers section by section. Keep old + new paths
  coexisting until the last section flips.
- Convert real plurals to `count`; convert markup strings to `messageFormat` + `<Message>`
  (removes `dangerouslySetInnerHTML` usages — grep and track each).

**Phase 3 — Cutover & cleanup**

- Remove `parseLocalization.ts` / `fastDeepMergeAndReplace` localization usage, the flag, and the
  50 TS locale files. Keep `index.ts` export surface compatible if external consumers import
  named locales (`import { frFR }`) — see Open questions.
- Repoint `en-XA` generation; delete dead `generate.ts` alignment logic (TS now enforces key set).

## Critical files

- `packages/localizations/src/en-US.ts` — migration **source** only; seeds the co-located base
  modules, then is deleted at cutover (English lives in the UI thereafter).
- `packages/ui/src/mosaic/**/<component>.messages.ts` — where the typed `base` modules live
  (co-located with components; the prototype's `organization-profile.messages.ts` is the pattern).
- `packages/localizations/locales/<ll-CC>.json` (×49) — the translation diffs (the package's job).
- `packages/localizations/src/utils/generate.ts` — extend into the codegen + the key-manifest
  extraction (reads the co-located base modules post-cutover).
- `packages/i18n/src/create-i18n/index.ts` — `buildEntry`/`buildMessages` fallback (reuse as-is).
- `packages/i18n/src/create-i18n/index.test.ts` — per-key fallback test (**done**).
- `packages/ui/src/localization/parseLocalization.ts` — old fallback path, removed in Phase 3.
- `packages/ui/src/localization/{makeLocalizable.tsx,localizationKeys.ts,localizationModifiers.ts}`
  — consumer-side resolution to be replaced by `useStore`/`Message`.
- `packages/shared/src/types/localization.ts` — `LocalizationResource` type; reconcile with the
  inferred `Messages<B>` shape (decide if the public type is still exported for back-compat).

## Compatibility adapter & user override layer (`localization` prop)

`<ClerkProvider localization={…}>` lets consumers override individual keys (brand wording, fixed
translations) as a `DeepPartial<LocalizationResource>`. This must keep working. It maps cleanly
onto `createI18n` because `buildEntry` already accepts a plain-string `override` for the common
message types — the only additions are a higher-precedence override **layer** and a token-syntax
adapter at the prop boundary.

### 1. A reactive override layer (user wins over locale wins over `base`) — implemented

`createI18n` takes an `overrides` store consulted at higher precedence than the fetched locale.
With nanostores it's simply another dependency of the message `computed` (no manual invalidation
counter): a new override object flows through by reference.

```ts
// createI18n option
export interface CreateI18nOptions {
  get: (locale: string) => /* … */;
  overrides?: ReadableStore<ResolvedOverrides>; // from the ClerkProvider / MosaicProvider prop
  // …
}

// inside the i18n() factory:
const sig = computed([$locale, $resolved, overrides], (locale, resolved, userOverrides) => {
  const localeData = resolved[locale]?.[namespace];
  const userData   = userOverrides?.[namespace];
  const merged = userData ? { ...localeData, ...userData } : localeData; // user wins
  return buildMessages(locale, base, merged);
});
// + wire reactivity once at instance setup:  $overrides?.listen?.(bump)
```

### 2. The override layer IS typed (derived from `base`)

Because `base` drives `Messages<B>`, the accepted override shape can be derived from it — each
marker maps to the input `buildEntry` already consumes, so consumers get autocomplete and a
compile error if they override a `count` key with a bare string:

```ts
type OverrideValue<V> = V extends ParamsMarker
  ? string // params → replacement template
  : V extends CountMarker
    ? Partial<PluralForms> // count  → subset of plural forms
    : V extends TransformMarker
      ? string
      : V extends ProcessorMarker
        ? Record<string, string>
        : V extends string
          ? string
          : V extends object
            ? { [K in keyof V]?: OverrideValue<V[K]> } // nested sections
            : never;

type Overrides<B> = { [K in keyof B]?: OverrideValue<B[K]> };

// Namespace registry (accumulated as i18n('<ns>', base) calls are declared) gives the
// full prop type:
type LocalizationOverrides = { [Ns in keyof Registry]?: Overrides<Registry[Ns]> };
```

`LocalizationOverrides` replaces the hand-maintained `DeepPartial<LocalizationResource>` as the
public prop type — and stays in sync with `base` automatically.

### 3. Token-syntax adapter (the real risk)

Existing override strings use the **old** syntax; `buildEntry`'s substitter is `/\{(\w+)\}/g`
(single brace, no pipe modifiers). Old-syntax overrides silently mis-render:

```ts
// buildEntry sees {{name}} → matches inner {name} → "Copy "{Sam}" now"          ❌
formTitle: 'Copy "{{name}}" now';
// date modifier → no match, literal passes through                              ❌
renewsAt: "Renews {{ date | shortDate('en-US') }}";
```

So the adapter at the prop boundary must, for every override value:

1. split the old nested `LocalizationResource` shape into namespaced overrides, and
2. transpile tokens: `{{x}}` → `{x}`, and strip/route `{{ x | modifier(…) }}` through
   `formatter` (or reject modifier overrides with a dev warning, since the new model formats
   outside the string).

This adapter is the single place the back-compat cost is concentrated, and it is also the
Phase-3 shim. Partial/no transpilation is worse than none — track it as a hard requirement.

### 4. Open decision — override scope

Today the prop _is_ the locale, so "applies to all locales vs only the active one" is moot. In
the new model it is a real choice: keep overrides locale-agnostic (apply on top of every locale)
or scope them per-locale. **Recommendation**: locale-agnostic by default (matches today's mental
model — a brand override like "Sign in" → "Log in" should hold in every language), with room for
a per-locale form later.

### 5. Framework-agnostic typed authoring (`defineLocalization`)

The override surface is React-free: it derives from the `base` namespace objects (plain TS,
markers map to strings / partial forms), so the authored value is typed _and_ serializable.
Ship a typed identity helper from a module that does not transitively import React, and consumers
in any framework (Vue, vanilla, Next server files, or JSON) get autocomplete + validation:

```ts
// @clerk/localizations (core entry — no React import)
import type { LocalizationOverrides } from '@clerk/i18n'; // generated from base namespaces
export const defineLocalization = (o: LocalizationOverrides): LocalizationOverrides => o;
```

```ts
// consumer, any framework
import { defineLocalization } from '@clerk/localizations';

const localization = defineLocalization({
  signIn: { start: { title: 'Log in to Acme' } },
  apiKeys: { action__add: 'New key' },
  // overriding a `count` key with a bare string → compile error (needs Partial<PluralForms>)
});

<ClerkProvider localization={localization} />; // provider writes it into the $overrides store
```

Notes:

- The generated `LocalizationOverrides` (and marker types) must live in `@clerk/i18n` core and be
  re-exported from `@clerk/localizations`, so the type path never pulls in React.
- `defineLocalization` is an identity function — it exists only for the annotation/autocomplete;
  `const l: LocalizationOverrides = {…}` is equivalent.
- This subsumes today's `import { frFR }` pattern: a full-locale override is
  `defineLocalization(frFRObject)`; a partial brand tweak is the same call with fewer keys — one
  typed, non-React surface for both.

## Open questions (resolve before Phase 1)

1. **Public API back-compat** — RESOLVED above: keep the `localization` prop via the typed
   override layer (§1–2) + boundary adapter (§3), authored through the framework-agnostic
   `defineLocalization` helper (§5). Remaining sub-decision is override scope (§4).
   Per AGENTS.md the prop is a contract surface, so the adapter ships before any cutover.
2. **In-string formatting** — RESOLVED (see Formatting §): translator-controlled named styles
   (`{date, shortDate}`) via a lightweight token on `params` backed by the `formatter` registry;
   built lazily in Phase 1.
3. **`common` namespace**: does any key get referenced from more than one section? Audit drives
   whether a shared namespace is needed.
4. **Bundling / delivery** (see Packaging & delivery §): ownership is settled (`@clerk/localizations`
   owns `base` + JSON; `get(locale)` is the seam). Remaining: the concrete clerk-js CDN serving
   mechanics — published package files vs CDN artifacts vs both, and the URL `get` fetches from.
   Decide before Phase 2.

## Verification

- `turbo test --filter @clerk/i18n` — new per-key fallback test + existing suite green.
- `turbo build --filter @clerk/ui --filter @clerk/clerk-js` — type-check the inferred message
  shapes against consumers.
- Snapshot parity: for `en-US`, `fr-FR`, `ar-SA`, render the migrated namespace under both old and
  new paths and diff resolved strings (catches date-modifier and fallback regressions).
- Manual: switch `$locale` at runtime, confirm English shows during async load then swaps; confirm
  a partially-translated locale falls back per-key to English.
