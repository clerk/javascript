/**
 * Programmatic auto-fixer for the `require-auth-protection` rule.
 *
 * The rule exposes its `await auth.protect()` insertion as an opt-in
 * *suggestion* rather than an autofix, so `eslint --fix` deliberately leaves it
 * alone (adding a protection check changes runtime behavior). This runner lets
 * you apply those suggestions in bulk on demand — from a script via
 * `fixAuthProtection()` or from the terminal via the
 * `clerk-next-fix-auth-protection` command.
 *
 * It works by linting with the consumer's own ESLint config (so the
 * protected/public folder globs are honored) and applying the rule's
 * `addAuthProtect` suggestion to each flagged resource. Resources the rule
 * cannot safely fix (imported/wrapped exports, unacknowledged mixed-scope
 * layouts) are reported back as `unresolved` for manual follow-up.
 */

import { readFile, writeFile } from 'node:fs/promises';

import { ESLint, type Linter } from 'eslint';

const RULE_NAME = 'require-auth-protection';
const SUGGESTION_MESSAGE_ID = 'addAuthProtect';
const UNFIXABLE_MESSAGE_IDS = new Set(['exportImported', 'unverifiableExport', 'unlistedMixedScopeLayout']);

export interface FixAuthProtectionOptions {
  /** File, directory, or glob patterns to scan. Defaults to `['.']`. */
  patterns?: string[];
  /** Working directory ESLint resolves config and files against. Defaults to `process.cwd()`. */
  cwd?: string;
  /** Compute the changes without writing them to disk. */
  dryRun?: boolean;
  /**
   * Advanced/escape hatch: a pre-configured ESLint instance to lint with. When
   * omitted, a default `new ESLint({ cwd })` is used, which discovers the
   * consumer's flat config. Mainly useful for tests.
   */
  eslint?: ESLint;
  /**
   * Called before scanning with the path to the ESLint config file that will be
   * used (or `undefined` when none is found / an instance was injected).
   */
  onConfigResolved?: (configFilePath: string | undefined) => void;
  /**
   * Called once linting finishes and per-file fixing begins, with the number of
   * files that have flagged resources. Useful for reporting progress, since the
   * initial lint can be slow on large projects.
   */
  onScanComplete?: (fileCount: number) => void;
  /** Called after each file is fixed (or, in `dryRun`, would be fixed). */
  onFileFixed?: (file: FixedFile) => void;
}

export interface FixedFile {
  filePath: string;
  /** Number of resources that had `await auth.protect()` applied. */
  protections: number;
}

export interface UnresolvedIssue {
  line: number;
  column: number;
  message: string;
}

export interface UnresolvedFile {
  filePath: string;
  issues: UnresolvedIssue[];
}

export interface FixAuthProtectionResult {
  /** Files that were (or, in `dryRun`, would be) modified. */
  fixed: FixedFile[];
  /** Files with flagged resources that have no safe automatic fix. */
  unresolved: UnresolvedFile[];
}

type Fix = { range: [number, number]; text: string };

function isAuthProtectionRule(ruleId: string | null): boolean {
  // The plugin can be registered under any namespace (e.g. `@clerk/next/...`),
  // so match on the rule name rather than a fixed, fully-qualified id.
  return ruleId === RULE_NAME || (ruleId?.endsWith(`/${RULE_NAME}`) ?? false);
}

function collectSuggestionFixes(messages: Linter.LintMessage[]): Fix[] {
  const fixes: Fix[] = [];
  for (const message of messages) {
    if (!isAuthProtectionRule(message.ruleId)) {
      continue;
    }
    const suggestion = message.suggestions?.find(s => s.messageId === SUGGESTION_MESSAGE_ID);
    if (suggestion?.fix) {
      fixes.push({ range: [suggestion.fix.range[0], suggestion.fix.range[1]], text: suggestion.fix.text });
    }
  }
  return fixes;
}

/**
 * Apply as many non-overlapping fixes as possible in a single pass, mirroring
 * ESLint's own `SourceCodeFixer`: sort by position and skip any fix that starts
 * before the previous one ended. Overlapping fixes are left for a later pass.
 */
