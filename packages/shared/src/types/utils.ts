/**
 * Useful to flatten the type output to improve type hints shown in editors. And also to transform an interface into a type to aide with assignability.
 * https://github.com/sindresorhus/type-fest/blob/main/source/simplify.d.ts
 */
export type Simplify<T> = {
  [K in keyof T]: T[K];
} & {};

export type SnakeToCamel<T> = T extends `${infer A}_${infer B}`
  ? `${Uncapitalize<A>}${Capitalize<SnakeToCamel<B>>}`
  : T extends object
    ? { [K in keyof T as SnakeToCamel<K>]: T[K] }
    : T;

export type DeepSnakeToCamel<T> = T extends `${infer A}_${infer B}`
  ? `${Uncapitalize<A>}${Capitalize<DeepSnakeToCamel<B>>}`
  : T extends object
    ? { [K in keyof T as DeepSnakeToCamel<K>]: DeepSnakeToCamel<T[K]> }
    : T;

export type DeepCamelToSnake<T> = T extends `${infer C0}${infer R}`
  ? `${C0 extends Uppercase<C0> ? '_' : ''}${Lowercase<C0>}${DeepCamelToSnake<R>}`
  : T extends object
    ? {
        [K in keyof T as DeepCamelToSnake<Extract<K, string>>]: DeepCamelToSnake<T[K]>;
      }
    : T;

export type CamelToSnake<T> = T extends `${infer C0}${infer R}`
  ? `${C0 extends Uppercase<C0> ? '_' : ''}${Lowercase<C0>}${CamelToSnake<R>}`
  : T extends object
    ? {
        [K in keyof T as CamelToSnake<Extract<K, string>>]: T[K];
      }
    : T;

/**
 * @internal
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = Required<{
  [P in keyof T]: T[P] extends object | undefined ? DeepRequired<Required<T[P]>> : T[P];
}>;

export type Nullable<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | null : T[P];
};

/**
 * Internal type used by RecordToPath
 */
type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ?
        | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never;

/**
 * Internal type used by RecordToPath
 */
type PathImpl2<T> = PathImpl<T, keyof T> | keyof T;

/**
 * Used to construct a type union containing all the keys (even if nested) of an object defined as const
 * const obj =  { a: { b: '' }, c: '' }  as const;
 * type Paths = RecordToPath<typeof obj>
 * Paths contains: 'a' | 'a.b' | 'c'
 */
export type RecordToPath<T> = PathImpl2<T> extends string | keyof T ? PathImpl2<T> : keyof T;

/**
 * Used to read the value of a string path inside an object defined as const
 * const obj =  { a: { b: 'hello' }}  as const;
 * type Value = PathValue<typeof obj, 'a.b'>
 * Value is now a union set containing a single type: 'hello'
 */
export type PathValue<T, P extends RecordToPath<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends RecordToPath<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type IsSerializable<T> = T extends Function ? false : true;

/**
 * Excludes any non-serializable prop from an object
 *
 * @hidden
 */
export type Serializable<T> = {
  [K in keyof T as IsSerializable<T[K]> extends true ? K : never]: T[K];
};

/**
 * Enables autocompletion for a union type, while keeping the ability to use any string
 * or type of `T`
 *
 * @internal
 */
export type Autocomplete<U extends T, T = string> = U | (T & Record<never, never>);

/**
 * Omit without union flattening
 */
export type Without<T, W> = {
  [P in keyof T as Exclude<P, W>]: T[P];
};

/**
 * Overrides the type of existing properties
 * const obj =  { a: string, b: number }  as const;
 * type Value = Override<typeof obj, { b: string }>
 * Value contains: { a:string, b: string }
 */
export type Override<T, U> = Omit<T, keyof U> & U;
