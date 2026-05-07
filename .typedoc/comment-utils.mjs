// @ts-check
import { Comment } from 'typedoc';

const TODO_IN_COMMENT = /\bTODO\b/i;

/**
 * @param {import('typedoc').Comment | undefined} comment
 */
export function commentContainsTodo(comment) {
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
  return chunks.some(text => TODO_IN_COMMENT.test(text));
}
