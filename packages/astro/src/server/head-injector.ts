type State =
  | { kind: 'data' }
  | { kind: 'tag-open'; insertAt: number }
  | { kind: 'end-tag-open'; insertAt: number }
  | { kind: 'tag-name'; isEndTag: boolean; name: string; insertAt: number | null }
  | { kind: 'in-tag'; rawTextTag: string | null; hasAttributeName: boolean }
  | { kind: 'before-value'; rawTextTag: string | null }
  | { kind: 'quoted-value'; rawTextTag: string | null; quote: number }
  | { kind: 'unquoted-value'; rawTextTag: string | null }
  | { kind: 'markup-declaration' }
  | { kind: 'markup-declaration-dash' }
  | { kind: 'comment-start' }
  | { kind: 'comment-start-dash' }
  | { kind: 'comment'; dashes: number }
  | { kind: 'comment-end-bang' }
  | { kind: 'bogus-comment' }
  | { kind: 'raw-text'; tag: string }
  | { kind: 'raw-text-less-than'; tag: string }
  | { kind: 'raw-text-end-tag-name'; tag: string; matched: number }
  | { kind: 'done' };

const DATA: State = { kind: 'data' };
const MARKUP_DECLARATION: State = { kind: 'markup-declaration' };
const MARKUP_DECLARATION_DASH: State = { kind: 'markup-declaration-dash' };
const COMMENT_START: State = { kind: 'comment-start' };
const COMMENT_START_DASH: State = { kind: 'comment-start-dash' };
const COMMENT_END_BANG: State = { kind: 'comment-end-bang' };
const BOGUS_COMMENT: State = { kind: 'bogus-comment' };
const DONE: State = { kind: 'done' };

const RAW_TEXT_TAGS = new Set([
  'script',
  'style',
  'textarea',
  'title',
  'noscript',
  'noframes',
  'xmp',
  'iframe',
  'noembed',
  'plaintext',
]);
const MAX_TAG_NAME_LENGTH = 10;

const LESS_THAN = 0x3c;
const GREATER_THAN = 0x3e;
const SLASH = 0x2f;
const BANG = 0x21;
const QUESTION_MARK = 0x3f;
const EQUALS = 0x3d;
const DASH = 0x2d;
const DOUBLE_QUOTE = 0x22;
const SINGLE_QUOTE = 0x27;

const isWhitespace = (c: number) => c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0c || c === 0x0d;
const isAsciiAlpha = (c: number) => (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a);
const toLowerAscii = (c: number) => (c >= 0x41 && c <= 0x5a ? c + 0x20 : c);
const endsTagName = (c: number) => isWhitespace(c) || c === SLASH || c === GREATER_THAN;
const insertionTarget = (isEndTag: boolean) => (isEndTag ? 'head' : 'body');

const tagName = (isEndTag: boolean, c: number, insertAt: number): State => {
  const name = String.fromCharCode(toLowerAscii(c));
  return { kind: 'tag-name', isEndTag, name, insertAt: insertionTarget(isEndTag).startsWith(name) ? insertAt : null };
};
const inTag = (rawTextTag: string | null): State => ({ kind: 'in-tag', rawTextTag, hasAttributeName: false });
const afterTag = (rawTextTag: string | null): State =>
  rawTextTag === 'plaintext' ? DONE : rawTextTag ? { kind: 'raw-text', tag: rawTextTag } : DATA;

function concat(a: Uint8Array, b: Uint8Array) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
}

/**
 * Inserts `payload` once, right before the first real `</head>` end tag, or before the
 * `<body>` start tag when the document omits `</head>`.
 *
 * Tags only count when they are markup. A `</head>` inside an attribute value, a comment, or the
 * text of a script, style, textarea, or title element is content, and inserting there would let
 * that content break out of its context. The scanner follows the HTML tokenizer states that
 * decide this, and carries state across chunks so a tag split between chunks is still found.
 * All the bytes it acts on are ASCII, so it reads UTF-8 bytes without decoding them.
 */
