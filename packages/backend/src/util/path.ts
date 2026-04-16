const SEPARATOR = '/';
const MULTIPLE_SEPARATOR_REGEX = new RegExp('(?<!:)' + SEPARATOR + '{1,}', 'g');

type PathString = string | null | undefined;

function isDotSegment(segment: string): boolean {
  let candidate = segment;
  for (let i = 0; i < 3; i++) {
    // After decoding, check if any slash-separated part is a dot segment
    if (candidate.split(/[/\\]/).some(p => p === '.' || p === '..')) {
      return true;
    }
    try {
      const next = decodeURIComponent(candidate);
      if (next === candidate) {
        break;
      } // stable — no more encoding
      candidate = next;
    } catch {
      break;
    }
  }
  return false;
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
