import type { MosaicMessages } from './registry';

type PluralOverride = Partial<Record<Intl.LDMLPluralRule, string>>;

type Leaf = string | { readonly other: string };

type Nested<T> = {
  [K in keyof T]?: T[K] extends string ? string : T[K] extends Leaf ? PluralOverride : Nested<T[K]>;
};

type Paths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Leaf ? `${Prefix}${K}` : Paths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

type At<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? At<T[Head], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

type Flat<T> = { [P in Paths<T>]?: At<T, P> extends string ? string : PluralOverride };

/**
 * A set of strings for Mosaic, as nested objects or dot paths. Every key is optional and anything
 * omitted falls back to the built-in English. Plural leaves merge per category.
 */
export type MosaicCatalog = Nested<MosaicMessages> & Flat<MosaicMessages>;

export interface MosaicLocalization {
  /** BCP 47 tag that picks plural forms. Defaults to `en`. */
  locale?: string;
  /** The catalog for `locale`, applied over English. */
  messages?: MosaicCatalog;
  /** Sparse changes applied over `messages`. */
  overrides?: MosaicCatalog;
}
