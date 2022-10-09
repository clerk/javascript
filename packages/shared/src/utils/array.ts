export const toSentence = (items: string[]): string => {
  // TODO: Once Safari supports it, use Intl.ListFormat
  if (items.length == 0) {
    return '';
  }
  if (items.length == 1) {
    return items[0];
  }
  let sentence = items.slice(0, -1).join(', ');
  sentence += `, or ${items.slice(-1)}`;
  return sentence;
};
