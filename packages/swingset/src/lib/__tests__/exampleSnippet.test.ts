import { describe, expect, it } from 'vitest';

import { toUsageSnippet } from '../exampleSnippet';

describe('toUsageSnippet', () => {
  it('unwraps a parenthesized return', () => {
    expect(toUsageSnippet('export function A() {\n  return (\n    <B />\n  );\n}')).toBe('<B />');
  });

  it('keeps semicolons inside an unparenthesized return', () => {
    const source = [
      'export function A() {',
      '  return <>',
      '      <style>{`.a { color: red; } .b { color: blue; }`}</style>',
      '      <B />',
      '    </>;',
      '}',
    ].join('\n');

    expect(toUsageSnippet(source)).toBe(
      ['<>', '  <style>{`.a { color: red; } .b { color: blue; }`}</style>', '  <B />', '</>'].join('\n'),
    );
  });
});
