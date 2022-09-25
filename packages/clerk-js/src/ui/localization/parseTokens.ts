import { useCoreClerk, useEnvironment } from '../contexts';
import { titleize } from '../shared';

const MODIFIERS = {
  titleize,
} as const;

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
type Modifier = keyof typeof MODIFIERS;
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
  const { client, user } = useCoreClerk();
  const { signIn } = client;

  return {
    applicationName,
    'signIn.identifier': signIn.identifier || '',
    'user.username': user?.username || '',
    'user.firstName': user?.firstName || '',
    'user.lastName': user?.lastName || '',
    'user.primaryEmailAddress': user?.primaryEmailAddress?.emailAddress || '',
    'user.primaryPhoneNumber': user?.primaryPhoneNumber?.phoneNumber || '',
  };
};

const applyTokenExpressions = (s: string, expressions: TokenExpression[], tokens: Tokens) => {
  expressions.forEach(({ token, modifiers }) => {
    const value = modifiers.reduce((acc, mod) => MODIFIERS[mod](acc), tokens[token]);
    s = s.replace(`_{{${token}}_`, value);
  });
  return s;
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
      modifiers: modifiers.filter(assertKnownModifier),
    }));

  let normalisedString = s;
  expressions.forEach(({ token }) => {
    normalisedString = normalisedString.replace(/{{.+?}}/, `_{{${token}}_`);
  });
  return { expressions, normalisedString };
};

const assertKnownModifier = (s: any): s is Modifier => Object.prototype.hasOwnProperty.call(MODIFIERS, s);
