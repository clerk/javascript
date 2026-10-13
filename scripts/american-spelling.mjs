// A twin of this script lives in clerk/clerk at `scripts/lint/american-spelling.mjs`.
// Make every change to the denylist or the logic in both copies.
//
// Keep the repo in American English: `color`, not `colour`; `canceled`, not
// `cancelled`. Clerk's product, APIs and SDKs spell things the American way, so
// prose that doesn't reads as a second voice, and review threads end up
// settling the same dispute one word at a time. See docs/CONTRIBUTING.md.
//
// This is a denylist of known British spellings, not a spellchecker: it flags
// only the words below, in prose and code alike (identifiers are split on
// camelCase and snake_case, so `isCancelled` is caught too).
// Runs in `pnpm lint` (CI on every PR). `--fix` rewrites every offender in place.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

// -ise/-isation → -ize/-ization. Roots only; the suffixes below are appended.
// Words that end in -ise in American English too (advise, promise, exercise,
// enterprise, surprise, ...) are not built from any of these roots.
const IZE_ROOTS = [
  'agon',
  'amort',
  'anonym',
  'antagon',
  'apolog',
  'atom',
  'author',
  'canonical',
  'capital',
  'categor',
  'central',
  'character',
  'colon',
  'commercial',
  'computer',
  'conceptual',
  'container',
  'contextual',
  'critic',
  'custom',
  'decentral',
  'deserial',
  'desensit',
  'destabil',
  'digit',
  'dramat',
  'econom',
  'emphas',
  'empath',
  'energ',
  'equal',
  'evangel',
  'external',
  'familiar',
  'fantas',
  'final',
  'formal',
  'fossil',
  'general',
  'global',
  'harmon',
  'hospital',
  'human',
  'hybrid',
  'ideal',
  'immun',
  'incentiv',
  'individual',
  'industrial',
  'initial',
  'institutional',
  'internal',
  'international',
  'italic',
  'item',
  'jeopard',
  'legal',
  'legitim',
  'lexical',
  'local',
  'magnet',
  'marginal',
  'material',
  'maxim',
  'mechan',
  'memor',
  'metabol',
  'miniatur',
  'minim',
  'mobil',
  'modern',
  'modular',
  'monet',
  'monopol',
  'national',
  'natural',
  'neutral',
  'normal',
  'operational',
  'optim',
  'organ',
  'ostrac',
  'oxid',
  'parameter',
  'parametr',
  'patron',
  'penal',
  'personal',
  'plural',
  'polar',
  'popular',
  'pressur',
  'priorit',
  'privat',
  'product',
  'pseudonym',
  'public',
  'radical',
  'random',
  'rational',
  'real',
  'reauthor',
  'recogn',
  'regional',
  'regular',
  'reinitial',
  'reorgan',
  'revital',
  'revolution',
  'sanit',
  'scrutin',
  'sensit',
  'serial',
  'social',
  'special',
  'stabil',
  'standard',
  'steril',
  'stigmat',
  'styl',
  'subsid',
  'summar',
  'symbol',
  'sympath',
  'synchron',
  'synthes',
  'systemat',
  'tantal',
  'temporal',
  'terror',
  'theor',
  'token',
  'traumat',
  'trivial',
  'unauthor',
  'unorgan',
  'unrecogn',
  'urban',
  'util',
  'vandal',
  'vector',
  'verbal',
  'victim',
  'virtual',
  'visual',
];
const IZE_SUFFIXES = ['e', 'es', 'ed', 'ing', 'er', 'ers', 'ation', 'ations', 'ational', 'able'];

// -yse → -yze.
const YZE_ROOTS = ['anal', 'catal', 'dial', 'electrol', 'hydrol', 'paral'];
// `analyses` is left out: it's also the American plural of `analysis`.
const YZE_SUFFIXES = ['e', 'ed', 'ing', 'er', 'ers'];

// -our → -or.
const OR_ROOTS = [
  'arb',
  'ard',
  'arm',
  'behavi',
  'cand',
  'clam',
  'col',
  'endeav',
  'fav',
  'ferv',
  'flav',
  'harb',
  'hon',
  'hum',
  'lab',
  'neighb',
  'od',
  'parl',
  'rig',
  'rum',
  'sav',
  'splend',
  'succ',
  'tum',
  'val',
  'vap',
  'vig',
];
const OR_SUFFIXES = [
  'our',
  'ours',
  'oured',
  'ouring',
  'ourful',
  'ourless',
  'ourable',
  'ourably',
  'ourite',
  'ourites',
  'oural',
  'ourally',
  'ourist',
  'ourhood',
  'oury',
];

