/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { Rule } from 'eslint';

import type { ExportTarget, FunctionNode } from './lib/exports';
import { iterateExportAllDeclarations, iterateNamedExports, resolveDefaultExport } from './lib/exports';
import {
  type FileKind,
  getAppRouterFileKind,
  getRelativeFolder,
  isClientModule,
  isServerFunctionModule,
} from './lib/file-info';
import { buildAuthProtectFixes } from './lib/fixers';
import type { ClassifyOptions } from './lib/match-folders';
import { classifyFolder, hasDescendantsMatching } from './lib/match-folders';
import { resolveProjectRoot } from './lib/project-root';
import { findAuthLocalNames, hasProtectAtTop } from './lib/protection-checks';

export type MessageId =
  | 'missingProtect'
  | 'addAuthProtect'
  | 'exportImported'
  | 'unverifiableExport'
  | 'unlistedMixedScopeLayout';

interface ResourceOptions {
  /** Route handler files, such as `route.ts`. */
  routeHandlers?: boolean;
  /** Module-level and inline Server Functions using `'use server'`. */
  serverFunctions?: boolean;
  /** Server Component entrypoints, such as `page.tsx`, `layout.tsx`, `template.tsx`, and `default.tsx`. */
  serverComponentEntrypoints?: boolean;
}

type NormalizedResourceOptions = Required<ResourceOptions>;

export interface RuleOptions {
  /** Project-relative folder globs whose resources must be guarded. */
  protected: string[];
  /** Project-relative folder globs that are exempt. */
  public?: string[];
  /** Resource groups that should be checked. All resource groups are checked by default. */
  resources?: ResourceOptions;
  /** Layouts that wrap both protected and public descendants. */
  mixedScopeLayouts?: 'auto' | string[];
  /**
   * Project root used to resolve project-relative folder globs. Defaults to the
   * nearest ancestor `eslint.config.*` (same walk ESLint uses for config
   * lookup), then ESLint `cwd`. Set to `import.meta.dirname` in your
   * `eslint.config.mjs` when config discovery is unavailable.
   */
  rootDir?: string;
}

const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']);

