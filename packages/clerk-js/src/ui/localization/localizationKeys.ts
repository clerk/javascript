import type { PathValue, RecordToPath } from '@clerk/types';

import type { defaultResource } from './defaultEnglishResource';

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

type DefaultLocalizationKey = RecordToPath<typeof defaultResource>;
type LocalizationKeyToValue<P extends DefaultLocalizationKey> = PathValue<typeof defaultResource, P>;

// @ts-ignore
type LocalizationKeyToParams<P extends DefaultLocalizationKey> = GetICUArgs<LocalizationKeyToValue<P>>;

export type LocalizationKey = {
  key: string;
  params: Record<string, any> | undefined;
};

export const localizationKeys = <Key extends DefaultLocalizationKey, Params extends LocalizationKeyToParams<Key>>(
  key: Key,
  params?: keyof Params extends never ? never : Params,
): LocalizationKey => {
  return { key, params } as LocalizationKey;
};
