const SEPARATOR = '/';
const MULTIPLE_SEPARATOR_REGEX = new RegExp(SEPARATOR + '{1,}', 'g');

type PathString = string | null | undefined;

export function joinPaths(a: PathString, b: PathString): string {
  return [a, b]
    .filter(p => p)
    .join(SEPARATOR)
    .replace(MULTIPLE_SEPARATOR_REGEX, SEPARATOR);
}
