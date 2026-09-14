import { transform } from '../transforms';
import type { MessageFormatHandlers, MessageFormatPart } from '../types';

export type { MessageFormatPart } from '../types';

/**
 * A resolved `messageFormat` message. Callable for the string path
 * (`m.notice({ name })`), and carries its parsed `parts` so the React adapter
 * can render markup as real elements instead of strings.
 */
export interface RichText {
  (handlers?: MessageFormatHandlers): string;
  readonly parts: MessageFormatPart[];
}

/** A flat, value-resolved part. `{$x}` is substituted; markup stays structural. */
export type ResolvedPart =
  | { type: 'text'; value: string }
  | { type: 'markup'; kind: 'open' | 'close' | 'standalone'; name: string };

// Matches the MF2 token types in a single pass.
//   vr={$name}  open={#tag}  close={/tag}  alone={#tag/}
const MF_RE = /(?<vr>{\$\w+})|(?<open>{#\w+})|(?<close>{\/\w+})|(?<alone>{#\w+\/})/g;

/** Tokenize an MF2-style translation string into text, variable, and markup parts. */
export function getMessageFormatParts(translation: string): MessageFormatPart[] {
  const matches = [...translation.matchAll(MF_RE)];
  if (!matches.length) {
    return [{ type: 'text', value: translation }];
  }

  const parts: MessageFormatPart[] = [];
  let pos = 0;

  for (const m of matches) {
    const index = m.index ?? 0;
    if (index > pos) {
      parts.push({ type: 'text', value: translation.slice(pos, index) });
    }

    const groups = m.groups ?? {};
    if (groups.vr) {
      parts.push({ type: 'string', name: m[0].slice(2, -1) });
    } else if (groups.open) {
      parts.push({ type: 'markup', kind: 'open', name: m[0].slice(2, -1) });
    } else if (groups.close) {
      parts.push({ type: 'markup', kind: 'close', name: m[0].slice(2, -1) });
    } else {
      parts.push({ type: 'markup', kind: 'standalone', name: m[0].slice(2, -2) });
    }

    pos = index + m[0].length;
  }

  if (pos < translation.length) {
    parts.push({ type: 'text', value: translation.slice(pos) });
  }
  return parts;
}

/** Resolve a `{$var}` / standalone substitution: a string is inserted, a function is called. */
function resolveValue(handler: MessageFormatHandlers[string] | undefined, inner?: string): string {
  if (typeof handler === 'function') {
    return handler(inner);
  }
  return handler ?? '';
}

/**
 * Visitor that folds the token stream into values of type `T`. Each consumer
 * (string renderer, React renderer, …) supplies one; the traversal itself lives
 * once, in {@link walk}.
 */
export interface WalkVisitor<T> {
  /** Literal text between tokens. */
  text(value: string): T;
  /** A `{$name}` variable. */
  value(name: string): T;
  /**
   * A `{#tag}…{/tag}` (`open`, with already-folded `children`) or `{#tag/}`
   * (`standalone`, no children) markup node. `index` is the token's position,
   * suitable for use as a stable React key.
   */
  markup(kind: 'open' | 'standalone', name: string, children: T[], index: number): T;
}

/**
 * Single recursive fold over a parsed token stream, shared by every renderer.
 * Walks from `start`, recursing into each `{#tag}…{/tag}` range and stopping at
 * the close tag named `stopTag`; stray close tags are skipped. The traversal and
 * its edge cases live here once — consumers only decide how parts combine via
 * the {@link WalkVisitor}. Returns the folded items and the index just past the
 * consumed range.
 */
export function walk<T>(
  parts: MessageFormatPart[],
  start: number,
  stopTag: string | undefined,
  visitor: WalkVisitor<T>,
): { items: T[]; next: number } {
  const items: T[] = [];
  let i = start;

  while (i < parts.length) {
    const p = parts[i];

    if (p.type === 'text') {
      items.push(visitor.text(p.value));
      i++;
    } else if (p.type === 'string') {
      items.push(visitor.value(p.name));
      i++;
    } else if (p.kind === 'standalone') {
      items.push(visitor.markup('standalone', p.name, [], i));
      i++;
    } else if (p.kind === 'close') {
      if (p.name === stopTag) {
        return { items, next: i + 1 };
      }
      i++; // stray close — skip
    } else {
      // open: fold the inner range, then let the visitor combine it.
      const inner = walk(parts, i + 1, p.name, visitor);
      items.push(visitor.markup('open', p.name, inner.items, i));
      i = inner.next;
    }
  }

  return { items, next: i };
}

/**
 * Render an MF2-style message. The template is parsed once at definition time
 * and captured in the closure; the returned `RichText` is called per render.
 * Markup nesting is supported on both the string and React paths.
 */
export const messageFormat = transform<RichText>((_locale, translation) => {
  const parts = getMessageFormatParts(translation);
  const format = (handlers?: MessageFormatHandlers): string =>
    walk<string>(parts, 0, undefined, {
      text: value => value,
      value: name => resolveValue(handlers?.[name]),
      markup: (kind, name, children) => {
        const handler = handlers?.[name];
        // Standalone has no children — preserve the original resolveValue path.
        if (kind === 'standalone') {
          return resolveValue(handler);
        }
        return typeof handler === 'function' ? handler(children.join('')) : children.join('');
      },
    }).items.join('');
  return Object.assign(format, { parts });
});

/**
 * Resolve a message to a flat list of parts with `{$x}` substituted from
 * `values`. Markup is left structural for a renderer (e.g. React) to fold.
 */
export function formatToParts(message: RichText, values?: Record<string, string | number>): ResolvedPart[] {
  return message.parts.map(p => {
    if (p.type === 'text') {
      return { type: 'text', value: p.value };
    }
    if (p.type === 'string') {
      return { type: 'text', value: String(values?.[p.name] ?? '') };
    }
    return { type: 'markup', kind: p.kind, name: p.name };
  });
}