const DEFAULT_RESOURCES: NormalizedResourceOptions = {
  routeHandlers: true,
  serverFunctions: true,
  serverComponentEntrypoints: true,
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    hasSuggestions: true,
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
          resources: {
            type: 'object',
            properties: {
              routeHandlers: { type: 'boolean' },
              serverFunctions: { type: 'boolean' },
              serverComponentEntrypoints: { type: 'boolean' },
            },
            additionalProperties: false,
          },
          mixedScopeLayouts: {
            oneOf: [
              { type: 'string', enum: ['auto'] },
              { type: 'array', items: { type: 'string' } },
            ],
          },
          rootDir: { type: 'string' },
        },
        required: ['protected'],
        additionalProperties: false,
      },
    ],
    messages: {
      missingProtect:
        'Expected `await auth.protect()` at the top of {{subject}} in a folder configured as protected. Add the call to the top of the function, move the file into a public folder, or configure this folder as public.',
      addAuthProtect: 'Add `await auth.protect()` to the top of this {{subject}}.',
      exportImported:
        "This {{subject}} is exported from '{{source}}'. The rule cannot follow imports across files. Add a wrapper with `await auth.protect()`, or ensure the imported function calls it and add an eslint-disable comment with a reason.",
      unverifiableExport:
        'This {{subject}} could not be verified as being protected, likely because it is assigned from a call expression (e.g. `const handler = withAuth(impl)`). Inline a function literal that calls `await auth.protect()`, or add an eslint-disable comment with a reason.',
      unlistedMixedScopeLayout:
        "This {{fileKind}} at '{{folder}}/' wraps both protected and public descendants but is not listed in `mixedScopeLayouts`. Either add '{{folder}}' to the list to acknowledge the mixed scope, or restructure so the {{fileKind}} wraps only public or protected descendants.",
    },
  },

  create(context) {
    const filename = context.physicalFilename ?? context.filename ?? context.getFilename?.();
    const cwd = context.cwd || context.getCwd?.();
    const options = (context.options[0] ?? {}) as Partial<RuleOptions>;
    const ruleId = context.id ?? 'require-auth-protection';
    validatePathPatterns(ruleId, 'protected', options.protected);
    validatePathPatterns(ruleId, 'public', options.public);
    const config: ClassifyOptions = {
      protected: options.protected,
      public: options.public ?? [],
    };
    const resources = normalizeResources(options.resources);
    const mixedScopeLayoutsOption = options.mixedScopeLayouts === undefined ? 'auto' : options.mixedScopeLayouts;

    const projectRoot = resolveProjectRoot(filename, { rootDir: options.rootDir, cwd });
    const folder = getRelativeFolder(filename, projectRoot);
    if (!folder) {
      return {};
    }

    const fileKind = getAppRouterFileKind(filename, folder);

    let authNames = new Set<string>();
    let shouldCheckInlineServerFunctions = false;
    // Keeps track of which functions have already been checked to avoid
    // program visitor and function visitors performing duplicate checks.
    const checkedFunctions = new WeakSet<FunctionNode>();

    return {
      Program(programNode) {
        const ast = programNode as TSESTree.Program;
        const isServerFunction = isServerFunctionModule(ast);
        const isClient = isClientModule(ast);

        const sourceClass = classifyFolder(folder, config);
        if (sourceClass !== 'protected') {
          return;
        }

        // This needs to be before the other bailouts. It sets up state
        // necessary for the independent function visitors to work.
        authNames = findAuthLocalNames(ast);
        shouldCheckInlineServerFunctions = resources.serverFunctions && !isClient;

        if (!fileKind && !isServerFunction) {
          return;
        }

        if (
          isClient &&
          (fileKind === 'page' || fileKind === 'layout' || fileKind === 'template' || fileKind === 'default')
        ) {
          return;
        }

        if (
          resources.serverComponentEntrypoints &&
          (fileKind === 'layout' || fileKind === 'template') &&
          hasDescendantsMatching(folder, config.public)
        ) {
          checkUnacknowledgedMixedScope(context, ast, fileKind, folder, mixedScopeLayoutsOption);
          return;
        }

        if (
          resources.serverComponentEntrypoints &&
          (fileKind === 'page' || fileKind === 'layout' || fileKind === 'template' || fileKind === 'default')
        ) {
          checkDefaultExport(context, ast, fileKind, authNames, checkedFunctions);
        } else if (resources.routeHandlers && fileKind === 'route') {
          checkRouteHandlers(context, ast, authNames, checkedFunctions);
        } else if (resources.serverFunctions && isServerFunction) {
          checkServerFunctions(context, ast, authNames, checkedFunctions);
        }
      },
      FunctionDeclaration(node) {
        checkInlineServerFunction(
          context,
          node as TSESTree.FunctionDeclaration,
          authNames,
          shouldCheckInlineServerFunctions,
          checkedFunctions,
        );
      },
      FunctionExpression(node) {
        checkInlineServerFunction(
          context,
          node as TSESTree.FunctionExpression,
          authNames,
          shouldCheckInlineServerFunctions,
          checkedFunctions,
        );
      },
      ArrowFunctionExpression(node) {
        checkInlineServerFunction(
          context,
          node as TSESTree.ArrowFunctionExpression,
          authNames,
          shouldCheckInlineServerFunctions,
          checkedFunctions,
        );
      },
    };
  },
};

export default rule;

function normalizeResources(resources: ResourceOptions | undefined): NormalizedResourceOptions {
  return { ...DEFAULT_RESOURCES, ...resources };
}

function validatePathPatterns(
  ruleId: string,
  optionName: 'protected' | 'public',
  patterns: string[] | undefined,
): void {
  if (!patterns) {
    return;
  }
  for (const pattern of patterns) {
    if (pattern.split('/').includes('..')) {
      throw new Error(
        `${ruleId}: \`${optionName}\` patterns must be relative to \`rootDir\` and cannot contain \`..\` segments. Received "${pattern}".`,
      );
    }
  }
}

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

function getMissingProtectReportNode(fn: FunctionNode, fallback: TSESTree.Node): TSESTree.Node {
  return fn.id ?? fn.body ?? fallback;
}

