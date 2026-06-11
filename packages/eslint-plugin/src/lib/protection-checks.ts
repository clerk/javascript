/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/**
 * AST detection for "is this function protected at its top?"
 */

import type { TSESTree } from '@typescript-eslint/utils';

import type { FunctionNode } from './exports';

const CLERK_AUTH_SOURCE = '@clerk/nextjs/server';

/**
 * Collect the local names that `auth` is imported as from `@clerk/nextjs/server`
 * in the given module. Usually returns `{'auth'}`, but handles aliased imports
 * like `import { auth as clerkAuth } from '@clerk/nextjs/server'` correctly.
 */
export function findAuthLocalNames(programNode: TSESTree.Program): Set<string> {
  const names = new Set<string>();
  for (const stmt of programNode.body) {
    if (stmt.type !== 'ImportDeclaration') {
      continue;
    }
    if (stmt.source.value !== CLERK_AUTH_SOURCE) {
      continue;
    }
    for (const spec of stmt.specifiers) {
      if (spec.type !== 'ImportSpecifier') {
        continue;
      }
      const imported = spec.imported.type === 'Identifier' ? spec.imported.name : spec.imported.value;
      if (imported === 'auth') {
        names.add(spec.local.name);
      }
    }
  }
  return names;
}

type AuthField = 'userId' | 'sessionId' | 'isAuthenticated';

const AUTH_FIELDS = new Set<AuthField>(['userId', 'sessionId', 'isAuthenticated']);

// We don't trace these to actual imports like with `auth`, as all we really care
// about is that the code stops executing at this point. Tracing these to imports
// would be complex, not worth the effort (at this point) and disallow any type
// of wrapper that eventually calls these functions behind the scenes.
// Essentially, if you name something to any of these, we'll credit you with an exit.
const EXIT_FUNCTIONS = new Set(['redirect', 'permanentRedirect', 'notFound', 'unauthorized', 'forbidden']);

function isProtectCall(node: TSESTree.Node | null | undefined, authNames: Set<string>): boolean {
  if (!node || node.type !== 'CallExpression') {
    return false;
  }
  const callee = node.callee;
  if (callee.type !== 'MemberExpression') {
    return false;
  }
  if (callee.property.type !== 'Identifier' || callee.property.name !== 'protect') {
    return false;
  }
  if (callee.object.type === 'Identifier' && authNames.has(callee.object.name)) {
    return true;
  }
  if (
    callee.object.type === 'AwaitExpression' &&
    callee.object.argument.type === 'CallExpression' &&
    callee.object.argument.callee.type === 'Identifier' &&
    authNames.has(callee.object.argument.callee.name)
  ) {
    return true;
  }
  return false;
}

function isProtectAwait(node: TSESTree.Node | null | undefined, authNames: Set<string>): boolean {
  return !!node && node.type === 'AwaitExpression' && isProtectCall(node.argument, authNames);
}

function isProtectAwaitStatement(stmt: TSESTree.Statement, authNames: Set<string>): boolean {
  if (stmt.type === 'ExpressionStatement') {
    return isProtectAwait(stmt.expression, authNames);
  }
  if (stmt.type === 'VariableDeclaration') {
    // Only the first declarator counts: later declarators are preceded by
    // earlier ones executing first, so `auth.protect()` wouldn't be at the top.
    const first = stmt.declarations[0];
    return first != null && isProtectAwait(first.init ?? undefined, authNames);
  }
  return false;
}

function capturedAuthBindings(stmt: TSESTree.Statement, authNames: Set<string>): Set<AuthField> | null {
  if (stmt.type !== 'VariableDeclaration') {
    return null;
  }

  // Require a single declarator: a multi-declarator statement such as
  // `const { userId } = await auth(), side = doWork()` runs `side = doWork()`
  // after the destructure but before the guard, so it must not be treated as
  // protected (matching the rejection of any statement between destructure and
  // guard).
  if (stmt.declarations.length !== 1) {
    return null;
  }

  const decl = stmt.declarations[0];
  if (!decl) {
    return null;
  }
  if (decl.id.type !== 'ObjectPattern') {
    return null;
  }
  if (!decl.init || decl.init.type !== 'AwaitExpression') {
    return null;
  }
  const arg = decl.init.argument;
  if (arg.type !== 'CallExpression') {
    return null;
  }
  if (arg.callee.type !== 'Identifier' || !authNames.has(arg.callee.name)) {
    return null;
  }

  const bindings = new Set<AuthField>();
  for (const prop of decl.id.properties) {
    if (prop.type !== 'Property') {
      continue;
    }
    if (prop.key.type !== 'Identifier') {
      continue;
    }
    const fieldName = prop.key.name;
    if (!AUTH_FIELDS.has(fieldName as AuthField)) {
      continue;
    }
    if (prop.value.type !== 'Identifier' || prop.value.name !== fieldName) {
      continue;
    }
    bindings.add(fieldName as AuthField);
  }
  return bindings.size > 0 ? bindings : null;
}

