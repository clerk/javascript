/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/**
 * Reusable fixers that add `await auth.protect()` to a function.
 *
 * These are intentionally decoupled from the ESLint rule: they take a `fixer`
 * and `sourceCode` plus the resolved function node and return plain
 * `RuleFix[]`. The rule wires them into a suggestion today, but a later
 * auto-apply script (and `@clerk/upgrade`) can reuse the exact same logic.
 *
 * Mirrors the operations of the original `transform-add-auth-protect` codemod:
 *   - ensure the function is `async`
 *   - insert `await auth.protect()` as the first executable statement
 *   - add `import { auth } from '@clerk/nextjs/server'` (or merge the `auth`
 *     specifier into an existing import from that source)
 */

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import type { FunctionNode } from './exports';

const CLERK_AUTH_SOURCE = '@clerk/nextjs/server';

export interface BuildAuthProtectFixesParams {
  fixer: TSESLint.RuleFixer;
  sourceCode: TSESLint.SourceCode;
  fn: FunctionNode;
  /** Local names `auth` is already imported as, from `findAuthLocalNames`. */
  authNames: Set<string>;
}

/**
 * The local name to call `.protect()` on. Reuses an existing alias (e.g.
 * `import { auth as clerkAuth }`) when present, otherwise defaults to `auth`.
 */
export function resolveAuthName(authNames: Set<string>): string {
  for (const name of authNames) {
    return name;
  }
  return 'auth';
}

/**
 * Build the ordered, non-overlapping set of edits that protect `fn`. All edits
 * belong to a single suggestion and are applied atomically.
 */
export function buildAuthProtectFixes({
  fixer,
  sourceCode,
  fn,
  authNames,
}: BuildAuthProtectFixesParams): TSESLint.RuleFix[] {
  const program = sourceCode.ast;
  const authName = resolveAuthName(authNames);
  const fixes: TSESLint.RuleFix[] = [];

  // Order matters when insertions share a position. When the function is the
  // first statement in the file (e.g. `function Page() {}; export default Page`),
  // the import and the `async ` keyword both insert at the function's start;
  // emitting the import first keeps it on its own line above the function.
  const importFix = ensureAuthImportFix(fixer, sourceCode, program, authNames);
  if (importFix) {
    fixes.push(importFix);
  }

  const asyncFix = ensureAsyncFix(fixer, sourceCode, fn);
  if (asyncFix) {
    fixes.push(asyncFix);
  }

  fixes.push(insertProtectCallFix(fixer, sourceCode, fn, authName, authNames));

  return fixes;
}

/**
 * If `node` is `await <auth>()` (a zero-argument call to one of the imported
 * `auth` names), return the callee identifier so it can be rewritten to
 * `<auth>.protect`. Returns `null` otherwise.
 *
 * Used to merge protection into an existing call (`const { userId } = await
 * auth()` -> `const { userId } = await auth.protect()`) instead of prepending a
 * duplicate `await auth.protect();`.
 */
function mergeableAuthCallee(
  node: TSESTree.Node | null | undefined,
  authNames: Set<string>,
): TSESTree.Identifier | null {
  if (!node || node.type !== 'AwaitExpression') {
    return null;
  }
  const arg = node.argument;
  if (arg.type !== 'CallExpression' || arg.arguments.length > 0) {
    return null;
  }
  if (arg.callee.type !== 'Identifier' || !authNames.has(arg.callee.name)) {
    return null;
  }
  return arg.callee;
}

/**
 * Look for a mergeable `await <auth>()` in the first executable statement of a
 * block body — either a bare `await auth();` or the initializer of the first
 * declarator (`const { userId } = await auth();`).
 */
function firstStatementAuthCallee(stmt: TSESTree.Statement, authNames: Set<string>): TSESTree.Identifier | null {
  if (stmt.type === 'ExpressionStatement') {
    return mergeableAuthCallee(stmt.expression, authNames);
  }
  if (stmt.type === 'VariableDeclaration') {
    const first = stmt.declarations[0];
    return first ? mergeableAuthCallee(first.init, authNames) : null;
  }
  return null;
}

function getLineIndent(sourceCode: TSESLint.SourceCode, node: TSESTree.Node): string {
  const line = sourceCode.lines[node.loc.start.line - 1] ?? '';
  const match = /^\s*/.exec(line);
  return match ? match[0] : '';
}

function ensureAsyncFix(
  fixer: TSESLint.RuleFixer,
  sourceCode: TSESLint.SourceCode,
  fn: FunctionNode,
): TSESLint.RuleFix | null {
  if (fn.async) {
    return null;
  }
  const firstToken = sourceCode.getFirstToken(fn);
  if (!firstToken) {
    return null;
  }
  return fixer.insertTextBefore(firstToken, 'async ');
}

