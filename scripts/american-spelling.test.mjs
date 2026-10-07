// A twin of this test lives in clerk/clerk at `scripts/lint/american-spelling.test.ts`.
// Make every change to the cases in both copies.
import { describe, expect, test } from 'vitest';

import { checkLines, findInLine, markerWords } from './american-spelling.mjs';

const words = line => findInLine(line).map(hit => hit.replacement);

describe('findInLine', () => {
  test('flags British spellings in prose and keeps their case', () => {
    expect(words('Customise the colour, then CANCELLED it.')).toEqual(['Customize', 'color', 'CANCELED']);
  });

  test('flags British spellings inside camelCase and snake_case identifiers', () => {
    expect(words('let isCancelled = normalise_colour(x)')).toEqual(['Canceled', 'normalize', 'color']);
  });

  test('leaves American words that look British alone', () => {
    expect(words('advise the enterprise on cancellation and analyses')).toEqual([]);
  });

  test('leaves names owned elsewhere alone', () => {
    expect(
      words(
        "ariaLabelledBy SIGN_IN_CANCELLED isReverificationCancelledError 'reverification_cancelled' aria-labelledby",
      ),
    ).toEqual([]);
  });

  test.each([
    ['an absolute URL', 'See https://example.com/colour-guide.'],
    ['a Markdown link target', 'See [the guide](/docs/customise).'],
    ['a Markdown link target without a slash', 'See [the notes](colour.pdf).'],
    ['a Markdown reference definition', '[guide]: #colour'],
    ['a root-relative string', "const logo = '/images/colour-logo.svg'"],
    ['a relative path', 'Open ./centre/index.ts first.'],
    ['a CSS url()', 'background: url(/images/colour.png);'],
    ['a bare file name', 'Rename colour-logo.svg later.'],
    ['an in-page href', '<a href="#colour">'],
    ['a static import', "import x from 'colour'"],
    ['a dynamic import', "await import('@vendor/customise')"],
    ['a require', "require('colour')"],
  ])('leaves %s alone', (_, line) => {
    expect(words(line)).toEqual([]);
  });

  test('still flags prose next to an address', () => {
    expect(words('The [colour picker](/docs/colour) sets the colour.')).toEqual(['color', 'color']);
  });
});

describe('markerWords', () => {
  test.each([
    ['an MDX comment', '{/* american-spelling-ignore-next-line: Towards */}'],
    ['an HTML comment', '<!-- american-spelling-ignore-next-line: Towards -->'],
    ['a line comment', '// american-spelling-ignore-next-line: Towards'],
    ['a reason after --', '{/* american-spelling-ignore-next-line: Towards -- NIST paper title */}'],
    ['a different case', '{/* American-Spelling-Ignore-Next-Line: TOWARDS */}'],
  ])('reads the allowed words from %s', (_, line) => {
    expect(markerWords(line)).toEqual(new Set(['towards']));
  });

  test('reads several words', () => {
    expect(markerWords('// american-spelling-ignore-next-line: colour, behaviour')).toEqual(
      new Set(['colour', 'behaviour']),
    );
  });

  test('returns null without a marker', () => {
    expect(markerWords('// just a comment')).toBeNull();
  });

  test('returns null for a mention of the marker without its colon', () => {
    expect(markerWords('Add an `american-spelling-ignore-next-line` comment above the quote.')).toBeNull();
  });
});

describe('checkLines', () => {
  const owed = lines => checkLines(lines).hits.map(hit => `${hit.line}:${hit.found}`);
  const problems = lines => checkLines(lines).problems.map(problem => `${problem.line}:${problem.message}`);

  test('lets only the named words through on the next non-blank line, ignoring case', () => {
    const lines = ['{/* american-spelling-ignore-next-line: towards */}', '', '"Towards a standard" sets the colour.'];
    expect(owed(lines)).toEqual(['2:colour']);
    expect(problems(lines)).toEqual([]);
  });

  test('does not reach past the next non-blank line', () => {
    expect(owed(['// american-spelling-ignore-next-line: colour', 'const colour = 1', 'const colour = 2'])).toEqual([
      '2:colour',
    ]);
  });

  test('does not flag the words named in the marker itself', () => {
    expect(owed(['<!-- american-spelling-ignore-next-line: colour -- the colour of the source -->', 'colour'])).toEqual(
      [],
    );
  });

  test('reports a marker that names no words', () => {
    expect(problems(['// american-spelling-ignore-next-line:', 'colour'])).toEqual([
      '0:marker names no words; list the ones to allow',
    ]);
  });

  test('reports a marker with no line after it', () => {
    expect(problems(['const color = 1', '// american-spelling-ignore-next-line: colour', ''])).toEqual([
      '1:marker has no line after it to apply to',
    ]);
  });

  test('reports a marker word the next line does not use, so markers cannot go stale', () => {
    expect(problems(['// american-spelling-ignore-next-line: colour', 'const color = 1'])).toEqual([
      `0:marker allows "colour", but the next line doesn't use it`,
    ]);
  });
});