// -re → -er.
const ER_ROOTS = ['calib', 'cent', 'fib', 'lit', 'lust', 'meag', 'met', 'sab', 'somb', 'spect', 'theat'];
const ER_SUFFIXES = [
  ['re', 'er'],
  ['res', 'ers'],
  ['red', 'ered'],
  ['ring', 'ering'],
];

// Doubled final l before a suffix → single l.
const L_ROOTS = [
  'barrel',
  'bevel',
  'cancel',
  'channel',
  'chisel',
  'counsel',
  'dial',
  'duel',
  'enamel',
  'equal',
  'fuel',
  'funnel',
  'gravel',
  'grovel',
  'initial',
  'jewel',
  'label',
  'level',
  'libel',
  'marshal',
  'marvel',
  'medal',
  'model',
  'panel',
  'parcel',
  'pedal',
  'pencil',
  'quarrel',
  'refuel',
  'remodel',
  'revel',
  'rival',
  'shovel',
  'signal',
  'snorkel',
  'spiral',
  'stencil',
  'swivel',
  'total',
  'towel',
  'travel',
  'trial',
  'tunnel',
  'unravel',
  'yodel',
];
const L_SUFFIXES = ['led', 'ling', 'ler', 'lers', 'lor', 'lors', 'lous', 'lously'];

// Everything else, word for word.
const WORDS = {
  acknowledgement: 'acknowledgment',
  acknowledgements: 'acknowledgments',
  aeroplane: 'airplane',
  aeroplanes: 'airplanes',
  afterwards: 'afterward',
  ageing: 'aging',
  aluminium: 'aluminum',
  amidst: 'amid',
  amongst: 'among',
  analogue: 'analog',
  analogues: 'analogs',
  appal: 'appall',
  artefact: 'artifact',
  artefacts: 'artifacts',
  backwards: 'backward',
  benefitted: 'benefited',
  benefitting: 'benefiting',
  catalogue: 'catalog',
  catalogued: 'cataloged',
  catalogues: 'catalogs',
  cataloguing: 'cataloging',
  cheque: 'check',
  cheques: 'checks',
  cosy: 'cozy',
  defence: 'defense',
  defences: 'defenses',
  despatch: 'dispatch',
  distil: 'distill',
  downwards: 'downward',
  dreamt: 'dreamed',
  enquire: 'inquire',
  enquired: 'inquired',
  enquires: 'inquires',
  enquiries: 'inquiries',
  enquiring: 'inquiring',
  enquiry: 'inquiry',
  enrol: 'enroll',
  enrolment: 'enrollment',
  enrolments: 'enrollments',
  enrols: 'enrolls',
  focussed: 'focused',
  focusses: 'focuses',
  focussing: 'focusing',
  fulfil: 'fulfill',
  fulfilment: 'fulfillment',
  fulfils: 'fulfills',
  grey: 'gray',
  greyed: 'grayed',
  greyer: 'grayer',
  greyish: 'grayish',
  greys: 'grays',
  instalment: 'installment',
  instalments: 'installments',
  instil: 'instill',
  instils: 'instills',
  jewellery: 'jewelry',
  judgement: 'judgment',
  judgements: 'judgments',
  kerb: 'curb',
  learnt: 'learned',
  licence: 'license',
  licences: 'licenses',
  licenced: 'licensed',
  manoeuvre: 'maneuver',
  manoeuvres: 'maneuvers',
  maths: 'math',
  mould: 'mold',
  offence: 'offense',
  offences: 'offenses',
  onwards: 'onward',
  orientated: 'oriented',
  plough: 'plow',
  practise: 'practice',
  practised: 'practiced',
  practises: 'practices',
  practising: 'practicing',
  pretence: 'pretense',
  programme: 'program',
  programmes: 'programs',
  sceptic: 'skeptic',
  sceptical: 'skeptical',
  scepticism: 'skepticism',
  skilful: 'skillful',
  skilfully: 'skillfully',
  speciality: 'specialty',
  spelt: 'spelled',
  storey: 'story',
  storeys: 'stories',
  towards: 'toward',
  tranquillity: 'tranquility',
  tyre: 'tire',
  tyres: 'tires',
  upwards: 'upward',
  whilst: 'while',
  wilful: 'willful',
  wilfully: 'willfully',
  woollen: 'woolen',
};

