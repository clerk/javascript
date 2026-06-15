/**
 * Core type surface for `@clerk/i18n`.
 *
 * Two halves live here:
 *  - the runtime store contract (nanostores `.get/.set/.subscribe/.listen`)
 *  - the type-level message inference (turning a `base` definition object into the
 *    shape of the resolved messages: typed param functions, plural functions, etc.)
 */

import type { ReadableAtom, WritableAtom } from 'nanostores';

// ---------------------------------------------------------------------------
// Stores
//
// Stores are nanostores atoms; these aliases are the names the rest of the
// package (and consumers) refer to them by.
// ---------------------------------------------------------------------------

/** A read-only reactive store (a nanostores readable atom). */
export type ReadableStore<T> = ReadableAtom<T>;

/** A writable reactive store (a nanostores writable atom). */
export type WritableStore<T> = WritableAtom<T>;

// ---------------------------------------------------------------------------
// Pluralization
// ---------------------------------------------------------------------------

export type PluralCategory = Intl.LDMLPluralRule;

/**
 * The set of plural forms for a message. `other` is always required because
 * CLDR guarantees it exists for every locale, so it is a safe fallback.
 */
export type PluralForms = Partial<Record<PluralCategory, string>> & { other: string };

// ---------------------------------------------------------------------------
// Message markers
//
// `base` definitions are plain objects whose values are either strings or one
// of these markers. Each marker carries enough type information to recover the
// shape of the resolved message at the type level (see `MessageType`).
// ---------------------------------------------------------------------------

export interface ParamsMarker<T extends string = string> {
  readonly _type: 'params';
  readonly template: T;
}

export interface CountMarker {
  readonly _type: 'count';
  readonly forms: PluralForms;
}

/**
 * A pluralized message that also takes named params: `params(count(...))`. The
 * resolved message is `(n, args) => string` — `n` selects the plural form, then
 * `{count}` and the `{name}` placeholders are substituted. `P` is carried
 * structurally (phantom) so the resolved arg shape can be inferred.
 */
export interface CountParamsMarker<P extends Record<string, string | number> = Record<string, string | number>> {
  readonly _type: 'count-params';
  readonly forms: PluralForms;
  readonly __params?: P;
}

export interface TransformMarker<R = unknown> {
  readonly _type: 'transform';
  readonly fn: (locale: string, template: string) => R;
  readonly template: string;
}

/** Any message marker. Used for runtime narrowing in `create-i18n`. */
export type AnyMarker = ParamsMarker | CountMarker | CountParamsMarker | TransformMarker;

// ---------------------------------------------------------------------------
// `messageFormat` transform types
// ---------------------------------------------------------------------------

/** Handlers passed when rendering a `messageFormat` message. */
export type MessageFormatHandlers = Record<string, string | ((inner?: string) => string)>;

/** The function a `messageFormat` message resolves to. */
export type MessageFormatFn = (handlers?: MessageFormatHandlers) => string;

/** A parsed token of a `messageFormat` template. */
export type MessageFormatPart =
  | { type: 'text'; value: string }
  | { type: 'string'; name: string }
  | { type: 'markup'; kind: 'open' | 'close' | 'standalone'; name: string };

// ---------------------------------------------------------------------------
// Type-level param inference
// ---------------------------------------------------------------------------

/**
 * Extract `{name}` placeholders from a template literal type as a union of
 * names. `'Hi {name}, you have {count}'` -> `'name' | 'count'`.
 */
export type ExtractParams<T extends string> = T extends `${string}{${infer Name}}${infer Rest}`
  ? Name | ExtractParams<Rest>
  : never;

/** The argument object for a params template, keyed by its placeholder names. */
export type ParamArgs<T extends string> = { [K in ExtractParams<T>]: string | number };

/**
 * The function a params message resolves to. When the template has no
 * placeholders the argument is optional, so `t.greeting()` typechecks.
 */
export type ParamsFn<T extends string> = [ExtractParams<T>] extends [never]
  ? (args?: Record<string, never>) => string
  : (args: ParamArgs<T>) => string;

/** Map a single `base` value to the type of its resolved message. */
export type MessageType<V> =
  V extends ParamsMarker<infer T>
    ? ParamsFn<T>
    : V extends CountParamsMarker<infer P>
      ? (n: number, args: P) => string
      : V extends CountMarker
        ? (n: number) => string
        : V extends TransformMarker<infer R>
          ? R
          : V extends string
            ? string
            : V;

/** Map a whole `base` definition object to its resolved messages object. */
export type Messages<B> = { [K in keyof B]: MessageType<B[K]> };

// ---------------------------------------------------------------------------
// User overrides
//
// A consumer-supplied layer applied on top of `base` and any fetched locale
// (user wins). Each base value accepts the same override input that the
// resolver already consumes: a string for params/transform/plain messages,
// a partial set of plural forms for count, a value map for processors.
// ---------------------------------------------------------------------------

/** The loosely-typed set of values an override may take (used in loose/flat mode). */
export type OverrideInput = string | Partial<PluralForms> | Record<string, string>;

/** Map a single `base` value to the override input it accepts. */
export type OverrideValue<V> = V extends ParamsMarker
  ? string
  : V extends CountMarker | CountParamsMarker
    ? Partial<PluralForms>
    : V extends TransformMarker
      ? string
      : V extends string
        ? string
        : V extends Record<string, unknown>
          ? { [K in keyof V]?: OverrideValue<V[K]> }
          : OverrideInput;

/** A map of namespace -> `base` definition, used to type overrides precisely. */
export type Registry = Record<string, Record<string, unknown>>;

/** Overrides for one namespace's `base`, keyed by message key. */
export type NamespaceOverrides<B> = { [K in keyof B]?: OverrideValue<B[K]> };

/** Nested override form: `{ namespace: { key: value } }`. Precisely typed per key. */
export type NestedOverrides<R extends Registry> = { [N in keyof R]?: NamespaceOverrides<R[N]> };

/** The union of valid `namespace.key` paths for a registry. */
export type FlatKey<R extends Registry> = {
  [N in keyof R & string]: `${N}.${keyof R[N] & string}`;
}[keyof R & string];

/**
 * Resolve the override input type for a flat `namespace.key` path. The path is
 * split on its first dot, so the remainder is the (possibly dotted) message key.
 */
export type FlatOverrideValue<R extends Registry, K extends string> = K extends `${infer N}.${infer Rest}`
  ? N extends keyof R
    ? Rest extends keyof R[N]
      ? OverrideValue<R[N][Rest]>
      : never
    : never
  : never;

/**
 * Flat dot-notation form: `{ 'namespace.key': value }`. Fully typed — the path is
 * checked against the registry and the value is the precise override input for that
 * key. A path splits on its first dot (`'signIn.start.title'` -> namespace `signIn`,
 * key `start.title`), so it stays a single template-literal level regardless of how
 * deep the key reads.
 */
export type FlatOverrides<R extends Registry> = Partial<{
  [K in FlatKey<R>]: FlatOverrideValue<R, K>;
}>;

/** Normalized runtime shape consumed by `createI18n`: namespace -> key -> value. */
export type ResolvedOverrides = Record<string, Record<string, unknown>>;