function isRecognizedAuthCheck(test: TSESTree.Expression, bindings: Set<AuthField>): boolean {
  if (test.type === 'UnaryExpression' && test.operator === '!') {
    if (
      test.argument.type === 'Identifier' &&
      test.argument.name === 'isAuthenticated' &&
      bindings.has('isAuthenticated')
    ) {
      return true;
    }
    return false;
  }

  if (test.type !== 'BinaryExpression') {
    return false;
  }
  if (test.operator !== '===' && test.operator !== '==') {
    return false;
  }

  let id: TSESTree.Identifier;
  let other: TSESTree.Expression;
  if (test.left.type === 'Identifier' && bindings.has(test.left.name as AuthField)) {
    id = test.left;
    other = test.right;
  } else if (test.right.type === 'Identifier' && bindings.has(test.right.name as AuthField)) {
    id = test.right;
    other = test.left;
  } else {
    return false;
  }

  const name = id.name as AuthField;

  if (name === 'userId' || name === 'sessionId') {
    return other.type === 'Literal' && other.value === null;
  }
  if (name === 'isAuthenticated') {
    return test.operator === '===' && other.type === 'Literal' && other.value === false;
  }
  return false;
}

function isExitCall(expr: TSESTree.Expression | null | undefined): boolean {
  if (!expr || expr.type !== 'CallExpression') {
    return false;
  }
  if (expr.callee.type !== 'Identifier') {
    return false;
  }
  return EXIT_FUNCTIONS.has(expr.callee.name);
}

function statementExits(stmt: TSESTree.Statement | null | undefined): boolean {
  if (!stmt) {
    return false;
  }
  if (stmt.type === 'ReturnStatement') {
    return true;
  }
  if (stmt.type === 'ThrowStatement') {
    return true;
  }
  if (stmt.type === 'ExpressionStatement') {
    return isExitCall(stmt.expression);
  }
  return false;
}

function consequentExits(consequent: TSESTree.Statement | null | undefined): boolean {
  if (!consequent) {
    return false;
  }
  if (statementExits(consequent)) {
    return true;
  }
  if (consequent.type === 'BlockStatement') {
    // A guaranteed top-level exit anywhere in the block is enough: the block
    // only runs in the unauthenticated branch the developer is explicitly
    // handling, and once it exits, the protected code below is unreachable for
    // a signed-out user. Work the developer chooses to run before bailing
    // (logging, cleanup, etc.) is their deliberate call, so we don't forbid it.
    return consequent.body.some(statementExits);
  }
  return false;
}

function isAuthGuardWithExit(stmt: TSESTree.Statement, bindings: Set<AuthField>): boolean {
  if (stmt.type !== 'IfStatement') {
    return false;
  }
  if (!isRecognizedAuthCheck(stmt.test, bindings)) {
    return false;
  }
  return consequentExits(stmt.consequent);
}

function isNonRuntimeStatement(stmt: TSESTree.Statement): boolean {
  if (stmt.type === 'ExpressionStatement' && stmt.directive) {
    return true;
  }
  if (stmt.type === 'TSTypeAliasDeclaration') {
    return true;
  }
  if (stmt.type === 'TSInterfaceDeclaration') {
    return true;
  }
  return false;
}

function nextExecutable(stmts: TSESTree.Statement[], from: number): number {
  let i = from;
  while (i < stmts.length && isNonRuntimeStatement(stmts[i])) {
    i++;
  }
  return i;
}

export function hasProtectAtTop(fn: FunctionNode | null | undefined, authNames: Set<string>): boolean {
  if (!fn || !fn.async) {
    return false;
  }

  const body = fn.body;
  if (body && body.type !== 'BlockStatement') {
    return body.type === 'AwaitExpression' && isProtectCall(body.argument, authNames);
  }
  if (!body || body.type !== 'BlockStatement') {
    return false;
  }

  const stmts = body.body;
  const first = nextExecutable(stmts, 0);
  if (first >= stmts.length) {
    return false;
  }

  if (isProtectAwaitStatement(stmts[first], authNames)) {
    return true;
  }

  const captured = capturedAuthBindings(stmts[first], authNames);
  if (captured) {
    const second = nextExecutable(stmts, first + 1);
    if (second < stmts.length && isAuthGuardWithExit(stmts[second], captured)) {
      return true;
    }
  }

  return false;
}
