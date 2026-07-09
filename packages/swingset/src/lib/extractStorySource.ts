/**
 * Pulls a single exported story function's source out of a story module's raw text
 * (the `__source` a `*.stories.tsx` file exposes via a `?raw` self-import). Used by
 * the `<Story>` Code tab to show the actual source of the example being previewed,
 * rather than the SWC/Emotion-compiled output `Function.prototype.toString()` returns.
 *
 * Matches `export function <name>(` and returns through the brace-balanced function
 * body. Story files contain no unbalanced braces inside strings, so a simple depth
 * counter is sufficient (and avoids pulling in a parser).
 */
export function extractStorySource(source: string | undefined, name: string): string | null {
  if (!source) {
    return null;
  }

  const signature = new RegExp(`export function ${name}\\s*\\(`);
  const match = signature.exec(source);
  if (!match) {
    return null;
  }

  const bodyStart = source.indexOf('{', match.index);
  if (bodyStart === -1) {
    return null;
  }

  let depth = 0;
  for (let i = bodyStart; i < source.length; i++) {
    const char = source[i];
    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        return source.slice(match.index, i + 1);
      }
    }
  }

  return null;
}
