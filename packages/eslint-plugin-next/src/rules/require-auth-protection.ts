/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import type { TSESTree } from '@typescript-eslint/utils';
import type { Rule } from 'eslint';

import type { ExportTarget } from '../lib/exports.js';
import { iterateExportAllDeclarations, iterateNamedExports, resolveDefaultExport } from '../lib/exports.js';
import {
  type FileKind,
  getFileKind,
  getRelativeFolder,
  isClientModule,
  isServerActionModule,
} from '../lib/file-info.js';
import type { ClassifyOptions } from '../lib/match-folders.js';
import { classifyFolder, hasDescendantsMatching } from '../lib/match-folders.js';
import { findAuthLocalNames, hasProtectAtTop } from '../lib/protection-checks.js';

export type MessageId = 'missingProtect' | 'exportImported' | 'unverifiableExport' | 'unlistedMixedScopeLayout';

export interface RuleOptions {
  /** Glob patterns that mark folders as protected. */
  protected: string[];
  /** Glob patterns that exempt folders from protection. */
  public?: string[];
  /** Layouts that wrap both protected and public descendants. */
  mixedScopeLayouts?: 'auto' | string[];
}

const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']);

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require `await auth.protect()` in App Router resources under protected folders',
    },
    schema: [
      {
        type: 'object',
        properties: {
          protected: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
          },
          public: { type: 'array', items: { type: 'string' } },
          mixedScopeLayouts: {
            oneOf: [
              { type: 'string', enum: ['auto'] },
              { type: 'array', items: { type: 'string' } },
            ],
          },
        },
        required: ['protected'],
        additionalProperties: false,
      },
    ],
    messages: {
      missingProtect:
        'Expected `await auth.protect()` at the top of {{subject}} in a folder configured as protected. Add the call to the top of the function, move the file into a public folder, or configure this folder as public.',
      exportImported:
        "This {{subject}} is exported from '{{source}}'. The rule cannot follow imports across files. Add a wrapper with `await auth.protect()`, or ensure the imported function calls it and add an eslint-disable comment with a reason.",
      unverifiableExport:
        'This {{subject}} could not be verified as being protected, likely because it is assigned from a call expression (e.g. `const handler = withAuth(impl)`). Inline a function literal that calls `await auth.protect()`, or add an eslint-disable comment with a reason.',
      unlistedMixedScopeLayout:
        "This {{fileKind}} at '{{folder}}/' wraps both protected and public descendants but is not listed in `mixedScopeLayouts`. Either add '{{folder}}' to the list to acknowledge the mixed scope, or restructure so the {{fileKind}} wraps only public or protected descendants.",
    },
  },

  create(context) {
    const filename = context.filename || context.getFilename?.();
    const cwd = context.cwd || context.getCwd?.();
    const options = (context.options[0] ?? {}) as Partial<RuleOptions>;
    const config: ClassifyOptions = {
      protected: options.protected,
      public: options.public ?? [],
    };
    const mixedScopeLayoutsOption = options.mixedScopeLayouts === undefined ? 'auto' : options.mixedScopeLayouts;

    const folder = getRelativeFolder(filename, cwd);
    if (!folder) {
      return {};
    }

    const fileKind = getFileKind(filename);

    return {
      Program(programNode) {
        const ast = programNode as TSESTree.Program;
        const isAction = isServerActionModule(ast);
        if (!fileKind && !isAction) {
          return;
        }

        const isClient = isClientModule(ast);
        if (
          isClient &&
          (fileKind === 'page' || fileKind === 'layout' || fileKind === 'template' || fileKind === 'default')
        ) {
          return;
        }

        const sourceClass = classifyFolder(folder, config);
        if (sourceClass !== 'protected') {
          return;
        }

        if ((fileKind === 'layout' || fileKind === 'template') && hasDescendantsMatching(folder, config.public)) {
          checkUnacknowledgedMixedScope(context, ast, fileKind, folder, mixedScopeLayoutsOption);
          return;
        }

        const authNames = findAuthLocalNames(ast);

        if (fileKind === 'page' || fileKind === 'layout' || fileKind === 'template' || fileKind === 'default') {
          checkDefaultExport(context, ast, fileKind, authNames);
        } else if (fileKind === 'route') {
          checkRouteHandlers(context, ast, authNames);
        } else if (isAction) {
          checkServerActions(context, ast, authNames);
        }
      },
    };
  },
};

export default rule;

function checkUnacknowledgedMixedScope(
  context: Rule.RuleContext,
  programNode: TSESTree.Program,
  fileKind: 'layout' | 'template',
  folder: string,
  mixedScopeLayoutsOption: 'auto' | string[],
): void {
  if (mixedScopeLayoutsOption === 'auto') {
    return;
  }
  if (mixedScopeLayoutsOption.includes(folder)) {
    return;
  }
  const defaultExport = programNode.body.find(
    (n): n is TSESTree.ExportDefaultDeclaration => n.type === 'ExportDefaultDeclaration',
  );
  context.report({
    node: defaultExport ?? programNode,
    messageId: 'unlistedMixedScopeLayout',
    data: { folder, fileKind },
  });
}

function checkMissingProtect(
  context: Rule.RuleContext,
  reportNode: TSESTree.Node,
  target: ExportTarget,
  subject: string,
  authNames: Set<string>,
): void {
  if (target.kind === 'imported') {
    context.report({
      node: reportNode,
      messageId: 'exportImported',
      data: { subject, source: target.source },
    });
    return;
  }
  if (target.kind === 'function') {
    if (!hasProtectAtTop(target.node, authNames)) {
      context.report({
        node: reportNode,
        messageId: 'missingProtect',
        data: { subject },
      });
    }
    return;
  }
  context.report({
    node: reportNode,
    messageId: 'unverifiableExport',
    data: { subject },
  });
}

function checkRouteHandlers(context: Rule.RuleContext, programNode: TSESTree.Program, authNames: Set<string>): void {
  for (const { name, target, reportNode } of iterateNamedExports(programNode)) {
    if (!HTTP_METHODS.has(name)) {
      continue;
    }
    checkMissingProtect(context, reportNode, target, `${name} handler`, authNames);
  }
  // `export *` could re-export an HTTP-method handler we can't see across files
  for (const { source, reportNode } of iterateExportAllDeclarations(programNode)) {
    checkMissingProtect(context, reportNode, { kind: 'imported', source }, 'route handlers', authNames);
  }
}

function checkServerActions(context: Rule.RuleContext, programNode: TSESTree.Program, authNames: Set<string>): void {
  for (const { name, target, reportNode } of iterateNamedExports(programNode)) {
    checkMissingProtect(context, reportNode, target, `server action '${name}'`, authNames);
  }
  // `export *` is also server functions and we can't them see across files
  for (const { source, reportNode } of iterateExportAllDeclarations(programNode)) {
    checkMissingProtect(context, reportNode, { kind: 'imported', source }, 'server actions', authNames);
  }
}

function checkDefaultExport(
  context: Rule.RuleContext,
  programNode: TSESTree.Program,
  fileKind: FileKind,
  authNames: Set<string>,
): void {
  const defaultExport = resolveDefaultExport(programNode);
  if (!defaultExport) {
    return;
  }

  checkMissingProtect(context, defaultExport.reportNode, defaultExport.target, fileKind, authNames);
}
