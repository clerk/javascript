import { defineRule } from '@oxlint/plugins';
import type { ESTree } from '@oxlint/plugins';

import { propertyName } from '../shared/property-name.ts';

type FunctionNode = ESTree.Function | ESTree.ArrowFunctionExpression;

export const noRenderClock = defineRule({
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      useNow:
        'Read the current time with useNow during render, so the server and the client agree. Date.now() and new Date() belong in effects, event handlers and machine actions.',
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (isDateNow(node.callee) && readsDuringRender(node)) {
          context.report({ node, messageId: 'useNow' });
        }
      },
      MemberExpression(node) {
        const call = callOf(node);
        if (isDateNow(node) && call && !defersCallback(call) && readsDuringRender(node)) {
          context.report({ node, messageId: 'useNow' });
        }
      },
      NewExpression(node) {
        if (isCurrentDate(node) && readsDuringRender(node)) {
          context.report({ node, messageId: 'useNow' });
        }
      },
    };
  },
});

const RENDER_HOOKS = new Set(['useState', 'useMemo', 'useReducer']);
const DEFERRED_CALLBACKS = new Set([
  'setTimeout',
  'setInterval',
  'requestAnimationFrame',
  'queueMicrotask',
  'addEventListener',
  'then',
  'catch',
  'finally',
]);
const RENDER_WRAPPERS = new Set(['forwardRef', 'memo']);

function readsDuringRender(node: ESTree.Node): boolean {
  for (let fn = enclosingFunction(node); fn; fn = enclosingFunction(fn)) {
    const call = callOf(fn);
    if (!call) {
      return /^(use[A-Z0-9]|[A-Z])/.test(functionName(fn) ?? '');
    }
    if (RENDER_WRAPPERS.has(calleeName(call) ?? '')) {
      return true;
    }
    if (defersCallback(call)) {
      return false;
    }
  }
  return false;
}

function callOf(node: ESTree.Node): ESTree.CallExpression | undefined {
  const parent = node.parent;
  return parent?.type === 'CallExpression' && parent.arguments.some(argument => argument === node) ? parent : undefined;
}

function defersCallback(call: ESTree.CallExpression): boolean {
  const name = calleeName(call) ?? '';
  return DEFERRED_CALLBACKS.has(name) || (/^use[A-Z]/.test(name) && !RENDER_HOOKS.has(name));
}

function isDateNow(node: ESTree.Node): boolean {
  return (
    node.type === 'MemberExpression' &&
    node.object.type === 'Identifier' &&
    node.object.name === 'Date' &&
    propertyName(node.property, node.computed) === 'now'
  );
}

function isCurrentDate(node: ESTree.NewExpression): boolean {
  return node.callee.type === 'Identifier' && node.callee.name === 'Date' && node.arguments.length === 0;
}

function enclosingFunction(node: ESTree.Node): FunctionNode | undefined {
  for (let current = node.parent; current; current = current.parent) {
    if (
      current.type === 'FunctionDeclaration' ||
      current.type === 'FunctionExpression' ||
      current.type === 'ArrowFunctionExpression'
    ) {
      return current;
    }
  }
  return undefined;
}

function calleeName(call: ESTree.CallExpression): string | undefined {
  if (call.callee.type === 'Identifier') {
    return call.callee.name;
  }
  return call.callee.type === 'MemberExpression' ? propertyName(call.callee.property, call.callee.computed) : undefined;
}

function functionName(fn: FunctionNode): string | undefined {
  if (fn.type !== 'ArrowFunctionExpression' && fn.id) {
    return fn.id.name;
  }
  return fn.parent.type === 'VariableDeclarator' && fn.parent.id.type === 'Identifier' ? fn.parent.id.name : undefined;
}
