import { defineRule } from '@oxlint/plugins';
import type { ESTree, Scope } from '@oxlint/plugins';

import { propertyName } from '../shared/property-name.ts';
import { unwrapExpression } from '../shared/unwrap-expression.ts';

type FunctionNode = ESTree.Function | ESTree.ArrowFunctionExpression;
type Candidate =
  | { kind: 'function'; node: ESTree.Function; id: ESTree.BindingIdentifier }
  | { kind: 'variable'; node: ESTree.VariableDeclarator };

export const forwardRefParts = defineRule({
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      forwardRef:
        'Parts that render through useRender must use React.forwardRef and pass the ref to useRender (see primitives/select/select-trigger.tsx).',
    },
  },
  createOnce(context) {
    let renderCalls: ESTree.CallExpression[] = [];
    let callsByFunction = new Map<ESTree.Node, ESTree.CallExpression[]>();
    const isComponentName = (name: string) => /^[A-Z]/.test(name);

    const check = (reportNode: ESTree.Node, init: ESTree.Node) => {
      const expression = unwrapExpression(init);
      const wrapped = isForwardRefCall(expression);
      const inner = wrapped ? expression.arguments[0] : expression;
      const fn = inner === undefined ? undefined : unwrapExpression(inner);
      if (!isFunction(fn)) {
        return;
      }
      const calls = callsByFunction.get(fn) ?? [];
      if (calls.length === 0) {
        return;
      }
      const refParam = fn.params[1];
      const refName = refParam?.type === 'Identifier' ? refParam.name : undefined;
      if (!wrapped || calls.some(call => !passesRef(call, refName, context.sourceCode.getScope(call)))) {
        context.report({ node: reportNode, messageId: 'forwardRef' });
      }
    };

    const checkCandidate = (candidate: Candidate) => {
      if (candidate.kind === 'function') {
        if (isComponentName(candidate.id.name)) {
          check(candidate.id, candidate.node);
        }
        return;
      }
      const { id, init } = candidate.node;
      if (id.type === 'Identifier' && isComponentName(id.name) && init) {
        check(id, init);
      }
    };

    return {
      before() {
        renderCalls = [];
      },
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'useRender') {
          renderCalls.push(node);
        }
      },
      after() {
        if (renderCalls.length === 0) {
          return;
        }
        callsByFunction = groupByEnclosingFunction(renderCalls);
        const program = context.sourceCode.ast;
        const candidates = new Map<string, Candidate>();
        for (const statement of program.body) {
          const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
          if (declaration?.type === 'FunctionDeclaration' && declaration.id) {
            candidates.set(declaration.id.name, { kind: 'function', node: declaration, id: declaration.id });
          }
          if (declaration?.type === 'VariableDeclaration') {
            for (const declarator of declaration.declarations) {
              if (declarator.id.type === 'Identifier') {
                candidates.set(declarator.id.name, { kind: 'variable', node: declarator });
              }
            }
          }
        }

        const checked = new Set<Candidate>();
        const checkOnce = (name: string | undefined) => {
          const candidate = name === undefined ? undefined : candidates.get(name);
          if (candidate && !checked.has(candidate)) {
            checked.add(candidate);
            checkCandidate(candidate);
          }
        };

        for (const statement of program.body) {
          if (statement.type === 'ExportNamedDeclaration') {
            if (statement.declaration?.type === 'FunctionDeclaration') {
              checkOnce(statement.declaration.id?.name);
            } else if (statement.declaration?.type === 'VariableDeclaration') {
              for (const declarator of statement.declaration.declarations) {
                if (declarator.id.type === 'Identifier') {
                  checkOnce(declarator.id.name);
                }
              }
            } else if (!statement.source) {
              for (const specifier of statement.specifiers) {
                const exported = specifier.exported.type === 'Literal' ? '' : specifier.exported.name;
                if (specifier.local.type === 'Identifier' && isComponentName(exported)) {
                  checkOnce(specifier.local.name);
                }
              }
            }
          }
          if (statement.type === 'ExportDefaultDeclaration') {
            const declaration = statement.declaration;
            if (declaration.type === 'Identifier') {
              checkOnce(declaration.name);
            } else if (declaration.type === 'FunctionDeclaration' && declaration.id) {
              checkOnce(declaration.id.name);
            }
          }
        }
      },
    };
  },
});

function isForwardRefCall(node: ESTree.Node): node is ESTree.CallExpression {
  if (node.type !== 'CallExpression') {
    return false;
  }
  const callee = node.callee;
  if (callee.type === 'Identifier') {
    return callee.name === 'forwardRef';
  }
  return (
    callee.type === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'React' &&
    propertyName(callee.property, callee.computed) === 'forwardRef'
  );
}

function isFunction(node: ESTree.Node | undefined): node is FunctionNode {
  return (
    node?.type === 'FunctionDeclaration' ||
    node?.type === 'FunctionExpression' ||
    node?.type === 'ArrowFunctionExpression'
  );
}

function groupByEnclosingFunction(calls: ESTree.CallExpression[]): Map<ESTree.Node, ESTree.CallExpression[]> {
  const groups = new Map<ESTree.Node, ESTree.CallExpression[]>();
  for (const call of calls) {
    for (let current: ESTree.Node | null = call.parent; current; current = current.parent) {
      if (isFunction(current)) {
        const group = groups.get(current);
        if (group) {
          group.push(call);
        } else {
          groups.set(current, [call]);
        }
      }
    }
  }
  return groups;
}

function includesRef(value: ESTree.Node | null | undefined, refName: string | undefined, scope: Scope): boolean {
  if (!value) {
    return false;
  }
  const node = unwrapExpression(value);
  if (node.type === 'Identifier') {
    if (node.name === refName) {
      return true;
    }
    const variable = findVariable(scope, node.name);
    const definition = variable?.defs.length === 1 ? variable.defs[0] : undefined;
    return definition?.node.type === 'VariableDeclarator' && includesRef(definition.node.init, refName, scope);
  }
  if (node.type === 'LogicalExpression') {
    return includesRef(node.left, refName, scope);
  }
  if (node.type === 'ConditionalExpression') {
    return includesRef(node.consequent, refName, scope) && includesRef(node.alternate, refName, scope);
  }
  return node.type === 'ArrayExpression' && node.elements.some(element => includesRef(element, refName, scope));
}

function findVariable(scope: Scope, name: string) {
  for (let current: Scope | null = scope; current; current = current.upper) {
    const variable = current.set.get(name);
    if (variable) {
      return variable;
    }
  }
  return undefined;
}

function passesRef(call: ESTree.CallExpression, refName: string | undefined, scope: Scope): boolean {
  const [options] = call.arguments;
  if (options?.type !== 'ObjectExpression') {
    return true;
  }
  return options.properties.some(
    property =>
      property.type === 'Property' &&
      propertyName(property.key, property.computed) === 'ref' &&
      includesRef(property.value, refName, scope),
  );
}
