// @ts-check

/**
 * Modifier tag: keep a dedicated `.mdx` page even when `@inline` is present (TypeDoc + our router otherwise drop inline-marked declarations; the theme also expands references instead of linking).
 */
export const STANDALONE_PAGE_MODIFIER_TAG = '@standalonePage';

/**
 * @param {import('typedoc').Reflection | undefined} reflection
 * @returns {boolean} True when `@inline` should suppress a standalone page / force in-place expansion.
 */
export function isInlineModifierWithoutStandalonePage(reflection) {
  const comment =
    reflection && 'comment' in reflection
      ? /** @type {{ comment?: import('typedoc').Comment | undefined }} */ (reflection).comment
      : undefined;
  if (!comment?.hasModifier('@inline')) {
    return false;
  }
  if (comment.hasModifier(STANDALONE_PAGE_MODIFIER_TAG)) {
    return false;
  }
  return true;
}
