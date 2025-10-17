const TREE_SHAKING_COMMENT_ID = 'tree-shaking';

import type { Node, Comment } from 'estree';
import { pureFunctions } from '../utils/pure-functions.ts';
import type { Scope, Rule } from 'eslint';

const getRootNode = (node: Node): Node => {
  if (node.type === 'MemberExpression') {
    return getRootNode(node.object);
  }
  return node;
};

const getChildScopeForNodeIfExists = (node: Node, currentScope: Scope.Scope) =>
  currentScope.childScopes.find(scope => scope.block === node);

const getLocalVariable = (variableName: string, scope: Scope.Scope): Scope.Variable | undefined => {
  const variableInCurrentScope = scope.variables.find(({ name }) => name === variableName);
  if (variableInCurrentScope) return variableInCurrentScope;

  if (scope.upper && scope.upper.type !== 'global') return getLocalVariable(variableName, scope.upper);
};

const flattenMemberExpressionIfPossible = (node: Node): string | null => {
  switch (node.type) {
    case 'MemberExpression':
      if (node.computed || node.property.type !== 'Identifier') {
        return null;
      }
      // eslint-disable-next-line no-case-declarations
      const flattenedParent = flattenMemberExpressionIfPossible(node.object);
      return flattenedParent && `${flattenedParent}.${node.property.name}`;
    case 'Identifier':
      return node.name;
    default:
      return null;
  }
};

const hasPureNotation = (node: Node, context: Rule.RuleContext) => {
  const leadingComments = context.getSourceCode().getCommentsBefore(node);
  if (leadingComments.length) {
    const lastComment = leadingComments[leadingComments.length - 1].value;

    // https://rollupjs.org/configuration-options/#treeshake-annotations
    if (['@__PURE__', '#__PURE__'].includes(lastComment.trim())) {
      return true;
    }
  }
};

const isPureFunction = (node: Node, context: Rule.RuleContext) => {
  if (hasPureNotation(node, context)) return true;

  const flattenedExpression = flattenMemberExpressionIfPossible(node);
  if (context.options.length > 0) {
    if (
      context.options[0].noSideEffectsWhenCalled.find(
        (whiteListedFunction: any) => whiteListedFunction.function === flattenedExpression,
      )
    ) {
      return true;
    }
  }
  return flattenedExpression && pureFunctions[flattenedExpression];
};

const noEffects = () => {};

const parseComment = (comment: Comment) =>
  comment.value
    .split(' ')
    .map(token => token.trim())
    .filter(Boolean);

const getTreeShakingComments = (comments: Comment[]) => {
  const treeShakingComments = comments
    .map(parseComment)
    .filter(([id]) => id === TREE_SHAKING_COMMENT_ID)
    .map(tokens => tokens.slice(1))
    .reduce((result, tokens) => result.concat(tokens), []);
  return { has: (token: string) => treeShakingComments.indexOf(token) >= 0 };
};

const isFunctionSideEffectFree = (
  functionName: string | undefined,
  moduleName: any,
  contextOptions: Rule.RuleContext['options'],
) => {
  if (contextOptions.length === 0) {
    return false;
  }

  for (const whiteListedFunction of contextOptions[0].noSideEffectsWhenCalled) {
    if (
      (whiteListedFunction.module === moduleName ||
        (whiteListedFunction.module === '#local' && moduleName[0] === '.')) &&
      (whiteListedFunction.functions === '*' || whiteListedFunction.functions.includes(functionName))
    ) {
      return true;
    }
  }
  return false;
};

const isLocalVariableAWhitelistedModule = (
  variable: Scope.Variable,
  property: string | undefined,
  contextOptions: Rule.RuleContext['options'],
) => {
  if (
    variable.scope.type === 'module' &&
    variable.defs[0].parent &&
    variable.defs[0].parent.type === 'ImportDeclaration'
  ) {
    return isFunctionSideEffectFree(property, variable.defs[0].parent.source.value, contextOptions);
  }
  return false;
};

const isFirstLetterUpperCase = (string: string) => string[0] >= 'A' && string[0] <= 'Z';

export {
  getChildScopeForNodeIfExists,
  getLocalVariable,
  isLocalVariableAWhitelistedModule,
  getRootNode,
  getTreeShakingComments,
  isFunctionSideEffectFree,
  isFirstLetterUpperCase,
  isPureFunction,
  noEffects,
  hasPureNotation,
};
