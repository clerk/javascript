import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export type QuoteChar = "'" | '"';

function quoteFromModuleSource(sourceCode: TSESLint.SourceCode, source: TSESTree.StringLiteral): QuoteChar | null {
  const text = sourceCode.getText(source);
  const first = text[0];
  if (first === "'" || first === '"') {
    return first;
  }
  return null;
}

/**
 * Infer the string quote style already used in `program`, so inserted import
 * lines match the file. Only checks for imports and "export from" for simplicity,
 * as those are almost always present. Falls back to double quotes (Prettier and
 * ESLint defaults) when there is nothing to infer from.
 */
export function inferQuoteChar(sourceCode: TSESLint.SourceCode, program: TSESTree.Program): QuoteChar {
  for (const stmt of program.body) {
    // Only imports and "export from" has stmt.source
    if ('source' in stmt && stmt.source) {
      const quote = quoteFromModuleSource(sourceCode, stmt.source);
      if (quote) {
        return quote;
      }
    }
  }

  return '"';
}
