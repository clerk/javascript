/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/**
 * Resolve a module's exports to the function target that will run when the framework dispatches.
 */

import type { TSESTree } from '@typescript-eslint/utils';

export type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

export type ExportTarget =
  | { kind: 'function'; node: FunctionNode }
  | { kind: 'imported'; source: string }
  | { kind: 'unknown' };

export interface NamedExportItem {
  name: string;
  target: ExportTarget;
  reportNode: TSESTree.Node;
}

export interface DefaultExportItem {
  target: ExportTarget;
  reportNode: TSESTree.Node;
}

export interface ExportAllItem {
  source: string;
  reportNode: TSESTree.Node;
}

export function unwrapFunction(node: TSESTree.Node | null | undefined): FunctionNode | null {
  if (!node) {
    return null;
  }
  if (
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression'
  ) {
    return node;
  }
  return null;
}

export function resolveLocalIdentifierTarget(programNode: TSESTree.Program, name: string): ExportTarget {
  for (const stmt of programNode.body) {
    if (stmt.type === 'FunctionDeclaration' && stmt.id && stmt.id.name === name) {
      return { kind: 'function', node: stmt };
    }
    if (stmt.type === 'VariableDeclaration') {
      for (const declarator of stmt.declarations) {
        if (declarator.id.type !== 'Identifier' || declarator.id.name !== name) {
          continue;
        }
        const initFn = unwrapFunction(declarator.init ?? undefined);
        if (initFn) {
          return { kind: 'function', node: initFn };
        }
        return { kind: 'unknown' };
      }
    }
    if (stmt.type === 'ImportDeclaration') {
      for (const spec of stmt.specifiers) {
        if (spec.local && spec.local.name === name) {
          return {
            kind: 'imported',
            source: stmt.source.value,
          };
        }
      }
    }
  }
  return { kind: 'unknown' };
}

export function resolveDefaultExportTarget(programNode: TSESTree.Program, declaration: TSESTree.Node): ExportTarget {
  const direct = unwrapFunction(declaration);
  if (direct) {
    return { kind: 'function', node: direct };
  }

  if (declaration.type !== 'Identifier') {
    return { kind: 'unknown' };
  }

  return resolveLocalIdentifierTarget(programNode, declaration.name);
}

function getExportedName(spec: TSESTree.ExportSpecifier): string | null {
  const node = spec.exported;
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  return null;
}

/**
 * Resolve the module's default export, regardless of whether it's declared with
 * `export default ...` or via a specifier such as `export { Page as default }`
 * or `export { default } from './Page'`.
 */
export function resolveDefaultExport(programNode: TSESTree.Program): DefaultExportItem | null {
  for (const stmt of programNode.body) {
    if (stmt.type === 'ExportDefaultDeclaration') {
      return {
        target: resolveDefaultExportTarget(programNode, stmt.declaration),
        reportNode: stmt,
      };
    }

    if (stmt.type !== 'ExportNamedDeclaration') {
      continue;
    }
    // `export type { Foo as default }` — the whole statement is type-only
    if (stmt.exportKind === 'type') {
      continue;
    }

    for (const spec of stmt.specifiers) {
      if (spec.type !== 'ExportSpecifier') {
        continue;
      }
      // `export { type Foo as default }` — individual specifier is type-only
      if (spec.exportKind === 'type') {
        continue;
      }
      if (getExportedName(spec) !== 'default') {
        continue;
      }

      if (stmt.source) {
        return {
          target: { kind: 'imported', source: stmt.source.value },
          reportNode: stmt,
        };
      }

      if (spec.local.type !== 'Identifier') {
        return { target: { kind: 'unknown' }, reportNode: stmt };
      }

      return {
        target: resolveLocalIdentifierTarget(programNode, spec.local.name),
        reportNode: stmt,
      };
    }
  }
  return null;
}

/**
 * Yield value-level `export * from '...'` declarations. The rule cannot follow
 * these across files, so callers treat them conservatively as unverifiable.
 */
export function* iterateExportAllDeclarations(programNode: TSESTree.Program): Generator<ExportAllItem> {
  for (const stmt of programNode.body) {
    if (stmt.type !== 'ExportAllDeclaration') {
      continue;
    }
    // `export type * from '...'` — type-only re-export
    if (stmt.exportKind === 'type') {
      continue;
    }
    // `export * as name from '...'` exposes a namespace binding, not top-level
    // route handlers or Server Functions.
    if (stmt.exported) {
      continue;
    }
    yield {
      source: stmt.source.value,
      reportNode: stmt,
    };
  }
}

export function* iterateNamedExports(programNode: TSESTree.Program): Generator<NamedExportItem> {
  for (const stmt of programNode.body) {
    if (stmt.type !== 'ExportNamedDeclaration') {
      continue;
    }
    // `export type { Foo }` — the whole statement is type-only
    if (stmt.exportKind === 'type') {
      continue;
    }

    if (stmt.declaration) {
      const decl = stmt.declaration;
      if (decl.type === 'FunctionDeclaration' && decl.id) {
        yield {
          name: decl.id.name,
          target: { kind: 'function', node: decl },
          reportNode: stmt,
        };
      } else if (decl.type === 'VariableDeclaration') {
        for (const declarator of decl.declarations) {
          if (declarator.id.type !== 'Identifier') {
            continue;
          }
          const fn = unwrapFunction(declarator.init ?? undefined);
          yield {
            name: declarator.id.name,
            target: fn ? { kind: 'function', node: fn } : { kind: 'unknown' },
            reportNode: stmt,
          };
        }
      }
      continue;
    }

    for (const spec of stmt.specifiers) {
      if (spec.type !== 'ExportSpecifier') {
        continue;
      }
      // `export { type Foo }` — individual specifier is type-only
      if (spec.exportKind === 'type') {
        continue;
      }
      const exportedName = getExportedName(spec);
      if (!exportedName) {
        continue;
      }

      if (stmt.source) {
        yield {
          name: exportedName,
          target: { kind: 'imported', source: stmt.source.value },
          reportNode: stmt,
        };
        continue;
      }

      if (spec.local.type !== 'Identifier') {
        continue;
      }
      yield {
        name: exportedName,
        target: resolveLocalIdentifierTarget(programNode, spec.local.name),
        reportNode: stmt,
      };
    }
  }
}
