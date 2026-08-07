/**
 * Turns a story function's raw source (from `extractStorySource`) into a clean, usage-style
 * snippet for the `<Story>` code footer. Story functions are knob harnesses — they take
 * `props: Record<string, unknown>` and spread playground values in via `{...knobsAsProps(props)}`
 * — which is swingset-internal scaffolding a reader shouldn't see. This unwraps the
 * `export function …() { return (…) }` harness down to the returned JSX and drops the knob
 * spreads, leaving the code a consumer would actually write.
 */

// `{...knobsAsProps(props)}` and bare `{...props}`, with the whitespace that precedes them so
// the attribute (whether inline or on its own line) is removed cleanly.
const KNOB_SPREAD = /\s*\{\.\.\.(?:knobsAsProps\(props\)|props)\}/g;

export function toUsageSnippet(fnSource: string): string {
  return dedent(unwrapReturn(fnSource).replace(KNOB_SPREAD, '')).trim();
}

/** Extracts the expression returned by the story function (the JSX), without its `return`/`()` wrapper. */
function unwrapReturn(fnSource: string): string {
  const match = /\breturn\b/.exec(fnSource);
  if (!match) {
    return fnSource;
  }

  const expr = fnSource.slice(match.index + 'return'.length).replace(/^\s+/, '');

  // `return (…)` — find the parenthesis that balances the opener and take what's inside.
  if (expr.startsWith('(')) {
    let depth = 0;
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      if (char === '(') {
        depth++;
      } else if (char === ')') {
        depth--;
        if (depth === 0) {
          return expr.slice(1, i);
        }
      }
    }
    return expr;
  }

  // `return <X … />;` — a single expression statement; take up to its terminating semicolon.
  const semicolon = expr.indexOf(';');
  return semicolon === -1 ? expr : expr.slice(0, semicolon);
}

/** Removes the common leading indentation shared by every non-blank line. */
function dedent(text: string): string {
  const lines = text.replace(/^\n+/, '').replace(/\s+$/, '').split('\n');

  let min = Infinity;
  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }
    min = Math.min(min, line.length - line.trimStart().length);
  }

  if (!Number.isFinite(min) || min === 0) {
    return lines.join('\n');
  }
  return lines.map(line => (line.trim() ? line.slice(min) : line)).join('\n');
}
