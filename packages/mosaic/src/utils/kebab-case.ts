export function kebabCase(value: string): string {
  return words(value)
    .map(word => word.toLowerCase())
    .join('-');
}

const CASE_SPLIT_PATTERN =
  /\p{Lu}?\p{Ll}+|[0-9]+|\p{Lu}+(?!\p{Ll})|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{L}+/gu;

function words(value: string): string[] {
  return Array.from(value.match(CASE_SPLIT_PATTERN) ?? []);
}
