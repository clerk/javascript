import type { __internal_LocalizationResource, PathValue, RecordToPath } from '@clerk/shared/types';

type Value = string | number | boolean | Date;
type Whitespace = ' ' | '\t' | '\n' | '\r';

type Trim<T> = T extends `${Whitespace}${infer Rest}`
  ? Trim<Rest>
  : T extends `${infer Rest}${Whitespace}`
    ? Trim<Rest>
    : T extends string
      ? T
      : never;

type RemovePipeUtils<Text extends string> = Text extends `${infer Left}|titleize${infer Right}`
  ? `${Left}${Right}`
  : Text;

type FindBlocks<Text> = Text extends `${string}{{${infer Right}`
  ? ReadBlock<'', Right, ''> extends [infer Block, infer Tail]
    ? [Block, ...FindBlocks<Tail>]
    : never
  : [];

type TupleFindBlocks<T> = T extends readonly [infer First, ...infer Rest]
  ? [...FindBlocks<First>, ...TupleFindBlocks<Rest>]
  : [];

type ReadBlock<
  Block extends string,
  Tail extends string,
  Depth extends string,
> = Tail extends `${infer L1}}}${infer R1}`
  ? L1 extends `${infer L2}{{${infer R2}`
    ? ReadBlock<`${Block}${L2}{{`, `${R2}}}${R1}`, `${Depth}+`>
    : Depth extends `+${infer Rest}`
      ? ReadBlock<`${Block}${L1}}}`, R1, Rest>
      : [`${Block}${L1}`, R1]
  : [];

/** Parse block, return variables with types and recursively find nested blocks within */
type ParseBlock<Block> = Block extends `${infer Name},${infer Format},${infer Rest}`
  ? { [K in Trim<Name>]: VariableType<Trim<Format>> } & TupleParseBlock<TupleFindBlocks<FindBlocks<Rest>>>
  : Block extends `${infer Name},${infer Format}`
    ? { [K in Trim<Name>]: VariableType<Trim<Format>> }
    : { [K in Trim<Block>]: Value };

/** Parse block for each tuple entry */
type TupleParseBlock<T> = T extends readonly [infer First, ...infer Rest]
  ? ParseBlock<First> & TupleParseBlock<Rest>
  : unknown;

type VariableType<T extends string> = T extends 'number' | 'plural' | 'selectordinal'
  ? number
  : T extends 'date' | 'time'
    ? Date
    : Value;

export type GetICUArgs<Text extends string, T extends RemovePipeUtils<Text>> = TupleParseBlock<
  T extends readonly string[] ? TupleFindBlocks<T> : FindBlocks<T>
>;

type DefaultLocalizationKey = RecordToPath<__internal_LocalizationResource>;
type LocalizationKeyToValue<P extends DefaultLocalizationKey> = PathValue<__internal_LocalizationResource, P>;

export type LocalizationKey = {
  key: string;
  params: Record<string, any> | undefined;
};

type ExtractArgsFromValue<Value> = Value extends { __params: any } ? [params: Value['__params']] : [];

export const localizationKeys = <Key extends DefaultLocalizationKey, Value extends LocalizationKeyToValue<Key>>(
  key: Key,
  ...args: ExtractArgsFromValue<Value>
): LocalizationKey => {
  return { key, params: args[0] } as LocalizationKey;
};
