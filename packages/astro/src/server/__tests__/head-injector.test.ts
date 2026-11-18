import { describe, expect, it } from 'vitest';

import { createHeadInjector } from '../head-injector';

const MARK = '<!--clerk-->';
const encoder = new TextEncoder();

async function inject(chunks: Uint8Array[]) {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(chunk));
      controller.close();
    },
  });
  return new Response(body.pipeThrough(createHeadInjector(encoder.encode(MARK)))).text();
}

function splits(html: string) {
  const bytes = encoder.encode(html);
  const results: Array<{ label: string; chunks: Uint8Array[] }> = [
    { label: 'one chunk', chunks: [bytes] },
    { label: 'one byte per chunk', chunks: Array.from(bytes, b => Uint8Array.of(b)) },
  ];
  for (let k = 1; k < bytes.length; k++) {
    results.push({ label: `split at ${k}`, chunks: [bytes.slice(0, k), bytes.slice(k)] });
  }
  return results;
}

const cases: Array<{ name: string; input: string; expected: string }> = [
  {
    name: 'skips </head> in a double-quoted attribute',
    input: '<head><meta content="a> </head><p>x</p>"></head>',
    expected: `<head><meta content="a> </head><p>x</p>">${MARK}</head>`,
  },
  {
    name: 'skips </head> in a single-quoted attribute',
    input: "<head><meta content = 'a\"> </head>'></head>",
    expected: `<head><meta content = 'a"> </head>'>${MARK}</head>`,
  },
  {
    name: 'skips </head> in a comment',
    input: '<head><!-- a> </head> --></head>',
    expected: `<head><!-- a> </head> -->${MARK}</head>`,
  },
  {
    name: 'treats <!--> as an empty comment',
    input: '<head><!--></head>',
    expected: `<head><!-->${MARK}</head>`,
  },
  {
    name: 'ends a comment at --!>',
    input: '<head><!-- x --!><meta content="--> </head>"></head>',
    expected: `<head><!-- x --!><meta content="--> </head>">${MARK}</head>`,
  },
  {
    name: 'does not end a comment at <!--!>',
    input: '<head><!--!> </head> --></head>',
    expected: `<head><!--!> </head> -->${MARK}</head>`,
  },
  {
    name: 'treats </> as an ignored tag',
    input: '<head></><meta content="a> </head>"></head>',
    expected: `<head></><meta content="a> </head>">${MARK}</head>`,
  },
  {
    name: 'skips </head> in a <? bogus comment',
    input: '<head><? </head> ?></head>',
    expected: `<head><? </head> ?>${MARK}</head>`,
  },
  {
    name: 'skips </head> in script, style, textarea, and title text',
    input:
      '<head><script>"</head>"</script><style>a{content:"</head>"}</style><textarea></head></textarea><title>héllo 👋 </head></title></head>',
    expected: `<head><script>"</head>"</script><style>a{content:"</head>"}</style><textarea></head></textarea><title>héllo 👋 </head></title>${MARK}</head>`,
  },
  {
    name: 'skips </head> in noscript, noframes, xmp, iframe, and noembed text',
    input:
      '<head><noscript> </head></noscript><noframes> </head></noframes><xmp> </head></xmp><iframe> </head></iframe><noembed> </head></noembed></head>',
    expected: `<head><noscript> </head></noscript><noframes> </head></noframes><xmp> </head></xmp><iframe> </head></iframe><noembed> </head></noembed>${MARK}</head>`,
  },
  {
    name: 'stops at <plaintext>, since nothing after it is markup',
    input: '<head><plaintext></plaintext></head><body>',
    expected: '<head><plaintext></plaintext></head><body>',
  },
  {
    name: 'leaves raw text only at the matching end tag, in any case',
    input: '<head><script>"</scripts></head>"</SCRIPT ></HEAD>',
    expected: `<head><script>"</scripts></head>"</SCRIPT >${MARK}</HEAD>`,
  },
  {
    name: 'starts a new attribute name after /',
    input: '<head><meta a/=" > </head>">',
    expected: `<head><meta a/=" > ${MARK}</head>">`,
  },
  {
    name: 'treats quotes inside an unquoted value as text',
    input: '<head><meta a=b"c=" > </head>',
    expected: `<head><meta a=b"c=" > ${MARK}</head>`,
  },
  {
    name: 'ignores end tags that are a prefix or an extension of head',
    input: '<head></hea></header></head>',
    expected: `<head></hea></header>${MARK}</head>`,
  },
  {
    name: 'inserts before <body> when there is no </head>',
    input: '<html><head><title>t</title><body></body>',
    expected: `<html><head><title>t</title>${MARK}<body></body>`,
  },
  {
    name: 'inserts once when there are two </head> tags',
    input: '<head></head></head>',
    expected: `<head>${MARK}</head></head>`,
  },
  {
    name: 'passes through a document that ends inside a possible </head>',
    input: '<p>hello</p></hea',
    expected: '<p>hello</p></hea',
  },
];

describe('createHeadInjector', () => {
  it.each(cases)('$name', async ({ input, expected }) => {
    for (const { label, chunks } of splits(input)) {
      expect(await inject(chunks), label).toBe(expected);
    }
  });
});
