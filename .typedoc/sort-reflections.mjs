// @ts-check

/**
 * Sort required reflections before optional reflections, then alphabetically within each group.
 *
 * @param {{ name: string; flags?: { isOptional?: boolean } }} a
 * @param {{ name: string; flags?: { isOptional?: boolean } }} b
 */
export function compareRequiredFirstThenAlphabetical(a, b) {
  const optionalOrder = Number(Boolean(a.flags?.isOptional)) - Number(Boolean(b.flags?.isOptional));
  return optionalOrder || a.name.localeCompare(b.name);
}
