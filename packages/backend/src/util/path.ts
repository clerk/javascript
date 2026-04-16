const SEPARATOR = '/';
const MULTIPLE_SEPARATOR_REGEX = new RegExp('(?<!:)' + SEPARATOR + '{1,}', 'g');

type PathString = string | null | undefined;

function isDotSegment(segment: string): boolean {
  let decoded: string;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    decoded = segment;
  }
  return decoded === '.' || decoded === '..';
}

export function joinPaths(...args: PathString[]): string {
  const result = args
    .filter(p => p)
    .join(SEPARATOR)
    .replace(MULTIPLE_SEPARATOR_REGEX, SEPARATOR);

  for (const segment of result.split(SEPARATOR)) {
    if (isDotSegment(segment)) {
      throw new Error(`joinPaths: "." and ".." path segments are not allowed (received "${result}")`);
    }
  }

  return result;
}
