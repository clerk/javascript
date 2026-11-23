/**
 * Corrects a regex in StyleX's dev runtime injector so named container queries survive.
 *
 * `@stylexjs/stylex@0.19.0`'s `getSeenRuleKey` recognises `@container (…)` but not
 * `@container name (…)`. A named query falls through to the plain-selector branch, whose key
 * is the text before the first `{` — the at-rule prelude — so every rule under the same named
 * query shares one key and all but the first are dropped as duplicates. The injected default
 * (carrying the `:not(#\#)` bumps) then beats the container rule in the extracted sheet, and
 * the query silently never applies. Dev only: production uses the extracted CSS.
 *
 * Applied at bundle time to the one module rather than as a package patch, so it stays inside
 * this private dev tool. Delete once upstream's `conditionalRulePattern` accepts a name.
 */
const BROKEN = String.raw`/^@(media|supports|container)\s*\([^)]+\)\s*{/`;
const FIXED = String.raw`/^@(media|supports|container)\b[^{]*{/`;

module.exports = function stylexInjectNamedContainer(source) {
  if (!source.includes(BROKEN)) {
    this.emitWarning(
      new Error(
        `stylex-inject-named-container: pattern not found in ${this.resourcePath}; StyleX may have fixed it — remove this loader.`,
      ),
    );
    return source;
  }
  return source.replace(BROKEN, FIXED);
};