function insertProtectCallFix(
  fixer: TSESLint.RuleFixer,
  sourceCode: TSESLint.SourceCode,
  fn: FunctionNode,
  authName: string,
  authNames: Set<string>,
): TSESLint.RuleFix {
  const call = `await ${authName}.protect();`;
  const body = fn.body;

  // Concise-body arrow (`() => expr`) — merge into an existing `await auth()`
  // body, otherwise wrap in a block so we can insert.
  if (body.type !== 'BlockStatement') {
    const conciseCallee = mergeableAuthCallee(body, authNames);
    if (conciseCallee) {
      return fixer.replaceText(conciseCallee, `${conciseCallee.name}.protect`);
    }
    const fnIndent = getLineIndent(sourceCode, fn);
    const inner = `${fnIndent}  `;
    const exprText = sourceCode.getText(body);
    return fixer.replaceText(body, `{\n${inner}${call}\n${inner}return ${exprText};\n${fnIndent}}`);
  }

  const stmts = body.body;

  // Skip a leading directive prologue (e.g. an inline `'use server'`): inserting
  // before it would demote the directive to an ordinary expression statement.
  let lastDirective: TSESTree.Statement | null = null;
  let firstExecIdx = 0;
  for (const stmt of stmts) {
    if (stmt.type === 'ExpressionStatement' && stmt.directive) {
      lastDirective = stmt;
      firstExecIdx++;
    } else {
      break;
    }
  }

  // If the first executable statement already awaits `auth()`, rewrite that call
  // to `auth.protect()` rather than prepending a duplicate protection call.
  const firstExec = stmts[firstExecIdx];
  if (firstExec) {
    const mergeCallee = firstStatementAuthCallee(firstExec, authNames);
    if (mergeCallee) {
      return fixer.replaceText(mergeCallee, `${mergeCallee.name}.protect`);
    }
  }

  if (lastDirective) {
    const indent = getLineIndent(sourceCode, lastDirective);
    return fixer.insertTextAfter(lastDirective, `\n${indent}${call}`);
  }

  const firstStmt = stmts[0];
  if (firstStmt) {
    const indent = getLineIndent(sourceCode, firstStmt);
    return fixer.insertTextBefore(firstStmt, `${call}\n${indent}`);
  }

  // Empty block body.
  const openBrace = sourceCode.getFirstToken(body);
  const indent = `${getLineIndent(sourceCode, fn)}  `;
  if (openBrace) {
    return fixer.insertTextAfter(openBrace, `\n${indent}${call}`);
  }
  return fixer.insertTextBefore(body, `${call}\n`);
}

function ensureAuthImportFix(
  fixer: TSESLint.RuleFixer,
  sourceCode: TSESLint.SourceCode,
  program: TSESTree.Program,
  authNames: Set<string>,
): TSESLint.RuleFix | null {
  // `auth` is already imported (possibly aliased) — reuse it, no import change.
  if (authNames.size > 0) {
    return null;
  }

  // Past the guard above, no `auth` import exists, so the specifier is always
  // the unaliased `auth`. (Callers reuse an existing alias for the
  // `.protect()` call, but a fresh import never introduces one.)

  // Merge into an existing value import from `@clerk/nextjs/server` when it has
  // a named-specifier list we can extend.
  for (const stmt of program.body) {
    if (stmt.type !== 'ImportDeclaration') {
      continue;
    }
    if (stmt.source.value !== CLERK_AUTH_SOURCE || stmt.importKind === 'type') {
      continue;
    }
    const named = stmt.specifiers.filter((spec): spec is TSESTree.ImportSpecifier => spec.type === 'ImportSpecifier');
    const last = named[named.length - 1];
    if (last) {
      return fixer.insertTextAfter(last, ', auth');
    }
    break;
  }

  const importText = `import { auth } from '${CLERK_AUTH_SOURCE}';`;
  const stmts = program.body;

  // Insert after a leading directive prologue (module-level `'use server'` /
  // `'use client'`), otherwise before the first statement.
  let lastDirective: TSESTree.ExpressionStatement | null = null;
  for (const stmt of stmts) {
    if (stmt.type === 'ExpressionStatement' && stmt.directive) {
      lastDirective = stmt;
    } else {
      break;
    }
  }

  if (lastDirective) {
    return fixer.insertTextAfter(lastDirective, `\n${importText}`);
  }

  const firstStmt = stmts[0];
  if (firstStmt) {
    return fixer.insertTextBefore(firstStmt, `${importText}\n`);
  }

  return fixer.insertTextAfterRange([0, 0], `${importText}\n`);
}
