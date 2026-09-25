/**
 * The one ordering rule every list a consumer can reorder follows: the ids `order` names lead, in
 * the order it names them, and whatever it leaves out keeps its default place behind them.
 *
 * A name matching no item is dropped rather than held open, since which items a surface carries
 * depends on how it was configured and naming one it has not got is ordinary rather than a mistake.
 * Two items sharing an id are one item: the first wins, so a consumer's own row shadows the built-in
 * it was given the name of instead of both answering to it.
 */
export function applyOrder<T>(
  order: readonly string[] | undefined,
  items: readonly T[],
  idOf: (item: T) => string,
): T[] {
  const unique = items.filter((item, index, all) => all.findIndex(other => idOf(other) === idOf(item)) === index);
  if (!order?.length) {
    return unique;
  }

  const named = [...new Set(order)].flatMap(id => unique.filter(item => idOf(item) === id));
  return [...named, ...unique.filter(item => !named.includes(item))];
}
