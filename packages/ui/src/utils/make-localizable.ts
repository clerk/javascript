// This file contains code originally found in packages/clerk-js/src/ui/localization and modified for use within UI.

import { enUS } from '@clerk/localizations';
import { normalizeDate, titleize } from '@clerk/shared';
import type { DeepRequired, LocalizationResource, PasswordSettingsData, PathValue, RecordToPath } from '@clerk/types';

const defaultResource = enUS as DeepRequired<typeof enUS>;

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

type Tokens = Record<string, string>;

type Token = keyof Tokens | string;
type Modifier = { modifierName: keyof typeof MODIFIERS; params: string[] };
type TokenExpression = { token: Token; modifiers: Modifier[] };

type GetICUArgs<Text extends string, T extends RemovePipeUtils<Text>> = TupleParseBlock<
  T extends readonly string[] ? TupleFindBlocks<T> : FindBlocks<T>
>;

type DefaultLocalizationKey = RecordToPath<typeof defaultResource>;
type LocalizationKeyToValue<P extends DefaultLocalizationKey> = PathValue<typeof defaultResource, P>;
//@ts-ignore https://github.com/clerk/javascript/blob/5764e2911790051589bb5c4f3b1a2c79f7f30c7e/packages/clerk-js/src/ui/localization/localizationKeys.ts#L67
type LocalizationKeyToParams<P extends DefaultLocalizationKey> = GetICUArgs<LocalizationKeyToValue<P>>;

const readObjectPath = <O extends Record<string, any>>(obj: O, path: string) => {
  const props = (path || '').split('.');
  let cur = obj;
  for (let i = 0; i < props.length; i++) {
    cur = cur[props[i]];
    if (cur === undefined) {
      return undefined;
    }
  }
  return cur;
};

const applyTokensToString = (s: string | undefined, tokens: Tokens): string => {
  if (!s) {
    return '';
  }
  const { normalisedString, expressions } = parseTokensFromLocalizedString(s, tokens);
  return applyTokenExpressions(normalisedString, expressions, tokens);
};

const parseTokensFromLocalizedString = (
  s: string,
  tokens: Tokens,
): { normalisedString: string; expressions: TokenExpression[] } => {
  const matches = (s.match(/{{.+?}}/g) || []).map(m => m.replace(/[{}]/g, ''));
  const parsedMatches = matches.map(m => m.split('|').map(m => m.trim()));
  const expressions = parsedMatches
    .filter(match => match[0] in tokens)
    .map(([token, ...modifiers]) => ({
      token,
      modifiers: modifiers.map(m => getModifierWithParams(m)).filter(m => assertKnownModifier(m.modifierName)),
    }));

  let normalisedString = s;
  expressions.forEach(({ token }) => {
    // Marking the position of each token with _++token++_ so we can easily
    // replace it with its localized value in the next step
    normalisedString = normalisedString.replace(/{{.+?}}/, `_++${token}++_`);
  });
  return { expressions: expressions as TokenExpression[], normalisedString };
};

const assertKnownModifier = (s: any): s is Modifier => Object.prototype.hasOwnProperty.call(MODIFIERS, s);

