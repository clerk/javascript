// cf.   https://astexplorer.net
//       https://github.com/estree/estree
//       https://github.com/facebook/jsx/blob/master/AST.md
//       http://mazurov.github.io/escope-demo
//       https://npmdoc.github.io/node-npmdoc-escope/build/apidoc.html

/// <reference types="estree-jsx" />
import { Rule, Scope } from 'eslint';
import { Program, Node, BinaryOperator, LogicalOperator, UnaryOperator } from 'estree';
import {
  getChildScopeForNodeIfExists,
  isLocalVariableAWhitelistedModule,
  getLocalVariable,
  getRootNode,
  getTreeShakingComments,
  isFirstLetterUpperCase,
  isPureFunction,
  isFunctionSideEffectFree,
  noEffects,
  hasPureNotation,
} from '../utils/helpers.js';
import { Value } from '../utils/value.js';

type ListenerArgs<T, K> = [
  node: T extends { type: K } ? T : never,
  scope: Scope.Scope,
  options: Rule.RuleContext['options'],
];

type Listener<T, K> = (...args: ListenerArgs<T, K>) => void;

type ListenerWithValue<T, K> = (...args: ListenerArgs<T, K>) => Value;

type ListenerMap<T extends { type: any }> = {
  [K in T['type']]: {
    reportEffects?: Listener<T, K>;
    reportEffectsWhenAssigned?: Listener<T, K>;
    reportEffectsWhenCalled?: Listener<T, K>;
    reportEffectsWhenMutated?: Listener<T, K>;
    getValueAndReportEffects?: ListenerWithValue<T, K>;
  };
};

const COMMENT_NO_SIDE_EFFECT_WHEN_CALLED = 'no-side-effects-when-called';

const getUnknownSideEffectError = (subject: string) => `Cannot determine side-effects of ${subject}`;

const getAssignmentError = (target: string) => getUnknownSideEffectError(`assignment to ${target}`);
const getCallError = (target: string) => getUnknownSideEffectError(`calling ${target}`);
const getMutationError = (target: string) => getUnknownSideEffectError(`mutating ${target}`);

const ERROR_ASSIGN_GLOBAL = getAssignmentError('global variable');
const ERROR_CALL_DESTRUCTURED = getCallError('destructured variable');
const ERROR_CALL_GLOBAL = getCallError('global function');
const ERROR_CALL_IMPORT = getCallError('imported function');
const ERROR_CALL_MEMBER = getCallError('member function');
const ERROR_CALL_PARAMETER = getCallError('function parameter');
const ERROR_CALL_RETURN_VALUE = getCallError('function return value');
const ERROR_DEBUGGER = 'Debugger statements are side-effects';
const ERROR_DELETE_OTHER = getUnknownSideEffectError('deleting anything but a MemberExpression');
const ERROR_ITERATOR = getUnknownSideEffectError('iterating over an iterable');
const ERROR_MUTATE_DESTRUCTURED = getMutationError('destructured variable');
const ERROR_MUTATE_GLOBAL = getMutationError('global variable');
const ERROR_MUTATE_IMPORT = getMutationError('imported variable');
const ERROR_MUTATE_MEMBER = getMutationError('member');
const ERROR_MUTATE_PARAMETER = getMutationError('function parameter');
const ERROR_MUTATE_RETURN_VALUE = getMutationError('function return value');
const ERROR_MUTATE_THIS = getMutationError('unknown this value');
const ERROR_THROW = 'Throwing an error is a side-effect';