const DENYLIST = new Map(Object.entries(WORDS));
for (const root of IZE_ROOTS) {
  for (const suffix of IZE_SUFFIXES) {
    DENYLIST.set(`${root}is${suffix}`, `${root}iz${suffix}`);
  }
}
for (const root of YZE_ROOTS) {
  for (const suffix of YZE_SUFFIXES) {
    DENYLIST.set(`${root}ys${suffix}`, `${root}yz${suffix}`);
  }
}
for (const root of OR_ROOTS) {
  for (const suffix of OR_SUFFIXES) {
    DENYLIST.set(`${root}${suffix}`, `${root}${suffix.replace('our', 'or')}`);
  }
}
for (const root of ER_ROOTS) {
  for (const [british, american] of ER_SUFFIXES) {
    DENYLIST.set(`${root}${british}`, `${root}${american}`);
  }
}
for (const root of L_ROOTS) {
  for (const suffix of L_SUFFIXES) {
    DENYLIST.set(`${root}${suffix}`, `${root}${suffix.slice(1)}`);
  }
}

// Names we don't own. Each needs a reason; the upstream ones get fixed at the
// source, then come off this list.
const EXCEPTIONS = new Map([
  // The ARIA spec's `aria-labelledby`, camelCased. The attribute itself never
  // matches: `labelledby` is one word, not `labelled` + `by`.
  ['ariaLabelledBy', 'ARIA spec'],
  // Public API that apps and older SDK versions depend on. Each gets an
  // American-spelled replacement in a major version, then comes off this list.
  ['isReverificationCancelledError', 'deprecated alias of isReverificationCanceledError'],
  ['reverification_cancelled', 'ClerkRuntimeError code apps compare against'],
  ['passkey_registration_cancelled', 'ClerkRuntimeError code and localization key'],
  ['passkey_retrieval_cancelled', 'ClerkRuntimeError code and localization key'],
  ['SIGN_IN_CANCELLED', 'error code the @clerk/expo-google-signin native modules reject with'],
  ['afterVerificationCancelled', 'prop older @clerk/shared versions pass to @clerk/ui'],
  ['syncStatus__cancelled', 'localization key apps override by name'],
]);

// Generated, released, or not American English on purpose: never respell these.
const GENERATED = [
  /(^|\/)pnpm-lock\.yaml$/, // npm package names (`@img/colour`)
  /(^|\/)CHANGELOG\.md$/, // released notes, written by changesets
  // Translations: en-GB is British on purpose, and the rest aren't English
  // (`Organisation` is German and French).
  /^packages\/localizations\/src\/(?!en-US\.ts$)[a-z]{2}-[A-Z]{2}\.ts$/,
];

// This file and its test list the British forms on purpose.
const SELF = new Set(['scripts/american-spelling.mjs', 'scripts/american-spelling.test.mjs']);

