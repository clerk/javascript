import * as tsParser from '@typescript-eslint/parser';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { describe, expect, it } from 'vitest';

import { inferQuoteChar } from '../lib/quote-style';

function parse(code: string): { sourceCode: TSESLint.SourceCode; program: TSESTree.Program } {
  const program = tsParser.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  }) as TSESTree.Program;
  const sourceCode = {
    ast: program,
    getText(node: TSESTree.Node) {
      return code.slice(node.range[0], node.range[1]);
    },
  } as TSESLint.SourceCode;
  return { sourceCode, program };
}

describe('inferQuoteChar', () => {
  it('returns double quotes from a double-quoted import', () => {
    const { sourceCode, program } = parse('import { x } from "@pkg/foo";');
    expect(inferQuoteChar(sourceCode, program)).toBe('"');
  });

  it('returns single quotes from a single-quoted import', () => {
    const { sourceCode, program } = parse("import { x } from '@pkg/foo';");
    expect(inferQuoteChar(sourceCode, program)).toBe("'");
  });

  it('returns double quotes from a double-quoted export source', () => {
    const { sourceCode, program } = parse('export { GET } from "./route";');
    expect(inferQuoteChar(sourceCode, program)).toBe('"');
  });

  it('falls back to double quotes when the file has no module sources to infer from', () => {
    const { sourceCode, program } = parse(`export default function Page() {
  return <div />;
}`);
    expect(inferQuoteChar(sourceCode, program)).toBe('"');
  });
});