function applyFixes(source: string, fixes: Fix[]): { output: string; applied: number } {
  const sorted = [...fixes].sort((a, b) => a.range[0] - b.range[0] || a.range[1] - b.range[1]);
  let output = '';
  let lastPos = 0;
  let applied = 0;
  for (const fix of sorted) {
    const [start, end] = fix.range;
    if (start < lastPos) {
      continue;
    }
    output += source.slice(lastPos, start) + fix.text;
    lastPos = end;
    applied++;
  }
  output += source.slice(lastPos);
  return { output, applied };
}

async function applyFileFixes(
  eslint: ESLint,
  filePath: string,
  source: string,
): Promise<{ output: string; applied: number }> {
  // Applying a file's suggestions should converge in at most two passes: the first pass
  // fixes one resource and adds the shared top-of-file `auth` import, after which
  // every remaining resource is independent and applied in the second pass.
  // We allow up to 10 passes to allow for unaccounted for edge cases, or future
  // changes to the fixer, but throw an error if it fails to converge.
  const MAX_FIX_PASSES = 10;

  let current = source;
  let total = 0;
  let passes = 0;
  // Run one extra time so we can throw an error if the fixes don't converge.
  for (let i = 0; i < MAX_FIX_PASSES + 1; i += 1) {
    const [result] = await eslint.lintText(current, { filePath });
    if (!result) {
      break;
    }
    const fixes = collectSuggestionFixes(result.messages);
    if (fixes.length === 0) {
      break;
    }
    if (passes >= MAX_FIX_PASSES) {
      throw new Error(
        `Auth-protect fixes for ${filePath} did not converge after ${MAX_FIX_PASSES} passes. ` +
          'This is unexpected; please report it at https://github.com/clerk/javascript/issues.',
      );
    }
    const { output, applied } = applyFixes(current, fixes);
    if (applied === 0) {
      break;
    }
    current = output;
    total += applied;
    passes += 1;
  }
  return { output: current, applied: total };
}

/**
 * Lint the given patterns with the consumer's ESLint config and apply the
 * `require-auth-protection` rule's `await auth.protect()` suggestions to every
 * resource it can safely fix.
 */
export async function fixAuthProtection(options: FixAuthProtectionOptions = {}): Promise<FixAuthProtectionResult> {
  const cwd = options.cwd ?? process.cwd();
  const patterns = options.patterns && options.patterns.length > 0 ? options.patterns : ['.'];
  const dryRun = options.dryRun ?? false;

  // Only run our rule. The consumer's config (and its protected/public globs)
  // still applies, but skipping every other rule avoids the cost of linting the
  // whole project with the full ruleset on each pass.
  const eslint = options.eslint ?? new ESLint({ cwd, ruleFilter: ({ ruleId }) => isAuthProtectionRule(ruleId) });

  if (options.onConfigResolved) {
    let configFile: string | undefined;
    try {
      configFile = await eslint.findConfigFile();
    } catch {
      configFile = undefined;
    }
    options.onConfigResolved(configFile);
  }

  const results = await eslint.lintFiles(patterns);

  const fixed: FixedFile[] = [];
  const unresolved: UnresolvedFile[] = [];

  const flaggedResults = results.filter(result =>
    result.messages.some(message => isAuthProtectionRule(message.ruleId)),
  );
  options.onScanComplete?.(flaggedResults.length);

  for (const result of flaggedResults) {
    const ruleMessages = result.messages.filter(message => isAuthProtectionRule(message.ruleId));

    const hasFixable = ruleMessages.some(
      message => message.suggestions?.some(s => s.messageId === SUGGESTION_MESSAGE_ID) ?? false,
    );
    if (hasFixable) {
      const source = await readFile(result.filePath, 'utf8');
      const { output, applied } = await applyFileFixes(eslint, result.filePath, source);
      if (applied > 0) {
        if (!dryRun) {
          await writeFile(result.filePath, output, 'utf8');
        }
        const fixedFile = { filePath: result.filePath, protections: applied };
        fixed.push(fixedFile);
        options.onFileFixed?.(fixedFile);
      }
    }

    // Messages without a suggestion (imported/wrapped exports, mixed-scope
    // layouts) need a human; surface them so they aren't silently skipped.
    const issues = ruleMessages
      .filter(message => UNFIXABLE_MESSAGE_IDS.has(message.messageId ?? ''))
      .map(message => ({ line: message.line, column: message.column, message: message.message }));
    if (issues.length > 0) {
      unresolved.push({ filePath: result.filePath, issues });
    }
  }

  return { fixed, unresolved };
}
