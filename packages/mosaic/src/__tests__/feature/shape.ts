function kind(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  return Array.isArray(value) ? 'array' : typeof value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return kind(value) === 'object';
}

export function shapeDifferences(expected: unknown, actual: unknown, path = ''): string[] {
  if (kind(expected) !== kind(actual)) {
    return [`${path}: expected ${kind(expected)}, got ${kind(actual)}`];
  }
  if (Array.isArray(expected) && Array.isArray(actual)) {
    return expected.length && actual.length ? shapeDifferences(expected[0], actual[0], `${path}[]`) : [];
  }
  if (!isRecord(expected) || !isRecord(actual)) {
    return [];
  }
  const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
  return keys.flatMap(key => {
    const childPath = path ? `${path}.${key}` : key;
    if (!(key in actual)) {
      return [`${childPath}: missing`];
    }
    if (!(key in expected)) {
      return [`${childPath}: unexpected`];
    }
    return shapeDifferences(expected[key], actual[key], childPath);
  });
}