const getModifierWithParams = (modifierExpression: string) => {
  const parts = modifierExpression
    .split(/[(,)]/g)
    .map(m => m.trim())
    .filter(m => !!m);
  if (parts.length === 1) {
    const [modifierName] = parts;
    return { modifierName, params: [] };
  } else {
    const [modifierName, ...params] = parts;
    return { modifierName, params: params.map(p => p.replace(/['"]+/g, '')) };
  }
};

const timeString = (val: Date | string | number, locale?: string) => {
  try {
    return new Intl.DateTimeFormat(locale || 'en-US', { timeStyle: 'short' }).format(normalizeDate(val));
  } catch (e) {
    console.warn(e);
    return '';
  }
};

const weekday = (val: Date | string | number, locale?: string, weekday?: 'long' | 'short' | 'narrow' | undefined) => {
  try {
    return new Intl.DateTimeFormat(locale || 'en-US', { weekday: weekday || 'long' }).format(normalizeDate(val));
  } catch (e) {
    console.warn(e);
    return '';
  }
};

const numeric = (val: Date | number | string, locale?: string) => {
  try {
    return new Intl.DateTimeFormat(locale || 'en-US').format(normalizeDate(val));
  } catch (e) {
    console.warn(e);
    return '';
  }
};

const MODIFIERS = {
  titleize,
  timeString,
  weekday,
  numeric,
} as const;

const applyTokenExpressions = (s: string, expressions: TokenExpression[], tokens: Tokens) => {
  expressions.forEach(({ token, modifiers }) => {
    const value = modifiers.reduce((acc, mod) => {
      try {
        return MODIFIERS[mod.modifierName](acc, ...mod.params);
      } catch (e) {
        console.warn(e);
        return '';
      }
    }, tokens[token]);
    s = s.replace(`_++${token}++_`, value);
  });
  return s;
};

export const makeLocalizeable = (resource: LocalizationResource) => {
  /**
   * Retrieves a localized string corresponding to the provided key and applies the given parameters to it.
   *
   * @template Key - A type extending DefaultLocalizationKey representing the localization key.
   * @template Params - A type extending LocalizationKeyToParams<Key> representing the parameters for the localization key.
   * @param {Key} key - The localization key to retrieve the corresponding string.
   * @param {Params} [params] - The parameters to apply to the localized string. If the parameters are not required, this can be omitted.
   * @returns {string} - The localized string with applied parameters.
   * @example
   * t('formFieldLabel__emailAddress')
   */
  const t = <Key extends DefaultLocalizationKey, Params extends LocalizationKeyToParams<Key>>(
    key: Key,
    params?: keyof Params extends never ? never : Params,
  ): string => {
    const base = readObjectPath(resource, key) as string;
    return applyTokensToString(base || '', params || {});
  };

  /**
   * Translates an error message based on the provided code and name.
   *
   * @param {string} message - The default error message.
   * @param {string} code - The error code used to fetch the translated message.
   * @param {string} name - The param name. e.g. email_address
   * @returns {string} The translated error message or the default message if no translation is found.
   * @example
   * translateError('Invalid email address', 'form_param_format_invalid', 'email_address')
   */
  const translateError = ({ message, code, name }: { message: string; code: string; name?: string }) => {
    return t(`unstable__errors.${code}__${name}` as any) || t(`unstable__errors.${code}` as any) || message;
  };

  return {
    t,
    translateError,
  };
};

export type ComplexityErrors = {
  [key in keyof Partial<Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>>]?: boolean;
};

export type UsePasswordComplexityConfig = Omit<
  PasswordSettingsData,
  'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'
>;

function listFormatSupportedLocalesOf(locale?: string | string[]) {
  if (!locale) {
    return false;
  }
  const locales = Array.isArray(locale) ? locale : [locale];
  return (Intl as any).ListFormat.supportedLocalesOf(locales).length === locales.length;
}

/**
 * Intl.ListFormat was introduced in 2021
 * It is recommended to first check for browser support before using it
 */
export function canUseListFormat(locale: string | undefined) {
  return 'ListFormat' in Intl && listFormatSupportedLocalesOf(locale);
}
export const addFullStop = (string: string | undefined) => {
  return !string ? '' : string.endsWith('.') ? string : `${string}.`;
};

export const createListFormat = (message: string[], locale: string) => {
  let messageWithPrefix: string;
  if (canUseListFormat(locale)) {
    const formatter = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
    messageWithPrefix = formatter.format(message);
  } else {
    messageWithPrefix = message.join(', ');
  }

  return messageWithPrefix;
};

const errorMessages: Record<keyof Omit<ComplexityErrors, 'allowed_special_characters'>, [string, string] | string> = {
  max_length: ['unstable__errors.passwordComplexity.maximumLength', 'length'],
  min_length: ['unstable__errors.passwordComplexity.minimumLength', 'length'],
  require_numbers: 'unstable__errors.passwordComplexity.requireNumbers',
  require_lowercase: 'unstable__errors.passwordComplexity.requireLowercase',
  require_uppercase: 'unstable__errors.passwordComplexity.requireUppercase',
  require_special_char: 'unstable__errors.passwordComplexity.requireSpecialCharacter',
};

export const translatePasswordError = ({
  codes,
  locale,
  t,
}: {
  codes: (string | [string, Record<string, string | number>])[];
  locale: string;
  t: ReturnType<typeof makeLocalizeable>['t'];
}) => {
  if (!codes || Object.keys(codes).length === 0) {
    return '';
  }

  // Because we perform strength validations only if complexity validations have passed, the presence of the string
  // zxcvbn in any of the failed validations indicates that _all_ of the validations are from zxcvbn. Thus, we need to
  // concat the localized strings together since they are each individual complete sentences.
  const hasStrengthErrors = codes.some(v => v.includes('zxcvbn'));
  if (hasStrengthErrors) {
    return codes.map(v => t(v as any)).join(' ');
  }

  // show min length error first by itself. Since the min_length error will always be a tuple, we check for both
  // isArray and that the first element is min_length
  const hasMinLengthError = codes?.some(v => Array.isArray(v) && v[0] === 'min_length') || false;

  const messages = codes
    .filter(k => (hasMinLengthError ? Array.isArray(k) && k[0] === 'min_length' : true))
    .map(k => {
      const key = Array.isArray(k) ? k[0] : k;
      const localizedKey = errorMessages[key as keyof typeof errorMessages];
      if (Array.isArray(localizedKey) && Array.isArray(k)) {
        const [lk, attr] = localizedKey;
        // Because our translations use `{{ length }}` instead of `{{ min_length }}` and `{{ max_length}}`, we simply
        // take the value of the first key. This is safe to do currently because the tuple object will only ever
        // contain one key. In the future when we update our translated strings, this can be changed to simply pass
        // through k[1] as the second argument to `t()`.
        return t(lk as any, { [attr]: Object.values(k[1])[0] });
      }
      return t(localizedKey as any);
    });

  const messageWithPrefix = createListFormat(messages, locale);

  return addFullStop(`${t('unstable__errors.passwordComplexity.sentencePrefix')} ${messageWithPrefix}`);
};
