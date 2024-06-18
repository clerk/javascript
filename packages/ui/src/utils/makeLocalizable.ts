//@ts-nocheck test
import { normalizeDate, titleize } from '@clerk/shared';
import type { LocalizationResource } from '@clerk/types';

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
  return function (key: string, params?: any): string {
    const base = readObjectPath(resource, key) as string;
    return applyTokensToString(base || '', params);
  };
};