const reportSideEffectsInProgram = (context: Rule.RuleContext, programNode: Program) => {
  const checkedCalledNodes = new WeakSet();
  const checkedNodesCalledWithNew = new WeakSet();
  const checkedMutatedNodes = new WeakSet();

  const DEFINITIONS: Partial<ListenerMap<Scope.Definition>> = {
    ClassName: {
      reportEffectsWhenCalled(definition, scope, options) {
        reportSideEffectsWhenCalled(definition.node, scope, options);
      },
    },
    FunctionName: {
      reportEffectsWhenCalled(definition, scope, options) {
        reportSideEffectsWhenCalled(definition.node, scope, options);
      },
    },
    ImportBinding: {
      reportEffectsWhenCalled(definition) {
        checkedCalledNodes.add(definition);
        if (checkedCalledNodes.has(definition.name)) {
          return;
        }
        if (
          !getTreeShakingComments(context.sourceCode.getCommentsBefore(definition.name)).has(
            COMMENT_NO_SIDE_EFFECT_WHEN_CALLED,
          ) &&
          !isFunctionSideEffectFree(definition.name.name, definition.parent.source.value, context.options)
        ) {
          context.report({ node: definition.name, message: ERROR_CALL_IMPORT });
        }
      },
      reportEffectsWhenMutated(definition) {
        if (checkedMutatedNodes.has(definition.name)) {
          return;
        }
        checkedMutatedNodes.add(definition.name);
        context.report({ node: definition.name, message: ERROR_MUTATE_IMPORT });
      },
    },
    Parameter: {
      reportEffectsWhenCalled(definition) {
        if (checkedCalledNodes.has(definition.name)) {
          return;
        }
        checkedCalledNodes.add(definition.name);
        context.report({ node: definition.name, message: ERROR_CALL_PARAMETER });
      },
      reportEffectsWhenMutated(definition) {
        if (checkedMutatedNodes.has(definition.name)) {
          return;
        }
        checkedMutatedNodes.add(definition.name);
        context.report({ node: definition.name, message: ERROR_MUTATE_PARAMETER });
      },
    },
    Variable: {
      // side effects are already handled by checking write expressions in references
    },
  };

  const BINARY_OPERATORS: Record<BinaryOperator, (left: any, right: any) => any> = {
    // eslint-disable-next-line eqeqeq
    '==': (left, right) => left == right,
    // eslint-disable-next-line eqeqeq
    '!=': (left, right) => left != right,
    '===': (left, right) => left === right,
    '!==': (left, right) => left !== right,
    '<': (left, right) => left < right,
    '<=': (left, right) => left <= right,
    '>': (left, right) => left > right,
    '>=': (left, right) => left >= right,
    '<<': (left, right) => left << right,
    '>>': (left, right) => left >> right,
    '>>>': (left, right) => left >>> right,
    '+': (left, right) => left + right,
    '-': (left, right) => left - right,
    '*': (left, right) => left * right,
    '/': (left, right) => left / right,
    '%': (left, right) => left % right,
    '|': (left, right) => left | right,
    '^': (left, right) => left ^ right,
    '&': (left, right) => left & right,
    '**': (left, right) => Math.pow(left, right),
    in: (left, right) => left in right,
    instanceof: (left, right) => left instanceof right,
  };

  const LOGICAL_OPERATORS: Record<LogicalOperator, (left: any, right: any) => any> = {
    '&&': (getAndReportLeft, getAndReportRight) => {
      const leftValue = getAndReportLeft();
      if (!leftValue.hasValue) {
        getAndReportRight();
        return leftValue;
      }
      if (!leftValue.value) {
        return leftValue;
      }
      return getAndReportRight();
    },
    '||': (getAndReportLeft, getAndReportRight) => {
      const leftValue = getAndReportLeft();
      if (!leftValue.hasValue) {
        getAndReportRight();
        return leftValue;
      }
      if (leftValue.value) {
        return leftValue;
      }
      return getAndReportRight();
    },
    '??': (getAndReportLeft, getAndReportRight) => {
      const leftValue = getAndReportLeft();
      if (!leftValue.hasValue) {
        getAndReportRight();
        return leftValue;
      }
      if (leftValue.value) {
        return leftValue;
      }
      return getAndReportRight();
    },
  };

  const UNARY_OPERATORS: Record<UnaryOperator, (...args: any[]) => Value> = {
    '-': value => Value.of(-value),
    '+': value => Value.of(+value),
    '!': value => Value.of(!value),
    '~': value => Value.of(~value),
    typeof: value => Value.of(typeof value),
    void: () => Value.of(undefined),
    delete: () => Value.unknown(),
  };

  // @ts-ignore TODO:
  const NODES: ListenerMap<Node> = {
    ArrayExpression: {
      reportEffects(node, scope, options) {
        node.elements.forEach(subNode => {
          if (subNode) reportSideEffects(subNode, scope, options);
        });
      },
    },

    ArrayPattern: {
      reportEffects(node, scope, options) {
        node.elements.forEach(subNode => {
          if (subNode) reportSideEffects(subNode, scope, options);
        });
      },
    },

    ArrowFunctionExpression: {
      reportEffects: noEffects,
      reportEffectsWhenCalled(node, scope, options) {
        node.params.forEach(subNode => reportSideEffects(subNode, scope, options));
        const functionScope = getChildScopeForNodeIfExists(node, scope);
        if (!functionScope) {
          reportFatalError(node, 'Could not find child scope for ArrowFunctionExpression.');
        } else {
          reportSideEffects(node.body, functionScope, options);
        }
      },
      reportEffectsWhenMutated: noEffects,
    },

    AssignmentExpression: {
      reportEffects(node, scope, options) {
        reportSideEffectsWhenAssigned(node.left, scope, options);
        reportSideEffects(node.right, scope, options);
      },
    },

    AssignmentPattern: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.left, scope, options);
        reportSideEffects(node.right, scope, options);
      },
    },

    AwaitExpression: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.argument, scope, options);
      },
    },

    BinaryExpression: {
      getValueAndReportEffects(node, scope, options) {
        const left = getValueAndReportSideEffects(node.left, scope, options);
        const right = getValueAndReportSideEffects(node.right, scope, options);

        if (left.hasValue && right.hasValue) {
          return Value.of(BINARY_OPERATORS[node.operator](left.value, right.value));
        }
        return Value.unknown();
      },
    },

    BlockStatement: {
      reportEffects(node, scope, options) {
        const blockScope = getChildScopeForNodeIfExists(node, scope) || scope;
        node.body.forEach(subNode => reportSideEffects(subNode, blockScope, options));
      },
    },

    BreakStatement: {
      reportEffects: noEffects,
    },

    CallExpression: {
      reportEffects(node, scope, options) {
        node.arguments.forEach(subNode => reportSideEffects(subNode, scope, options));
        reportSideEffectsWhenCalled(node.callee, scope, Object.assign({}, options, { calledWithNew: false }));
      },
      reportEffectsWhenCalled(node, scope) {
        if (node.callee.type === 'Identifier') {
          const localVariable = getLocalVariable(node.callee.name, scope);
          if (localVariable && isLocalVariableAWhitelistedModule(localVariable, undefined, context.options)) {
            return;
          }
          context.report({ node, message: ERROR_CALL_RETURN_VALUE });
        }
      },
      reportEffectsWhenMutated(node) {
        context.report({ node, message: ERROR_MUTATE_RETURN_VALUE });
      },
    },

    CatchClause: {
      reportEffects(node, scope, options) {
        const catchScope = getChildScopeForNodeIfExists(node, scope);
        if (!catchScope) {
          reportFatalError(node, 'Could not find child scope for CatchClause.');
        } else {
          reportSideEffects(node.body, catchScope, options);
        }
      },
    },

    ChainExpression: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.expression, scope, options);
      },
    },

    ClassBody: {
      reportEffects(node, scope, options) {
        node.body.forEach(subNode => reportSideEffects(subNode, scope, options));
      },
      reportEffectsWhenCalled(node, scope, options) {
        const classConstructor = node.body.find(
          subNode => subNode.type === 'MethodDefinition' && subNode.kind === 'constructor',
        );
        if (classConstructor) {
          reportSideEffectsWhenCalled(classConstructor, scope, options);
        } else if ((options as any).superClass) {
          reportSideEffectsWhenCalled((options as any).superClass, scope, options);
        }

        node.body
          .filter(subNode => subNode.type === 'PropertyDefinition')
          .forEach(subNode => reportSideEffectsWhenCalled(subNode, scope, options));
      },
    },

    ClassDeclaration: {
      reportEffects(node, scope, options) {
        if (node.superClass) reportSideEffects(node.superClass, scope, options);
        reportSideEffects(node.body, scope, options);
      },
      reportEffectsWhenCalled(node, scope, options) {
        const classScope = getChildScopeForNodeIfExists(node, scope);
        if (!classScope) {
          reportFatalError(node, 'Could not find child scope for ClassDeclaration.');
        } else {
          reportSideEffectsWhenCalled(
            node.body,
            classScope,
            Object.assign({}, options, { superClass: node.superClass }),
          );
        }
      },
    },

    ClassExpression: {
      reportEffects(node, scope, options) {
        if (node.superClass) reportSideEffects(node.superClass, scope, options);
        reportSideEffects(node.body, scope, options);
      },
      reportEffectsWhenCalled(node, scope, options) {
        const classScope = getChildScopeForNodeIfExists(node, scope);
        if (!classScope) {
          reportFatalError(node, 'Could not find child scope for ClassExpression.');
        } else {
          reportSideEffectsWhenCalled(
            node.body,
            classScope,
            Object.assign({}, options, { superClass: node.superClass }),
          );
        }
      },
    },

    ConditionalExpression: {
      getValueAndReportEffects(node, scope, options) {
        const testResult = getValueAndReportSideEffects(node.test, scope, options);
        if (testResult.hasValue) {
          return testResult.value
            ? getValueAndReportSideEffects(node.consequent, scope, options)
            : getValueAndReportSideEffects(node.alternate, scope, options);
        } else {
          reportSideEffects(node.consequent, scope, options);
          reportSideEffects(node.alternate, scope, options);
          return testResult;
        }
      },
      reportEffectsWhenCalled(node, scope, options) {
        const testResult = getValueAndReportSideEffects(node.test, scope, options);
        if (testResult.hasValue) {
          return testResult.value
            ? reportSideEffectsWhenCalled(node.consequent, scope, options)
            : reportSideEffectsWhenCalled(node.alternate, scope, options);
        } else {
          reportSideEffectsWhenCalled(node.consequent, scope, options);
          reportSideEffectsWhenCalled(node.alternate, scope, options);
        }
      },
    },

    ContinueStatement: {
      reportEffects: noEffects,
    },

    DebuggerStatement: {
      reportEffects(node) {
        context.report({ node, message: ERROR_DEBUGGER });
      },
    },

    DoWhileStatement: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.test, scope, options);
        reportSideEffects(node.body, scope, options);
      },
    },

    EmptyStatement: {
      reportEffects: noEffects,
    },

    ExportAllDeclaration: {
      reportEffects: noEffects,
    },

    ExportDefaultDeclaration: {
      reportEffects(node, scope, options) {
        if (node.declaration.type !== 'FunctionDeclaration' && node.declaration.type !== 'ClassDeclaration') {
          if (
            getTreeShakingComments(context.sourceCode.getCommentsBefore(node.declaration)).has(
              COMMENT_NO_SIDE_EFFECT_WHEN_CALLED,
            )
          ) {
            reportSideEffectsWhenCalled(node.declaration, scope, options);
          }
          reportSideEffects(node.declaration, scope, options);
        }
      },
    },

    ExportNamedDeclaration: {
      reportEffects(node, scope, options) {
        node.specifiers.forEach(subNode => reportSideEffects(subNode, scope, options));
        if (node.declaration) reportSideEffects(node.declaration, scope, options);
      },
    },

    ExportSpecifier: {
      reportEffects(node, scope, options) {
        if (
          getTreeShakingComments(context.sourceCode.getCommentsBefore(node.exported)).has(
            COMMENT_NO_SIDE_EFFECT_WHEN_CALLED,
          )
        ) {
          reportSideEffectsWhenCalled(node.exported, scope, options);
        }
      },
    },

    ExpressionStatement: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.expression, scope, options);
      },
    },

    ForInStatement: {
      reportEffects(node, scope, options) {
        const forScope = getChildScopeForNodeIfExists(node, scope) || scope;
        if (node.left.type !== 'VariableDeclaration') {
          reportSideEffectsWhenAssigned(node.left, forScope, options);
        }
        reportSideEffects(node.right, forScope, options);
        reportSideEffects(node.body, forScope, options);
      },
    },

    ForOfStatement: {
      reportEffects(node, scope, options) {
        const forScope = getChildScopeForNodeIfExists(node, scope) || scope;
        if (node.left.type !== 'VariableDeclaration') {
          reportSideEffectsWhenAssigned(node.left, forScope, options);
        }
        reportSideEffects(node.right, forScope, options);
        reportSideEffects(node.body, forScope, options);
        context.report({ node: node.right, message: ERROR_ITERATOR });
      },
    },

    ForStatement: {
      reportEffects(node, scope, options) {
        const forScope = getChildScopeForNodeIfExists(node, scope) || scope;
        if (node.init) reportSideEffects(node.init, forScope, options);
        if (node.test) reportSideEffects(node.test, forScope, options);
        if (node.update) reportSideEffects(node.update, forScope, options);
        reportSideEffects(node.body, forScope, options);
      },
    },

    FunctionDeclaration: {
      reportEffects(node, scope, options) {
        if (
          node.id &&
          getTreeShakingComments(context.sourceCode.getCommentsBefore(node.id)).has(COMMENT_NO_SIDE_EFFECT_WHEN_CALLED)
        ) {
          reportSideEffectsWhenCalled(node.id, scope, options);
        }
      },
      reportEffectsWhenCalled(node, scope, options) {
        node.params.forEach(subNode => reportSideEffects(subNode, scope, options));
        const functionScope = getChildScopeForNodeIfExists(node, scope);
        if (!functionScope) {
          reportFatalError(node, 'Could not find child scope for FunctionDeclaration.');
        } else {
          reportSideEffects(
            node.body,
            functionScope,
            Object.assign({}, options, { hasValidThis: (options as any).calledWithNew }),
          );
        }
      },
    },

    FunctionExpression: {
      reportEffects: noEffects,
      reportEffectsWhenCalled(node, scope, options) {
        node.params.forEach(subNode => reportSideEffects(subNode, scope, options));
        const functionScope = getChildScopeForNodeIfExists(node, scope);
        if (!functionScope) {
          reportFatalError(node, 'Could not find child scope for FunctionExpression.');
        } else {
          reportSideEffects(
            node.body,
            functionScope,
            Object.assign({}, options, { hasValidThis: (options as any).calledWithNew }),
          );
        }
      },
    },

    Identifier: {
      reportEffects: noEffects,
      reportEffectsWhenAssigned(node, scope) {
        if (!getLocalVariable(node.name, scope)) {
          context.report({ node, message: ERROR_ASSIGN_GLOBAL });
        }
      },
      reportEffectsWhenCalled(node, scope, options) {
        if (isPureFunction(node, context)) {
          return;
        }

        const variableInScope = getLocalVariable(node.name, scope);
        if (variableInScope) {
          // @ts-ignore TODO:
          variableInScope.references.forEach(({ from, identifier, partial, writeExpr }) => {
            if (partial) {
              context.report({ node: identifier, message: ERROR_CALL_DESTRUCTURED });
            } else {
              writeExpr && reportSideEffectsWhenCalled(writeExpr, from, options);
            }
          });
          variableInScope.defs.forEach(reportSideEffectsInDefinitionWhenCalled(variableInScope.scope, options));
        } else {
          context.report({ node, message: ERROR_CALL_GLOBAL });
        }
      },
      reportEffectsWhenMutated(node, scope, options) {
        const localVariable = getLocalVariable(node.name, scope);
        if (localVariable) {
          // @ts-ignore TODO:
          localVariable.references.forEach(({ from, identifier, partial, writeExpr }) => {
            if (partial) {
              context.report({ node: identifier, message: ERROR_MUTATE_DESTRUCTURED });
            } else {
              writeExpr && reportSideEffectsWhenMutated(writeExpr, from, options);
            }
          });
          localVariable.defs.forEach(reportSideEffectsInDefinitionWhenMutated(localVariable.scope, options));
        } else {
          context.report({ node, message: ERROR_MUTATE_GLOBAL });
        }
      },
    },

    IfStatement: {
      reportEffects(node, scope, options) {
        const testResult = getValueAndReportSideEffects(node.test, scope, options);
        if (testResult.hasValue) {
          if (testResult.value) {
            reportSideEffects(node.consequent, scope, options);
          } else if (node.alternate) {
            reportSideEffects(node.alternate, scope, options);
          }
        } else {
          reportSideEffects(node.consequent, scope, options);
          if (node.alternate) reportSideEffects(node.alternate, scope, options);
        }
      },
    },

    ImportDeclaration: {
      reportEffects: noEffects,
    },

    JSXAttribute: {
      reportEffects(node, scope, options) {
        if (node.value) reportSideEffects(node.value, scope, options);
      },
    },

    JSXElement: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.openingElement, scope, options);
        // @ts-ignore TODO:
        node.children.forEach(subNode => reportSideEffects(subNode, scope, options));
      },
    },

    JSXEmptyExpression: {
      reportEffects: noEffects,
    },

    JSXExpressionContainer: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.expression, scope, options);
      },
    },

    JSXIdentifier: {
      reportEffectsWhenCalled(node, scope, options) {
        if (isFirstLetterUpperCase(node.name)) {
          const variableInScope = getLocalVariable(node.name, scope);
          if (variableInScope) {
            // @ts-ignore TODO:
            variableInScope.references.forEach(({ from, identifier, partial, writeExpr }) => {
              if (partial) {
                context.report({ node: identifier, message: ERROR_CALL_DESTRUCTURED });
              } else {
                if (writeExpr)
                  reportSideEffectsWhenCalled(writeExpr, from, Object.assign({}, options, { calledWithNew: true }));
              }
            });
            variableInScope.defs.forEach(
              reportSideEffectsInDefinitionWhenCalled(
                variableInScope.scope,
                Object.assign({}, options, { calledWithNew: true }),
              ),
            );
          } else {
            context.report({ node, message: ERROR_CALL_GLOBAL });
          }
        }
      },
    },

    JSXMemberExpression: {
      reportEffectsWhenCalled(node) {
        context.report({ node: node.property, message: ERROR_CALL_MEMBER });
      },
    },

    JSXOpeningElement: {
      reportEffects(node, scope, options) {
        reportSideEffectsWhenCalled(node.name, scope, options);
        node.attributes.forEach(subNode => reportSideEffects(subNode, scope, options));
      },
    },

    JSXSpreadAttribute: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.argument, scope, options);
      },
    },

    JSXText: {
      reportEffects: noEffects,
    },

    LabeledStatement: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.body, scope, options);
      },
    },

    Literal: {
      getValueAndReportEffects(node) {
        return Value.of(node.value);
      },
    },

    LogicalExpression: {
      getValueAndReportEffects(node, scope, options) {
        return LOGICAL_OPERATORS[node.operator](
          () => getValueAndReportSideEffects(node.left, scope, options),
          () => getValueAndReportSideEffects(node.right, scope, options),
        );
      },
    },

    MemberExpression: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.property, scope, options);
        reportSideEffects(node.object, scope, options);
      },
      reportEffectsWhenAssigned(node, scope, options) {
        reportSideEffects(node, scope, options);
        reportSideEffectsWhenMutated(node.object, scope, options);
      },
      reportEffectsWhenMutated(node) {
        context.report({ node: node.property, message: ERROR_MUTATE_MEMBER });
      },
      reportEffectsWhenCalled(node, scope, options) {
        reportSideEffects(node, scope, options);
        const rootNode = getRootNode(node);
        if (rootNode.type !== 'Identifier') {
          context.report({ node: node.property, message: ERROR_CALL_MEMBER });
          return;
        }
        const localVariable = getLocalVariable(rootNode.name, scope);
        if (localVariable) {
          if (
            (node.property.type === 'Identifier' &&
              isLocalVariableAWhitelistedModule(localVariable, node.property.name, context.options)) ||
            hasPureNotation(node, context)
          ) {
            return;
          } else {
            context.report({ node: node.property, message: ERROR_CALL_MEMBER });
            return;
          }
        }
        if (!isPureFunction(node, context)) {
          context.report({ node: node.property, message: ERROR_CALL_MEMBER });
        }
      },
    },

    MetaProperty: {
      reportEffects: noEffects,
    },

    MethodDefinition: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.key, scope, options);
      },
      reportEffectsWhenCalled(node, scope, options) {
        reportSideEffectsWhenCalled(node.value, scope, options);
      },
    },

    NewExpression: {
      reportEffects(node, scope, options) {
        if (hasPureNotation(node, context)) {
          return false;
        }

        node.arguments.forEach(subNode => reportSideEffects(subNode, scope, options));
        reportSideEffectsWhenCalled(node.callee, scope, Object.assign({}, options, { calledWithNew: true }));
      },
    },

    ObjectExpression: {
      reportEffects(node, scope, options) {
        node.properties.forEach(subNode => {
          if (subNode.type === 'Property') {
            reportSideEffects(subNode.key, scope, options);
            reportSideEffects(subNode.value, scope, options);
          }
        });
      },
      reportEffectsWhenMutated: noEffects,
    },

    ObjectPattern: {
      reportEffects(node, scope, options) {
        node.properties.forEach(subNode => {
          if (subNode.type === 'Property') {
            reportSideEffects(subNode.key, scope, options);
            reportSideEffects(subNode.value, scope, options);
          }
        });
      },
    },

    PrivateIdentifier: {
      reportEffects: noEffects,
    },

    PropertyDefinition: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.key, scope, options);
      },
      reportEffectsWhenCalled(node, scope, options) {
        if (node.value) reportSideEffects(node.value, scope, options);
      },
    },

    RestElement: {
      reportEffects: noEffects,
    },

    ReturnStatement: {
      reportEffects(node, scope, options) {
        if (node.argument) reportSideEffects(node.argument, scope, options);
      },
    },

    SequenceExpression: {
      getValueAndReportEffects(node, scope, options) {
        return node.expressions.reduce(
          (result, expression) => getValueAndReportSideEffects(expression, scope, options),
          Value.unknown(),
        );
      },
    },

    Super: {
      reportEffects: noEffects,
      reportEffectsWhenCalled(node, scope, options) {
        context.report({ node, message: getCallError('super') });
      },
    },

    SwitchCase: {
      reportEffects(node, scope, options) {
        if (node.test) reportSideEffects(node.test, scope, options);
        node.consequent.forEach(subNode => reportSideEffects(subNode, scope, options));
      },
    },

    SwitchStatement: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.discriminant, scope, options);
        const switchScope = getChildScopeForNodeIfExists(node, scope);
        if (!switchScope) {
          reportFatalError(node, 'Could not find child scope for SwitchStatement.');
        } else {
          node.cases.forEach(subNode => reportSideEffects(subNode, switchScope, options));
        }
      },
    },

    TaggedTemplateExpression: {
      reportEffects(node, scope, options) {
        reportSideEffectsWhenCalled(node.tag, scope, options);
        reportSideEffects(node.quasi, scope, options);
      },
    },

    TemplateLiteral: {
      reportEffects(node, scope, options) {
        node.expressions.forEach(subNode => reportSideEffects(subNode, scope, options));
      },
    },

    ThisExpression: {
      reportEffects: noEffects,
      reportEffectsWhenMutated(node, scope, options) {
        // @ts-ignore TODO:
        if (!options.hasValidThis) {
          context.report({ node, message: ERROR_MUTATE_THIS });
        }
      },
    },

    ThrowStatement: {
      reportEffects(node) {
        context.report({ node, message: ERROR_THROW });
      },
    },

    TryStatement: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.block, scope, options);
        if (node.handler) reportSideEffects(node.handler, scope, options);
        if (node.finalizer) reportSideEffects(node.finalizer, scope, options);
      },
    },

    UnaryExpression: {
      getValueAndReportEffects(node, scope, options) {
        if (node.operator === 'delete') {
          if (node.argument.type !== 'MemberExpression') {
            context.report({ node: node.argument, message: ERROR_DELETE_OTHER });
          } else {
            reportSideEffectsWhenMutated(node.argument.object, scope, options);
          }
        }
        return getValueAndReportSideEffects(node.argument, scope, options).chain(UNARY_OPERATORS[node.operator]);
      },
    },

    UpdateExpression: {
      reportEffects(node, scope, options) {
        // Increment/decrement work like "assign updated value", not like a mutation
        // cf. y={};x={y};x.y++ => x.y={y:NaN}, y={}
        reportSideEffectsWhenAssigned(node.argument, scope, options);
      },
    },

    VariableDeclaration: {
      reportEffects(node, scope, options) {
        node.declarations.forEach(declarator => reportSideEffects(declarator, scope, options));
      },
    },

    VariableDeclarator: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.id, scope, options);
        if (
          getTreeShakingComments(context.sourceCode.getCommentsBefore(node.id)).has(COMMENT_NO_SIDE_EFFECT_WHEN_CALLED)
        ) {
          reportSideEffectsWhenCalled(node.id, scope, options);
        }
        if (node.init) reportSideEffects(node.init, scope, options);
      },
    },

    WhileStatement: {
      reportEffects(node, scope, options) {
        reportSideEffects(node.test, scope, options);
        reportSideEffects(node.body, scope, options);
      },
    },

    YieldExpression: {
      reportEffects(node, scope, options) {
        if (node.argument) reportSideEffects(node.argument, scope, options);
      },
    },
  };

  const verifyNodeTypeIsKnown = (node: Node) => {
    if (!node) {
      return false;
    }
    if (!NODES[node.type]) {
      if (!node.type.startsWith('TS')) {
        reportFatalError(node, `Unknown node type ${node.type}.`);
      }
      return false;
    }
    return true;
  };

  function reportSideEffects(node: Node, scope: Scope.Scope, options: Rule.RuleContext['options']) {
    if (!verifyNodeTypeIsKnown(node)) {
      return;
    }
    const { reportEffects, getValueAndReportEffects } = NODES[node.type];
    if (reportEffects) {
      reportEffects(node as any, scope, options);
    } else if (getValueAndReportEffects) {
      getValueAndReportEffects(node as any, scope, options);
    } else {
      context.report({ node, message: getUnknownSideEffectError(node.type) });
    }
  }

  function reportSideEffectsWhenAssigned(node: Node, scope: Scope.Scope, options: Rule.RuleContext['options']) {
    if (!verifyNodeTypeIsKnown(node)) {
      return;
    }
    const { reportEffectsWhenAssigned } = NODES[node.type];
    if (reportEffectsWhenAssigned) {
      reportEffectsWhenAssigned(node as any, scope, options);
    } else {
      context.report({ node, message: getAssignmentError(node.type) });
    }
  }

  function reportSideEffectsWhenMutated(node: Node, scope: Scope.Scope, options: Rule.RuleContext['options']) {
    if (!verifyNodeTypeIsKnown(node) || checkedMutatedNodes.has(node)) {
      return;
    }
    checkedMutatedNodes.add(node);
    const { reportEffectsWhenMutated } = NODES[node.type];
    if (reportEffectsWhenMutated) {
      reportEffectsWhenMutated(node as any, scope, options);
    } else {
      context.report({ node, message: getMutationError(node.type) });
    }
  }

  function reportSideEffectsWhenCalled(node: Node, scope: Scope.Scope, options: Rule.RuleContext['options']) {
    if (
      !verifyNodeTypeIsKnown(node) ||
      checkedCalledNodes.has(node) ||
      ((options as any).calledWithNew && checkedNodesCalledWithNew.has(node))
    ) {
      return;
    }
    if ((options as any).calledWithNew) {
      checkedNodesCalledWithNew.add(node);
    } else {
      checkedCalledNodes.add(node);
    }
    const { reportEffectsWhenCalled } = NODES[node.type];
    if (reportEffectsWhenCalled) {
      reportEffectsWhenCalled(node as any, scope, options);
    } else {
      context.report({ node, message: getCallError(node.type) });
    }
  }

  function getValueAndReportSideEffects(node: Node, scope: Scope.Scope, options: Rule.RuleContext['options']): Value {
    if (!verifyNodeTypeIsKnown(node)) {
      return Value.unknown();
    }
    const { getValueAndReportEffects } = NODES[node.type];
    if (getValueAndReportEffects) {
      return getValueAndReportEffects(node as any, scope, options);
    }
    reportSideEffects(node, scope, options);
    return Value.unknown();
  }

  const verifyDefinitionTypeIsKnown = (definition: Scope.Definition) => {
    if (!DEFINITIONS[definition.type]) {
      reportFatalError(definition.name, `Unknown definition type ${definition.type}.`);
      return false;
    }
    return true;
  };

  function reportSideEffectsInDefinitionWhenCalled(scope: Scope.Scope, options: Rule.RuleContext['options']) {
    return (definition: Scope.Definition) => {
      if (!verifyDefinitionTypeIsKnown(definition)) {
        return;
      }
      DEFINITIONS[definition.type]?.reportEffectsWhenCalled?.(definition as any, scope, options);
    };
  }

  function reportSideEffectsInDefinitionWhenMutated(scope: Scope.Scope, options: Rule.RuleContext['options']) {
    return (definition: Scope.Definition) => {
      if (!verifyDefinitionTypeIsKnown(definition)) {
        return;
      }
      DEFINITIONS[definition.type]?.reportEffectsWhenMutated?.(definition as any, scope, options);
    };
  }

  function reportFatalError(node: Node, message: string) {
    context.report({
      node,
      message:
        message +
        '\nIf you are using the latest version of this plugin, please ' +
        'consider filing an issue noting this message, the offending statement, your ESLint ' +
        'version, and any active ESLint presets and plugins',
    });
  }

  const sourceCode = context.sourceCode;
  const moduleScope = getChildScopeForNodeIfExists(programNode, sourceCode.getScope(programNode));
  if (!moduleScope) {
    reportFatalError(programNode, 'Could not find module scope.');
  } else {
    programNode.body.forEach(subNode => reportSideEffects(subNode, moduleScope, {} as any));
  }
};

export const noSideEffectsInInitialization: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'disallow side-effects in module initialization',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          noSideEffectsWhenCalled: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'object',
                  properties: {
                    module: { type: 'string' },
                    functions: {
                      anyOf: [
                        { type: 'string', pattern: '^\\*$' },
                        { type: 'array', items: { type: 'string' } },
                      ],
                    },
                  },
                  additionalProperties: false,
                },
                {
                  type: 'object',
                  properties: {
                    function: { type: 'string' },
                  },
                  additionalProperties: false,
                },
              ],
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create: context => ({
    Program: node => reportSideEffectsInProgram(context, node),
  }),
};
