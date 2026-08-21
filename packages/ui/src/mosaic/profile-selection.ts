export function toggleVisibleSelection(selectedIds: readonly string[], visibleIds: readonly string[]): string[] {
  const visibleIdSet = new Set(visibleIds);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));

  return allVisibleSelected
    ? selectedIds.filter(id => !visibleIdSet.has(id))
    : [...new Set([...selectedIds, ...visibleIds])];
}
