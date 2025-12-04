import { useClerk } from '@clerk/shared/react';

import { useEnvironment } from '../contexts';
import { MODIFIERS } from './localizationModifiers';

export type GlobalTokens = {
  applicationName: string;
  'signIn.identifier': string;
  'user.firstName': string;
  'user.lastName': string;
  'user.username': string;
  'user.primaryEmailAddress': string;
  'user.primaryPhoneNumber': string;
};

// TODO: This type can be narrowed down when we know all
// global and local tokens used throughout the codebase
export type Tokens = GlobalTokens & Record<string, string>;

type Token = keyof Tokens | string;
type Modifier = { modifierName: keyof typeof MODIFIERS; params: string[] };
type TokenExpression = { token: Token; modifiers: Modifier[] };

export const applyTokensToString = (s: string | undefined, tokens: Tokens): string => {
  if (!s) {
    return '';
  }
  const { normalisedString, expressions } = parseTokensFromLocalizedString(s, tokens);
  return applyTokenExpressions(normalisedString, expressions, tokens);
};

export const useGlobalTokens = (): GlobalTokens => {
  const { applicationName } = useEnvironment().displayConfig;
  const { client, user } = useClerk();
  // TODO: @nikos decouple captcha from component loading
  const { signIn } = client || {};

  return {
    applicationName,
    'signIn.identifier': signIn?.identifier || '',
    'user.username': user?.username || '',
    'user.firstName': user?.firstName || '',
    'user.lastName': user?.lastName || '',
    'user.primaryEmailAddress': user?.primaryEmailAddress?.emailAddress || '',
    'user.primaryPhoneNumber': user?.primaryPhoneNumber?.phoneNumber || '',
  };
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

const applyTokenExpressions = (s: string, expressions: TokenExpression[], tokens: Tokens) => {
  expressions.forEach(({ token, modifiers }) => {
    const value = modifiers.reduce((acc, mod) => {
      try {
        return MODIFIERS[mod.modifierName](acc, ...mod.params);
      } catch (e: any) {
        console.warn(e);
        return '';
      }
    }, tokens[token]);
    s = s.replace(`_++${token}++_`, value);
  });
  return s;
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
