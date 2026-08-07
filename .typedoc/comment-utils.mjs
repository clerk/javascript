// @ts-check
import { Comment } from 'typedoc';

const TODO_WORD = /\bTODO\b/i;

/**
 * @param {import('typedoc').Comment | undefined} comment
 */
function commentContainsTodo(comment) {
  if (!comment) {
    return false;
  }
  const chunks = [];
  if (comment.summary?.length) {
    chunks.push(Comment.combineDisplayParts(comment.summary));
  }
  for (const tag of comment.blockTags ?? []) {
    if (tag.content?.length) {
      chunks.push(Comment.combineDisplayParts(tag.content));
    }
  }
  return chunks.some(text => TODO_WORD.test(text));
}

/**
 * Drop display parts from the first `TODO` onward; truncate the containing text part if `TODO` appears mid-string.
 *
 * @param {import('typedoc').CommentDisplayPart[] | undefined} parts
 * @returns {import('typedoc').CommentDisplayPart[]}
 */
function stripTodoFromDisplayParts(parts) {
  if (!parts?.length) {
    return parts ?? [];
  }
  /** @type {import('typedoc').CommentDisplayPart[]} */
  const out = [];
  for (const p of parts) {
    if (p.kind === 'text' && 'text' in p && typeof p.text === 'string') {
      const match = TODO_WORD.exec(p.text);
      if (match) {
        const before = p.text.slice(0, match.index).trimEnd();
        if (before.length) {
          out.push(/** @type {import('typedoc').CommentDisplayPart} */ ({ kind: 'text', text: before }));
        }
        return out;
      }
    }
    out.push(p);
  }
  return out;
}

/**
 * Returns a clone with `TODO` and everything after it removed from the summary and from any block tag that contains `TODO`.
 * Comments without `TODO` are returned unchanged (same reference). Undefined in, undefined out.
 *
 * @param {import('typedoc').Comment | undefined} comment
 * @returns {import('typedoc').Comment | undefined}
 */
export function applyTodoStrippingToComment(comment) {
  if (!comment) {
    return undefined;
  }
  if (!commentContainsTodo(comment)) {
    return comment;
  }
  const c = comment.clone();
  if (c.summary?.length && TODO_WORD.test(Comment.combineDisplayParts(c.summary))) {
    c.summary = stripTodoFromDisplayParts(c.summary);
  }
  for (const tag of c.blockTags ?? []) {
    if (tag.content?.length && TODO_WORD.test(Comment.combineDisplayParts(tag.content))) {
      tag.content = stripTodoFromDisplayParts(tag.content);
    }
  }
  return c;
}