const TEXT_RE = /\.(md|mdx|ts|tsx|js|jsx|mjs|cjs|mts|cts|json|jsonc|ya?ml|css|html|txt|sh)$/i;
// Addresses, not words. Respelling one breaks whatever it points at, so these
// are blanked out before matching:
const ADDRESS_RES = [
  // Anything with a slash: URLs, root-relative and relative paths, link targets,
  // `url(...)` values, and scoped import paths. Prose like `colour/flavour` is
  // skipped too, which is the price of never touching a path.
  /[^\s"'`()<>[\]{},;]*\/[^\s"'`()<>[\]{},;]*/g,
  // Markdown link targets without a slash (`[notes](colour.pdf)`, `[see](#colour)`).
  /(?<=\]\()[^)\s]+/g,
  // Bare file names (`colour-logo.svg`).
  /[\w.-]+\.(?:avif|css|gif|ico|jpe?g|json|m?jsx?|mdx?|png|svg|tsx?|webp|woff2?)\b/g,
  // In-page anchors (`href="#colour"`) and bare package names (`from 'colour'`).
  /(?<=\b(?:href|src)=["'])[^"']+/g,
  /(?<=\b(?:from|import|import\(|require\()\s*["'])[^"']+/g,
  // Markdown reference definitions (`[ref]: #colour`).
  /(?<=^\s*\[[^\]]+\]:\s*)\S+/g,
];
const IDENTIFIER_RE = /[A-Za-z0-9_'-]+/g;
const WORD_RE = /[A-Za-z]+/g;
// camelCase and PascalCase boundaries, including acronyms (`URLParser` → URL, Parser).
const CAMEL_RE = /[A-Z]+(?![a-z])|[A-Z]?[a-z]+/g;

function matchCase(original, replacement) {
  if (original === original.toUpperCase() && original.length > 1) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function exceptionAt(line, index) {
  for (const match of line.matchAll(IDENTIFIER_RE)) {
    if (index < match.index || index >= match.index + match[0].length) {
      continue;
    }
    return EXCEPTIONS.has(match[0].replace(/^['-]+|['-]+$/g, ''));
  }
  return false;
}

// Returns [{ column, found, replacement }] for one line. Addresses are blanked
// out first (same length, so columns hold).
// A marker comment lets the words it names through on the next non-blank line
// only, for spelling we don't own: a direct quotation or a published title. Any
// comment syntax works, word matching ignores case, and a `-- reason` is ignored:
//   {/* american-spelling-ignore-next-line: Towards -- NIST paper title */}
// The colon is required, so prose that only mentions the marker isn't one.
const MARKER_RE = /american-spelling-ignore-next-line:([A-Za-z,\s]*)(?:--[^*}>\n]*)?/gi;

// Returns the lowercased words a marker on this line allows, or null for no marker.
export function markerWords(line) {
  const match = [...line.matchAll(MARKER_RE)][0];
  if (!match) {
    return null;
  }
  return new Set(
    (match[1] ?? '')
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(word => word.toLowerCase()),
  );
}

const blank = text => ' '.repeat(text.length);

export function findInLine(line) {
  const masked = [MARKER_RE, ...ADDRESS_RES].reduce((text, re) => text.replace(re, blank), line);
  const found = [];
  for (const word of masked.matchAll(WORD_RE)) {
    for (const part of word[0].matchAll(CAMEL_RE)) {
      const american = DENYLIST.get(part[0].toLowerCase());
      if (!american) {
        continue;
      }
      const column = word.index + part.index;
      if (exceptionAt(line, column)) {
        continue;
      }
      found.push({ column, found: part[0], replacement: matchCase(part[0], american) });
    }
  }
  return found;
}

// Returns the hits each line still owes after markers, plus any marker that
// names no words or names a word its line doesn't use (so markers can't go stale).
export function checkLines(lines) {
  const hits = [];
  const problems = [];
  let previous = -1; // the last non-blank line, which is where a marker for this line sits
  lines.forEach((line, i) => {
    if (!line.trim()) {
      return;
    }
    const markerLine = previous;
    previous = i;
    const allowed = markerLine >= 0 ? markerWords(lines[markerLine]) : null;
    const used = new Set();
    for (const hit of findInLine(line)) {
      const word = hit.found.toLowerCase();
      if (allowed?.has(word)) {
        used.add(word);
      } else {
        hits.push({ line: i, ...hit });
      }
    }
    if (allowed?.size === 0) {
      problems.push({ line: markerLine, message: 'marker names no words; list the ones to allow' });
    }
    for (const word of allowed ?? []) {
      if (!used.has(word)) {
        problems.push({ line: markerLine, message: `marker allows "${word}", but the next line doesn't use it` });
      }
    }
  });
  // A marker on the last non-blank line has nothing to apply to.
  if (previous >= 0 && markerWords(lines[previous])) {
    problems.push({ line: previous, message: 'marker has no line after it to apply to' });
  }
  return { hits, problems };
}

if (process.argv[1]?.endsWith('american-spelling.mjs')) {
  const fix = process.argv.includes('--fix');
  const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
    .split('\n')
    .filter(file => TEXT_RE.test(file) && !SELF.has(file) && !GENERATED.some(re => re.test(file)));

  const offenders = [];
  const markerProblems = [];
  for (const file of files) {
    let source;
    try {
      source = readFileSync(file, 'utf8');
    } catch {
      continue; // deleted in the working tree but still in the index
    }
    const lines = source.split('\n');
    const { hits, problems } = checkLines(lines);
    for (const problem of problems) {
      markerProblems.push(`${file}:${problem.line + 1}  ${problem.message}`);
    }
    for (const hit of hits) {
      offenders.push(`${file}:${hit.line + 1}:${hit.column + 1}  ${hit.found} → ${hit.replacement}`);
    }
    if (!fix || hits.length === 0) {
      continue;
    }
    // Right to left, so earlier columns on a line stay valid.
    for (const hit of hits.toReversed()) {
      const line = lines[hit.line];
      lines[hit.line] = line.slice(0, hit.column) + hit.replacement + line.slice(hit.column + hit.found.length);
    }
    writeFileSync(file, lines.join('\n'));
  }

  if (markerProblems.length > 0) {
    console.error('Fix these american-spelling-ignore-next-line markers:');
    for (const problem of markerProblems) {
      console.error(`  ${problem}`);
    }
    process.exitCode = 1;
  }

  if (offenders.length > 0 && !fix) {
    console.error('Use American English spelling — see docs/CONTRIBUTING.md.');
    console.error('Run `pnpm lint:american-spelling --fix` to rewrite these, then review the diff.');
    console.error('Offending words:');
    for (const offender of offenders) {
      console.error(`  ${offender}`);
    }
    process.exit(1);
  }

  if (fix) {
    console.log(`Rewrote ${offenders.length} British spellings (${files.length} files scanned).`);
  } else if (!process.exitCode) {
    console.log(`No British spellings (${files.length} files scanned).`);
  }
}