export function createHeadInjector(payload: Uint8Array): TransformStream<Uint8Array, Uint8Array> {
  let state: State = DATA;
  let carry: Uint8Array | null = null;

  return new TransformStream({
    transform(chunk, controller) {
      if (state.kind === 'done') {
        controller.enqueue(chunk);
        return;
      }

      const buffer = carry ? concat(carry, chunk) : chunk;
      let i = carry ? carry.length : 0;
      carry = null;

      for (; i < buffer.length && state.kind !== 'done'; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const c = buffer[i]!;
        switch (state.kind) {
          case 'data':
            if (c === LESS_THAN) {
              state = { kind: 'tag-open', insertAt: i };
            }
            break;
          case 'tag-open':
            if (c === SLASH) {
              state = { kind: 'end-tag-open', insertAt: state.insertAt };
            } else if (c === BANG) {
              state = MARKUP_DECLARATION;
            } else if (c === QUESTION_MARK) {
              state = BOGUS_COMMENT;
            } else if (isAsciiAlpha(c)) {
              state = tagName(false, c, state.insertAt);
            } else {
              state = DATA;
              i--;
            }
            break;
          case 'end-tag-open':
            if (isAsciiAlpha(c)) {
              state = tagName(true, c, state.insertAt);
            } else if (c === GREATER_THAN) {
              state = DATA;
            } else {
              state = BOGUS_COMMENT;
            }
            break;
          case 'tag-name':
            if (endsTagName(c)) {
              if (state.insertAt !== null && state.name === insertionTarget(state.isEndTag)) {
                controller.enqueue(buffer.subarray(0, state.insertAt));
                controller.enqueue(payload);
                controller.enqueue(buffer.subarray(state.insertAt));
                state = DONE;
                return;
              }
              state = inTag(!state.isEndTag && RAW_TEXT_TAGS.has(state.name) ? state.name : null);
              i--;
            } else if (state.name.length < MAX_TAG_NAME_LENGTH) {
              state.name += String.fromCharCode(toLowerAscii(c));
              if (!insertionTarget(state.isEndTag).startsWith(state.name)) {
                state.insertAt = null;
              }
            }
            break;
          case 'in-tag':
            if (c === GREATER_THAN) {
              state = afterTag(state.rawTextTag);
            } else if (c === SLASH) {
              state.hasAttributeName = false;
            } else if (c === EQUALS && state.hasAttributeName) {
              state = { kind: 'before-value', rawTextTag: state.rawTextTag };
            } else if (!isWhitespace(c)) {
              state.hasAttributeName = true;
            }
            break;
          case 'before-value':
            if (c === DOUBLE_QUOTE || c === SINGLE_QUOTE) {
              state = { kind: 'quoted-value', rawTextTag: state.rawTextTag, quote: c };
            } else if (c === GREATER_THAN) {
              state = afterTag(state.rawTextTag);
            } else if (!isWhitespace(c)) {
              state = { kind: 'unquoted-value', rawTextTag: state.rawTextTag };
            }
            break;
          case 'quoted-value':
            if (c === state.quote) {
              state = inTag(state.rawTextTag);
            }
            break;
          case 'unquoted-value':
            if (isWhitespace(c)) {
              state = inTag(state.rawTextTag);
            } else if (c === GREATER_THAN) {
              state = afterTag(state.rawTextTag);
            }
            break;
          case 'markup-declaration':
            if (c === DASH) {
              state = MARKUP_DECLARATION_DASH;
            } else {
              state = BOGUS_COMMENT;
              i--;
            }
            break;
          case 'markup-declaration-dash':
            if (c === DASH) {
              state = COMMENT_START;
            } else {
              state = BOGUS_COMMENT;
              i--;
            }
            break;
          case 'comment-start':
            if (c === GREATER_THAN) {
              state = DATA;
            } else {
              state = c === DASH ? COMMENT_START_DASH : { kind: 'comment', dashes: 0 };
            }
            break;
          case 'comment-start-dash':
            if (c === GREATER_THAN) {
              state = DATA;
            } else {
              state = { kind: 'comment', dashes: c === DASH ? 2 : 0 };
            }
            break;
          case 'comment':
            if (c === GREATER_THAN && state.dashes >= 2) {
              state = DATA;
            } else if (c === BANG && state.dashes >= 2) {
              state = COMMENT_END_BANG;
            } else {
              state.dashes = c === DASH ? state.dashes + 1 : 0;
            }
            break;
          case 'comment-end-bang':
            if (c === GREATER_THAN) {
              state = DATA;
            } else {
              state = { kind: 'comment', dashes: c === DASH ? 1 : 0 };
            }
            break;
          case 'bogus-comment':
            if (c === GREATER_THAN) {
              state = DATA;
            }
            break;
          case 'raw-text':
            if (c === LESS_THAN) {
              state = { kind: 'raw-text-less-than', tag: state.tag };
            }
            break;
          case 'raw-text-less-than':
            if (c === SLASH) {
              state = { kind: 'raw-text-end-tag-name', tag: state.tag, matched: 0 };
            } else {
              state = { kind: 'raw-text', tag: state.tag };
              i--;
            }
            break;
          case 'raw-text-end-tag-name':
            if (state.matched === state.tag.length && endsTagName(c)) {
              state = inTag(null);
              i--;
            } else if (state.matched < state.tag.length && toLowerAscii(c) === state.tag.charCodeAt(state.matched)) {
              state.matched++;
            } else {
              state = { kind: 'raw-text', tag: state.tag };
              i--;
            }
            break;
        }
      }

      if (
        (state.kind === 'tag-open' || state.kind === 'end-tag-open' || state.kind === 'tag-name') &&
        state.insertAt !== null
      ) {
        controller.enqueue(buffer.subarray(0, state.insertAt));
        carry = buffer.slice(state.insertAt);
        state.insertAt = 0;
      } else {
        controller.enqueue(buffer);
      }
    },
    flush(controller) {
      if (carry) {
        controller.enqueue(carry);
      }
    },
  });
}
