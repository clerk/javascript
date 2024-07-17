// https://github.com/sindresorhus/type-fest/blob/main/source/require-exactly-one.d.ts
export type RequireExactlyOne<ObjectType, KeysType extends keyof ObjectType = keyof ObjectType> = {
  [Key in KeysType]: Required<Pick<ObjectType, Key>> & Partial<Record<Exclude<KeysType, Key>, never>>;
}[KeysType] &
  Omit<ObjectType, KeysType>;

// Credit to @mattpocock
// https://github.com/total-typescript/react-typescript-tutorial/blob/ca06b2a1f3c15c77e7e0d2d3f3e98466436a6d8f/src/08-advanced-patterns/72-as-prop-with-forward-ref.solution.tsx#L20C1-L23C1
export type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends any ? Omit<T, TOmitted> : never;
