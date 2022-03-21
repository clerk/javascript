export type SnakeToCamel<T> = T extends `${infer A}_${infer B}`
  ? `${Uncapitalize<A>}${Capitalize<SnakeToCamel<B>>}`
  : T extends {}
  ? { [K in keyof T as SnakeToCamel<K>]: T[K] }
  : T;

export type DeepSnakeToCamel<T> = T extends `${infer A}_${infer B}`
  ? `${Uncapitalize<A>}${Capitalize<DeepSnakeToCamel<B>>}`
  : T extends {}
  ? { [K in keyof T as DeepSnakeToCamel<K>]: DeepSnakeToCamel<T[K]> }
  : T;

export type DeepCamelToSnake<T> = T extends `${infer C0}${infer R}`
  ? `${C0 extends Uppercase<C0> ? '_' : ''}${Lowercase<C0>}${DeepCamelToSnake<R>}`
  : T extends {}
  ? {
      [K in keyof T as DeepCamelToSnake<Extract<K, string>>]: DeepCamelToSnake<T[K]>;
    }
  : T;
export type CamelToSnake<T> = T extends `${infer C0}${infer R}`
  ? `${C0 extends Uppercase<C0> ? '_' : ''}${Lowercase<C0>}${CamelToSnake<R>}`
  : T extends {}
  ? {
      [K in keyof T as CamelToSnake<Extract<K, string>>]: T[K];
    }
  : T;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