function checkMissingProtect(
  context: Rule.RuleContext,
  reportNode: TSESTree.Node,
  target: ExportTarget,
  subject: string,
  authNames: Set<string>,
  checkedFunctions?: WeakSet<FunctionNode>,
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
    checkedFunctions?.add(target.node);
    if (!hasProtectAtTop(target.node, authNames)) {
      context.report({
        node: getMissingProtectReportNode(target.node, reportNode),
        messageId: 'missingProtect',
        data: { subject },
        suggest: buildAddAuthProtectSuggestion(context, target.node, subject, authNames),
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

function checkRouteHandlers(
  context: Rule.RuleContext,
  programNode: TSESTree.Program,
  authNames: Set<string>,
  checkedFunctions: WeakSet<FunctionNode>,
): void {
  for (const { name, target, reportNode } of iterateNamedExports(programNode)) {
    if (!HTTP_METHODS.has(name)) {
      continue;
    }
    checkMissingProtect(context, reportNode, target, `${name} handler`, authNames, checkedFunctions);
  }
  // `export *` could re-export an HTTP-method handler we can't see across files
  for (const { source, reportNode } of iterateExportAllDeclarations(programNode)) {
    checkMissingProtect(context, reportNode, { kind: 'imported', source }, 'route handlers', authNames);
  }
}

function checkServerFunctions(
  context: Rule.RuleContext,
  programNode: TSESTree.Program,
  authNames: Set<string>,
  checkedFunctions: WeakSet<FunctionNode>,
): void {
  for (const { name, target, reportNode } of iterateNamedExports(programNode)) {
    if (name === 'default') {
      continue;
    }
    checkMissingProtect(context, reportNode, target, `Server Function '${name}'`, authNames, checkedFunctions);
  }
  const defaultExport = resolveDefaultExport(programNode);
  if (defaultExport) {
    checkMissingProtect(
      context,
      defaultExport.reportNode,
      defaultExport.target,
      'Server Function',
      authNames,
      checkedFunctions,
    );
  }
  // `export *` can re-export Server Functions we can't see across files.
  for (const { source, reportNode } of iterateExportAllDeclarations(programNode)) {
    checkMissingProtect(context, reportNode, { kind: 'imported', source }, 'Server Functions', authNames);
  }
}

function checkDefaultExport(
  context: Rule.RuleContext,
  programNode: TSESTree.Program,
  fileKind: FileKind,
  authNames: Set<string>,
  checkedFunctions: WeakSet<FunctionNode>,
): void {
  const defaultExport = resolveDefaultExport(programNode);
  if (!defaultExport) {
    return;
  }

  checkMissingProtect(context, defaultExport.reportNode, defaultExport.target, fileKind, authNames, checkedFunctions);
}

function hasUseServerDirective(fn: FunctionNode): boolean {
  const body = fn.body;
  if (!body || body.type !== 'BlockStatement') {
    return false;
  }

  for (const stmt of body.body) {
    if (stmt.type !== 'ExpressionStatement') {
      return false;
    }
    if (typeof stmt.directive !== 'string') {
      return false;
    }
    if (stmt.directive === 'use server') {
      return true;
    }
  }
  return false;
}

function checkInlineServerFunction(
  context: Rule.RuleContext,
  fn: FunctionNode,
  authNames: Set<string>,
  shouldCheckInlineServerFunctions: boolean,
  checkedFunctions: WeakSet<FunctionNode>,
): void {
  if (!shouldCheckInlineServerFunctions || checkedFunctions.has(fn) || !hasUseServerDirective(fn)) {
    return;
  }
  if (!hasProtectAtTop(fn, authNames)) {
    context.report({
      node: getMissingProtectReportNode(fn, fn),
      messageId: 'missingProtect',
      data: { subject: 'Inline Server Function' },
      suggest: buildAddAuthProtectSuggestion(context, fn, 'Inline Server Function', authNames),
    });
  }
}

function buildAddAuthProtectSuggestion(
  context: Rule.RuleContext,
  fn: FunctionNode,
  subject: string,
  authNames: Set<string>,
): Rule.SuggestionReportDescriptor[] {
  const sourceCode = context.sourceCode;
  return [
    {
      messageId: 'addAuthProtect',
      data: { subject },
      fix(fixer) {
        return buildAuthProtectFixes({
          fixer: fixer as unknown as TSESLint.RuleFixer,
          sourceCode: sourceCode as unknown as TSESLint.SourceCode,
          fn,
          authNames,
        }) as unknown as Rule.Fix[];
      },
    },
  ];
}
